import { apiClient } from "./apiClient";

function fuelToFrontend(f) {
  if (!f) return f;
  return {
    id: f.id,
    vehicleId: f.vehicle_id,
    date: f.date,
    liters: f.liters,
    cost: f.cost,
    odometer: f.odometer,
  };
}

function expenseToFrontend(e) {
  if (!e) return e;
  return {
    id: e.id,
    vehicleId: e.vehicle_id,
    category: e.expense_type,
    amount: e.amount,
    date: e.date,
    notes: e.description,
  };
}

export async function listFuelLogs() {
  const logs = await apiClient.get("/fuel");
  return logs.map(fuelToFrontend);
}

export async function addFuelLog(input) {
  const created = await apiClient.post("/fuel", {
    vehicle_id: input.vehicleId,
    date: input.date,
    liters: input.liters,
    cost: input.cost,
    odometer: input.odometer,
  });
  return fuelToFrontend(created);
}

export async function listExpenses() {
  const logs = await apiClient.get("/expenses");
  return logs.map(expenseToFrontend);
}

export async function addExpense(input) {
  const created = await apiClient.post("/expenses", {
    vehicle_id: input.vehicleId,
    expense_type: input.category,
    amount: input.amount,
    date: input.date,
    description: input.notes,
  });
  return expenseToFrontend(created);
}

// Total operational cost per vehicle = sum(fuel cost) + sum(maintenance cost) [+ other expenses]
export function operationalCostByVehicle(vehicleId, { fuelLogs, maintenance, expenses }) {
  const fuel = fuelLogs.filter((f) => f.vehicleId === vehicleId).reduce((sum, f) => sum + Number(f.cost || 0), 0);
  const maint = maintenance.filter((m) => m.vehicleId === vehicleId).reduce((sum, m) => sum + Number(m.cost || 0), 0);
  const other = expenses.filter((e) => e.vehicleId === vehicleId).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  return { fuel, maintenance: maint, other, total: fuel + maint + other };
}
