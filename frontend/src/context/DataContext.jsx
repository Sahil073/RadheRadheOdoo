import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as vehicleService from "@/services/vehicleService";
import * as driverService from "@/services/driverService";
import * as tripService from "@/services/tripService";
import * as maintenanceService from "@/services/maintenanceService";
import * as fuelExpenseService from "@/services/fuelExpenseService";
import { useAuth } from "@/context/AuthContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [v, d, t, m, f, e] = await Promise.all([
      vehicleService.listVehicles(),
      driverService.listDrivers(),
      tripService.listTrips(),
      maintenanceService.listMaintenance(),
      fuelExpenseService.listFuelLogs(),
      fuelExpenseService.listExpenses(),
    ]);
    setVehicles(v);
    setDrivers(d);
    setTrips(t);
    setMaintenance(m);
    setFuelLogs(f);
    setExpenses(e);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      // Logged out: clear any previous session's data instead of calling
      // authenticated endpoints (avoids noisy 401s on the login screen).
      setVehicles([]);
      setDrivers([]);
      setTrips([]);
      setMaintenance([]);
      setFuelLogs([]);
      setExpenses([]);
      setLoading(false);
      return;
    }
    refreshAll();
  }, [user, refreshAll]);

  const findVehicle = useCallback((id) => vehicles.find((v) => v.id === id), [vehicles]);
  const findDriver = useCallback((id) => drivers.find((d) => d.id === id), [drivers]);

  // --- Vehicles ---
  const createVehicle = useCallback(async (input) => {
    await vehicleService.createVehicle(input);
    await refreshAll();
  }, [refreshAll]);

  const updateVehicle = useCallback(async (id, patch) => {
    await vehicleService.updateVehicle(id, patch);
    await refreshAll();
  }, [refreshAll]);

  // --- Drivers ---
  const createDriver = useCallback(async (input) => {
    await driverService.createDriver(input);
    await refreshAll();
  }, [refreshAll]);

  const updateDriver = useCallback(async (id, patch) => {
    await driverService.updateDriver(id, patch);
    await refreshAll();
  }, [refreshAll]);

  // --- Trips ---
  const createTrip = useCallback(async (input) => {
    const vehicle = findVehicle(input.vehicleId);
    await tripService.createTrip(input, { vehicle });
    await refreshAll();
  }, [findVehicle, refreshAll]);

  const dispatchTrip = useCallback(async (trip) => {
    await tripService.dispatchTrip(trip);
    await refreshAll();
  }, [refreshAll]);

  const completeTrip = useCallback(async (trip, payload) => {
    await tripService.completeTrip(trip, payload);
    await refreshAll();
  }, [refreshAll]);

  const cancelTrip = useCallback(async (trip) => {
    await tripService.cancelTrip(trip);
    await refreshAll();
  }, [refreshAll]);

  // --- Maintenance ---
  const openMaintenance = useCallback(async (input) => {
    await maintenanceService.openMaintenance(input);
    await refreshAll();
  }, [refreshAll]);

  const closeMaintenance = useCallback(async (record) => {
    await maintenanceService.closeMaintenance(record.id);
    await refreshAll();
  }, [refreshAll]);

  // --- Fuel & Expenses ---
  const addFuelLog = useCallback(async (input) => {
    await fuelExpenseService.addFuelLog(input);
    await refreshAll();
  }, [refreshAll]);

  const addExpense = useCallback(async (input) => {
    await fuelExpenseService.addExpense(input);
    await refreshAll();
  }, [refreshAll]);

  const costForVehicle = useCallback(
    (vehicleId) => fuelExpenseService.operationalCostByVehicle(vehicleId, { fuelLogs, maintenance, expenses }),
    [fuelLogs, maintenance, expenses]
  );

  const value = useMemo(
    () => ({
      loading,
      vehicles,
      drivers,
      trips,
      maintenance,
      fuelLogs,
      expenses,
      findVehicle,
      findDriver,
      createVehicle,
      updateVehicle,
      createDriver,
      updateDriver,
      createTrip,
      dispatchTrip,
      completeTrip,
      cancelTrip,
      openMaintenance,
      closeMaintenance,
      addFuelLog,
      addExpense,
      costForVehicle,
      refreshAll,
    }),
    [
      loading,
      vehicles,
      drivers,
      trips,
      maintenance,
      fuelLogs,
      expenses,
      findVehicle,
      findDriver,
      createVehicle,
      updateVehicle,
      createDriver,
      updateDriver,
      createTrip,
      dispatchTrip,
      completeTrip,
      cancelTrip,
      openMaintenance,
      closeMaintenance,
      addFuelLog,
      addExpense,
      costForVehicle,
      refreshAll,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
