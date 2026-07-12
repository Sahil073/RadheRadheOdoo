import * as storage from "./storage";
import { seedVehicles } from "@/data/seed";
import { VEHICLE_STATUS } from "@/utils/constants";

const COLLECTION = "vehicles";

storage.seedIfEmpty(COLLECTION, seedVehicles);

export async function listVehicles() {
  return storage.getAll(COLLECTION);
}

export async function createVehicle(input) {
  const vehicles = await storage.getAll(COLLECTION);
  const regExists = vehicles.some((v) => v.regNumber.trim().toLowerCase() === input.regNumber.trim().toLowerCase());
  if (regExists) {
    throw new Error("Registration number must be unique.");
  }
  const record = {
    id: storage.makeId("veh"),
    status: VEHICLE_STATUS.AVAILABLE,
    ...input,
  };
  return storage.insert(COLLECTION, record);
}

export async function updateVehicle(id, patch) {
  return storage.update(COLLECTION, id, patch);
}

export async function setVehicleStatus(id, status) {
  return storage.update(COLLECTION, id, { status });
}

export async function deleteVehicle(id) {
  return storage.remove(COLLECTION, id);
}

// Vehicles eligible for dispatch: never Retired or In Shop, never already On Trip.
export function isDispatchable(vehicle) {
  return vehicle.status === VEHICLE_STATUS.AVAILABLE;
}
