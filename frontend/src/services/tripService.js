import * as storage from "./storage";
import { seedTrips } from "@/data/seed";
import { TRIP_STATUS, VEHICLE_STATUS, DRIVER_STATUS } from "@/utils/constants";
import { setVehicleStatus, isDispatchable } from "./vehicleService";
import { setDriverStatus, isAssignable } from "./driverService";

const COLLECTION = "trips";

storage.seedIfEmpty(COLLECTION, seedTrips);

export async function listTrips() {
  return storage.getAll(COLLECTION);
}

export async function createTrip(input, { vehicle } = {}) {
  if (vehicle && Number(input.cargoKg) > Number(vehicle.maxLoadKg)) {
    throw new Error(`Cargo weight (${input.cargoKg}kg) exceeds vehicle capacity (${vehicle.maxLoadKg}kg).`);
  }
  const record = {
    id: storage.makeId("trp"),
    status: TRIP_STATUS.DRAFT,
    createdAt: new Date().toISOString(),
    ...input,
  };
  return storage.insert(COLLECTION, record);
}

// Dispatching a trip moves both vehicle and driver to "On Trip".
export async function dispatchTrip(trip, { vehicle, driver }) {
  if (!isDispatchable(vehicle)) {
    throw new Error("Vehicle is not available for dispatch.");
  }
  if (!isAssignable(driver)) {
    throw new Error("Driver is not eligible for dispatch (suspended, expired license, or already on trip).");
  }
  await setVehicleStatus(vehicle.id, VEHICLE_STATUS.ON_TRIP);
  await setDriverStatus(driver.id, DRIVER_STATUS.ON_TRIP);
  return storage.update(COLLECTION, trip.id, { status: TRIP_STATUS.DISPATCHED, dispatchedAt: new Date().toISOString() });
}

// Completing a trip restores both vehicle and driver to Available.
export async function completeTrip(trip, { vehicleId, driverId, finalOdometer, fuelConsumedL }) {
  await setVehicleStatus(vehicleId, VEHICLE_STATUS.AVAILABLE);
  await setDriverStatus(driverId, DRIVER_STATUS.AVAILABLE);
  return storage.update(COLLECTION, trip.id, {
    status: TRIP_STATUS.COMPLETED,
    completedAt: new Date().toISOString(),
    finalOdometer,
    fuelConsumedL,
  });
}

// Cancelling a dispatched trip restores vehicle and driver to Available.
export async function cancelTrip(trip, { vehicleId, driverId }) {
  if (trip.status === TRIP_STATUS.DISPATCHED) {
    await setVehicleStatus(vehicleId, VEHICLE_STATUS.AVAILABLE);
    await setDriverStatus(driverId, DRIVER_STATUS.AVAILABLE);
  }
  return storage.update(COLLECTION, trip.id, { status: TRIP_STATUS.CANCELLED, cancelledAt: new Date().toISOString() });
}
