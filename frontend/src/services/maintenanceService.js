import * as storage from "./storage";
import { seedMaintenance } from "@/data/seed";
import { MAINTENANCE_STATUS, VEHICLE_STATUS } from "@/utils/constants";
import { setVehicleStatus } from "./vehicleService";

const COLLECTION = "maintenance";

storage.seedIfEmpty(COLLECTION, seedMaintenance);

export async function listMaintenance() {
  return storage.getAll(COLLECTION);
}

// Creating an active maintenance record automatically switches the vehicle to "In Shop".
export async function openMaintenance(input) {
  const record = {
    id: storage.makeId("mnt"),
    status: MAINTENANCE_STATUS.OPEN,
    openedAt: new Date().toISOString(),
    closedAt: null,
    ...input,
  };
  await setVehicleStatus(input.vehicleId, VEHICLE_STATUS.IN_SHOP);
  return storage.insert(COLLECTION, record);
}

// Closing maintenance restores the vehicle to Available (unless it was retired).
export async function closeMaintenance(id, vehicle) {
  const updated = await storage.update(COLLECTION, id, {
    status: MAINTENANCE_STATUS.CLOSED,
    closedAt: new Date().toISOString(),
  });
  if (vehicle && vehicle.status !== VEHICLE_STATUS.RETIRED) {
    await setVehicleStatus(vehicle.id, VEHICLE_STATUS.AVAILABLE);
  }
  return updated;
}
