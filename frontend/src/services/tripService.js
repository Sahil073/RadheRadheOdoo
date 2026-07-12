import { apiClient } from "./apiClient";

function toFrontend(t) {
  if (!t) return t;
  return {
    id: t.id,
    source: t.source,
    destination: t.destination,
    vehicleId: t.vehicle_id,
    driverId: t.driver_id,
    cargoKg: t.cargo_weight,
    plannedKm: t.planned_distance,
    status: t.status,
    createdAt: t.created_at,
    dispatchedAt: t.dispatched_at,
    completedAt: t.completed_at,
    cancelledAt: t.cancelled_at,
    finalOdometer: t.final_odometer,
    fuelConsumedL: t.fuel_consumed_liters,
  };
}

export async function listTrips() {
  const trips = await apiClient.get("/trips");
  return trips.map(toFrontend);
}

export async function createTrip(input, { vehicle } = {}) {
  if (vehicle && Number(input.cargoKg) > Number(vehicle.maxLoadKg)) {
    throw new Error(`Cargo weight (${input.cargoKg}kg) exceeds vehicle capacity (${vehicle.maxLoadKg}kg).`);
  }
  const created = await apiClient.post("/trips", {
    source: input.source,
    destination: input.destination,
    vehicle_id: input.vehicleId,
    driver_id: input.driverId,
    cargo_weight: input.cargoKg,
    planned_distance: input.plannedKm,
  });
  return toFrontend(created);
}

// Dispatching a trip moves both vehicle and driver to "On Trip" (handled
// server-side, inside a transaction, together with the trip's own status).
export async function dispatchTrip(trip) {
  const { trip: updated } = await apiClient.patch(`/trips/${trip.id}/dispatch`);
  return toFrontend(updated);
}

// Completing a trip restores both vehicle and driver to Available (server-side).
export async function completeTrip(trip, { finalOdometer, fuelConsumedL } = {}) {
  const { trip: updated } = await apiClient.patch(`/trips/${trip.id}/complete`, {
    final_odometer: finalOdometer,
    fuel_consumed_liters: fuelConsumedL,
  });
  return toFrontend(updated);
}

// Cancelling a dispatched trip restores vehicle and driver to Available (server-side).
export async function cancelTrip(trip) {
  const { trip: updated } = await apiClient.patch(`/trips/${trip.id}/cancel`);
  return toFrontend(updated);
}
