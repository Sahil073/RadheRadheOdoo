import * as storage from "./storage";
import { seedFuelLogs, seedExpenses } from "@/data/seed";

const FUEL_COLLECTION = "fuelLogs";
const EXPENSE_COLLECTION = "expenses";

storage.seedIfEmpty(FUEL_COLLECTION, seedFuelLogs);
storage.seedIfEmpty(EXPENSE_COLLECTION, seedExpenses);

export async function listFuelLogs() {
  return storage.getAll(FUEL_COLLECTION);
}

export async function addFuelLog(input) {
  const record = { id: storage.makeId("fuel"), ...input };
  return storage.insert(FUEL_COLLECTION, record);
}

export async function listExpenses() {
  return storage.getAll(EXPENSE_COLLECTION);
}

export async function addExpense(input) {
  const record = { id: storage.makeId("exp"), ...input };
  return storage.insert(EXPENSE_COLLECTION, record);
}

// Total operational cost per vehicle = sum(fuel cost) + sum(maintenance cost) [+ other expenses]
export function operationalCostByVehicle(vehicleId, { fuelLogs, maintenance, expenses }) {
  const fuel = fuelLogs.filter((f) => f.vehicleId === vehicleId).reduce((sum, f) => sum + Number(f.cost || 0), 0);
  const maint = maintenance.filter((m) => m.vehicleId === vehicleId).reduce((sum, m) => sum + Number(m.cost || 0), 0);
  const other = expenses.filter((e) => e.vehicleId === vehicleId).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  return { fuel, maintenance: maint, other, total: fuel + maint + other };
}
