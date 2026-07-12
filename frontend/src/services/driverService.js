import * as storage from "./storage";
import { seedDrivers } from "@/data/seed";
import { DRIVER_STATUS } from "@/utils/constants";

const COLLECTION = "drivers";

storage.seedIfEmpty(COLLECTION, seedDrivers);

export async function listDrivers() {
  return storage.getAll(COLLECTION);
}

export async function createDriver(input) {
  const record = {
    id: storage.makeId("drv"),
    status: DRIVER_STATUS.AVAILABLE,
    safetyScore: 100,
    ...input,
  };
  return storage.insert(COLLECTION, record);
}

export async function updateDriver(id, patch) {
  return storage.update(COLLECTION, id, patch);
}

export async function setDriverStatus(id, status) {
  return storage.update(COLLECTION, id, { status });
}

export async function deleteDriver(id) {
  return storage.remove(COLLECTION, id);
}

export function isLicenseExpired(driver) {
  if (!driver.licenseExpiry) return false;
  return new Date(driver.licenseExpiry).getTime() < Date.now();
}

// Drivers eligible for dispatch: Available, not suspended, not expired license.
export function isAssignable(driver) {
  return driver.status === DRIVER_STATUS.AVAILABLE && !isLicenseExpired(driver);
}
