import { apiClient } from "./apiClient";
import { MAINTENANCE_STATUS } from "@/utils/constants";

// Backend statuses are Active/Completed; the UI speaks Open/Closed.
const STATUS_TO_FRONTEND = { Active: MAINTENANCE_STATUS.OPEN, Completed: MAINTENANCE_STATUS.CLOSED };

function toFrontend(m) {
  if (!m) return m;
  return {
    id: m.id,
    vehicleId: m.vehicle_id,
    type: m.maintenance_type,
    notes: m.description,
    cost: m.cost,
    openedAt: m.start_date,
    closedAt: m.end_date,
    status: STATUS_TO_FRONTEND[m.status] || m.status,
  };
}

export async function listMaintenance() {
  const logs = await apiClient.get("/maintenance");
  return logs.map(toFrontend);
}

// Creating an active maintenance record automatically switches the vehicle
// to "In Shop" (handled server-side, inside a transaction).
export async function openMaintenance(input) {
  const created = await apiClient.post("/maintenance", {
    vehicle_id: input.vehicleId,
    maintenance_type: input.type,
    description: input.notes,
    cost: input.cost,
    start_date: new Date().toISOString(),
  });
  return toFrontend(created);
}

// Closing maintenance restores the vehicle to Available (unless it was
// retired) — handled server-side, inside a transaction.
export async function closeMaintenance(id) {
  const { log } = await apiClient.patch(`/maintenance/${id}/close`);
  return toFrontend(log);
}
