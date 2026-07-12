import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS, MAINTENANCE_STATUS, REGIONS } from "@/utils/constants";

export const seedVehicles = [
  { id: "veh_1", regNumber: "DL-9F 4109", name: "Van-05", type: "Van", maxLoadKg: 500, odometer: 42150, acquisitionCost: 850000, status: VEHICLE_STATUS.AVAILABLE, region: REGIONS[0] },
  { id: "veh_2", regNumber: "DL-3P 8842", name: "Truck-14", type: "Truck", maxLoadKg: 3200, odometer: 128400, acquisitionCost: 2400000, status: VEHICLE_STATUS.ON_TRIP, region: REGIONS[1] },
  { id: "veh_3", regNumber: "MH-04 KL21", name: "Pickup-02", type: "Pickup", maxLoadKg: 900, odometer: 76200, acquisitionCost: 1100000, status: VEHICLE_STATUS.IN_SHOP, region: REGIONS[2] },
  { id: "veh_4", regNumber: "KA-05 MC77", name: "Trailer-09", type: "Trailer", maxLoadKg: 8000, odometer: 210500, acquisitionCost: 3600000, status: VEHICLE_STATUS.AVAILABLE, region: REGIONS[3] },
  { id: "veh_5", regNumber: "TN-22 BH03", name: "Reefer-01", type: "Refrigerated Truck", maxLoadKg: 2400, odometer: 15200, acquisitionCost: 3100000, status: VEHICLE_STATUS.RETIRED, region: REGIONS[0] },
  { id: "veh_6", regNumber: "GJ-01 QX56", name: "Van-11", type: "Van", maxLoadKg: 550, odometer: 9800, acquisitionCost: 900000, status: VEHICLE_STATUS.AVAILABLE, region: REGIONS[1] },
];

export const seedDrivers = [
  { id: "drv_1", name: "Alex Menon", licenseNumber: "DL-0420190004321", licenseCategory: "LMV", licenseExpiry: "2027-03-14", contact: "+91 98200 11223", safetyScore: 92, status: DRIVER_STATUS.AVAILABLE },
  { id: "drv_2", name: "Priya Raman", licenseNumber: "MH-1420150089213", licenseCategory: "HMV", licenseExpiry: "2026-08-02", contact: "+91 90040 55667", safetyScore: 88, status: DRIVER_STATUS.ON_TRIP },
  { id: "drv_3", name: "Farhan Sheikh", licenseNumber: "KA-0320180071122", licenseCategory: "HGMV", licenseExpiry: "2026-07-25", contact: "+91 99870 33221", safetyScore: 74, status: DRIVER_STATUS.AVAILABLE },
  { id: "drv_4", name: "Neha Kulkarni", licenseNumber: "GJ-0120210099887", licenseCategory: "LMV", licenseExpiry: "2026-01-11", contact: "+91 91234 44556", safetyScore: 65, status: DRIVER_STATUS.SUSPENDED },
  { id: "drv_5", name: "Ravi Teja", licenseNumber: "TN-2220170065544", licenseCategory: "Trailer", licenseExpiry: "2028-05-30", contact: "+91 93456 77889", safetyScore: 96, status: DRIVER_STATUS.OFF_DUTY },
];

export const seedTrips = [
  { id: "trp_1", source: "Andheri Depot", destination: "Pune Hub", vehicleId: "veh_2", driverId: "drv_2", cargoKg: 2800, plannedKm: 165, status: TRIP_STATUS.DISPATCHED, createdAt: "2026-07-10T08:30:00Z" },
  { id: "trp_2", source: "Whitefield Yard", destination: "Chennai Port", vehicleId: "veh_4", driverId: "drv_5", cargoKg: 6100, plannedKm: 340, status: TRIP_STATUS.DRAFT, createdAt: "2026-07-11T06:15:00Z" },
  { id: "trp_3", source: "Karol Bagh Hub", destination: "Jaipur Warehouse", vehicleId: "veh_1", driverId: "drv_1", cargoKg: 450, plannedKm: 280, status: TRIP_STATUS.COMPLETED, createdAt: "2026-07-08T09:00:00Z", finalOdometer: 42150, fuelConsumedL: 28 },
  { id: "trp_4", source: "Malad Depot", destination: "Surat Yard", vehicleId: "veh_6", driverId: "drv_3", cargoKg: 300, plannedKm: 300, status: TRIP_STATUS.CANCELLED, createdAt: "2026-07-06T10:45:00Z" },
];

export const seedMaintenance = [
  { id: "mnt_1", vehicleId: "veh_3", type: "Oil Change", notes: "Scheduled service + brake pad inspection", openedAt: "2026-07-09T09:00:00Z", closedAt: null, cost: 4200, status: MAINTENANCE_STATUS.OPEN },
  { id: "mnt_2", vehicleId: "veh_2", type: "Tyre Replacement", notes: "Rear tyre wear beyond threshold", openedAt: "2026-06-20T09:00:00Z", closedAt: "2026-06-24T09:00:00Z", cost: 18500, status: MAINTENANCE_STATUS.CLOSED },
];

export const seedFuelLogs = [
  { id: "fuel_1", vehicleId: "veh_1", date: "2026-07-08", liters: 28, cost: 3080, odometer: 42150 },
  { id: "fuel_2", vehicleId: "veh_2", date: "2026-07-10", liters: 96, cost: 10560, odometer: 128400 },
  { id: "fuel_3", vehicleId: "veh_4", date: "2026-07-05", liters: 210, cost: 23100, odometer: 210500 },
];

export const seedExpenses = [
  { id: "exp_1", vehicleId: "veh_1", category: "Toll", amount: 640, date: "2026-07-08", notes: "Mumbai-Pune expressway" },
  { id: "exp_2", vehicleId: "veh_2", category: "Fine", amount: 1500, date: "2026-07-09", notes: "Overweight check" },
  { id: "exp_3", vehicleId: "veh_4", category: "Permit", amount: 2200, date: "2026-07-05", notes: "Interstate permit renewal" },
];

export const seedUsers = [
  { id: "usr_1", name: "Sam Fleet", email: "manager@transitops.io", password: "password123", role: "Fleet Manager" },
  { id: "usr_2", name: "Priya Raman", email: "driver@transitops.io", password: "password123", role: "Driver" },
  { id: "usr_3", name: "Ivy Marshall", email: "safety@transitops.io", password: "password123", role: "Safety Officer" },
  { id: "usr_4", name: "Owen Cruz", email: "finance@transitops.io", password: "password123", role: "Financial Analyst" },
];
