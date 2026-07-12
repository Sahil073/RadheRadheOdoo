import { apiClient } from "./apiClient";
import { DRIVER_STATUS } from "@/utils/constants";

function toFrontend(d) {
  if (!d) return d;
  return {
    id: d.id,
    name: d.name,
    licenseNumber: d.license_number,
    licenseCategory: d.license_category,
    licenseExpiry: d.license_expiry_date,
    contact: d.contact_number,
    safetyScore: d.safety_score,
    status: d.status,
  };
}

export async function listDrivers() {
  const drivers = await apiClient.get("/drivers");
  return drivers.map(toFrontend);
}

export async function createDriver(input) {
  const created = await apiClient.post("/drivers", {
    name: input.name,
    license_number: input.licenseNumber,
    license_category: input.licenseCategory,
    license_expiry_date: input.licenseExpiry,
    contact_number: input.contact,
    safety_score: input.safetyScore,
  });
  return toFrontend(created);
}

export async function updateDriver(id, patch) {
  const map = {
    name: "name",
    licenseCategory: "license_category",
    contact: "contact_number",
    status: "status",
    safetyScore: "safety_score",
  };
  const body = {};
  for (const [key, value] of Object.entries(patch)) {
    if (map[key]) body[map[key]] = value;
  }
  const updated = await apiClient.put(`/drivers/${id}`, body);
  return toFrontend(updated);
}

export async function setDriverStatus(id, status) {
  return updateDriver(id, { status });
}

export async function deleteDriver(id) {
  return apiClient.del(`/drivers/${id}`);
}

export function isLicenseExpired(driver) {
  if (!driver.licenseExpiry) return false;
  return new Date(driver.licenseExpiry).getTime() < Date.now();
}

// Drivers eligible for dispatch: Available, not suspended, not expired license.
export function isAssignable(driver) {
  return driver.status === DRIVER_STATUS.AVAILABLE && !isLicenseExpired(driver);
}
