import { apiClient } from "./apiClient";
import { VEHICLE_STATUS } from "@/utils/constants";

function toFrontend(v) {
  if (!v) return v;
  return {
    id: v.id,
    regNumber: v.registration_number,
    name: v.vehicle_name,
    type: v.vehicle_type,
    maxLoadKg: v.max_load_capacity,
    odometer: v.odometer,
    acquisitionCost: v.acquisition_cost,
    status: v.status,
    region: v.region,
  };
}

function toBackendCreate(input) {
  return {
    registration_number: input.regNumber,
    vehicle_name: input.name,
    vehicle_type: input.type,
    max_load_capacity: input.maxLoadKg,
    odometer: input.odometer,
    acquisition_cost: input.acquisitionCost,
    region: input.region,
  };
}

function toBackendPatch(patch) {
  const map = {
    name: "vehicle_name",
    type: "vehicle_type",
    odometer: "odometer",
    acquisitionCost: "acquisition_cost",
    status: "status",
    region: "region",
  };
  const out = {};
  for (const [key, value] of Object.entries(patch)) {
    if (map[key]) out[map[key]] = value;
  }
  return out;
}

export async function listVehicles() {
  const vehicles = await apiClient.get("/vehicles");
  return vehicles.map(toFrontend);
}

export async function createVehicle(input) {
  const created = await apiClient.post("/vehicles", toBackendCreate(input));
  return toFrontend(created);
}

export async function updateVehicle(id, patch) {
  const updated = await apiClient.put(`/vehicles/${id}`, toBackendPatch(patch));
  return toFrontend(updated);
}

export async function setVehicleStatus(id, status) {
  return updateVehicle(id, { status });
}

export async function deleteVehicle(id) {
  return apiClient.del(`/vehicles/${id}`);
}

// Vehicles eligible for dispatch: never Retired or In Shop, never already On Trip.
export function isDispatchable(vehicle) {
  return vehicle.status === VEHICLE_STATUS.AVAILABLE;
}
