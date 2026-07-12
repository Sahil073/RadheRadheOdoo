/*
 * Seeds the MongoDB database with demo data mirroring the original frontend
 * fixtures (frontend/src/data/seed.js), so the app has realistic data the
 * moment you log in — including trips at every stage of their lifecycle
 * (Draft -> Dispatched -> Completed / Cancelled).
 *
 * Run with: npm run seed
 * Safe to re-run — it upserts by natural unique key (email / registration
 * number / license number) instead of blindly inserting duplicates.
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB, disconnectDB } = require("../config/db");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");
const MaintenanceLog = require("../models/MaintenanceLog");
const FuelLog = require("../models/FuelLog");
const Expense = require("../models/Expense");

const DEMO_PASSWORD = "password123";

async function upsertUser(data) {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  return User.findOneAndUpdate(
    { email: data.email },
    { ...data, password },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertVehicle(data) {
  return Vehicle.findOneAndUpdate({ registration_number: data.registration_number }, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
}

async function upsertDriver(data) {
  return Driver.findOneAndUpdate({ license_number: data.license_number }, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
}

async function run() {
  await connectDB();

  console.log("Clearing existing fleet data for a clean demo dataset...");
  await Promise.all([
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    Trip.deleteMany({}),
    MaintenanceLog.deleteMany({}),
    FuelLog.deleteMany({}),
    Expense.deleteMany({}),
  ]);

  console.log("Seeding users...");
  await upsertUser({ name: "Sam Fleet", email: "manager@transitops.io", role_name: "Fleet Manager" });
  await upsertUser({ name: "Priya Raman", email: "driver@transitops.io", role_name: "Driver" });
  await upsertUser({ name: "Ivy Marshall", email: "safety@transitops.io", role_name: "Safety Officer" });
  await upsertUser({ name: "Owen Cruz", email: "finance@transitops.io", role_name: "Financial Analyst" });
  await upsertUser({ name: "Admin User", email: "admin@transitops.io", role_name: "Admin" });
  console.log(`   Demo password for all seeded users: ${DEMO_PASSWORD}`);

  console.log("Seeding vehicles...");
  // Statuses are set to match the trips below: van1 & drv1 finished a trip
  // (Available again), van2 & drv2 are mid-trip (On Trip), pickup is In Shop,
  // trailer is Available but unused, reefer is Retired, van2b was on the
  // cancelled trip (Available again).
  const van1 = await upsertVehicle({
    registration_number: "DL-9F 4109",
    vehicle_name: "Van-05",
    vehicle_type: "Van",
    max_load_capacity: 500,
    odometer: 42150,
    acquisition_cost: 850000,
    status: "Available",
    region: "North Hub",
  });
  const truck1 = await upsertVehicle({
    registration_number: "DL-3P 8842",
    vehicle_name: "Truck-14",
    vehicle_type: "Truck",
    max_load_capacity: 3200,
    odometer: 128400,
    acquisition_cost: 2400000,
    status: "On Trip",
    region: "South Hub",
  });
  const pickup1 = await upsertVehicle({
    registration_number: "MH-04 KL21",
    vehicle_name: "Pickup-02",
    vehicle_type: "Pickup",
    max_load_capacity: 900,
    odometer: 76200,
    acquisition_cost: 1100000,
    status: "In Shop",
    region: "East Hub",
  });
  const trailer1 = await upsertVehicle({
    registration_number: "KA-05 MC77",
    vehicle_name: "Trailer-09",
    vehicle_type: "Trailer",
    max_load_capacity: 8000,
    odometer: 210500,
    acquisition_cost: 3600000,
    status: "Available",
    region: "West Hub",
  });
  await upsertVehicle({
    registration_number: "TN-22 BH03",
    vehicle_name: "Reefer-01",
    vehicle_type: "Refrigerated Truck",
    max_load_capacity: 2400,
    odometer: 15200,
    acquisition_cost: 3100000,
    status: "Retired",
    region: "North Hub",
  });
  const van2 = await upsertVehicle({
    registration_number: "GJ-01 QX56",
    vehicle_name: "Van-11",
    vehicle_type: "Van",
    max_load_capacity: 550,
    odometer: 9800,
    acquisition_cost: 900000,
    status: "Available",
    region: "South Hub",
  });

  console.log("Seeding drivers...");
  const drv1 = await upsertDriver({
    name: "Alex Menon",
    license_number: "DL-0420190004321",
    license_category: "LMV",
    license_expiry_date: new Date("2027-03-14"),
    contact_number: "+91 98200 11223",
    safety_score: 92,
    status: "Available",
  });
  const drv2 = await upsertDriver({
    name: "Priya Raman",
    license_number: "MH-1420150089213",
    license_category: "HMV",
    license_expiry_date: new Date("2026-08-02"),
    contact_number: "+91 90040 55667",
    safety_score: 88,
    status: "On Trip",
  });
  const drv3 = await upsertDriver({
    name: "Farhan Sheikh",
    license_number: "KA-0320180071122",
    license_category: "HGMV",
    license_expiry_date: new Date("2026-07-25"),
    contact_number: "+91 99870 33221",
    safety_score: 74,
    status: "Available",
  });
  await upsertDriver({
    name: "Neha Kulkarni",
    license_number: "GJ-0120210099887",
    license_category: "LMV",
    license_expiry_date: new Date("2026-01-11"),
    contact_number: "+91 91234 44556",
    safety_score: 65,
    status: "Suspended",
  });
  const drv5 = await upsertDriver({
    name: "Ravi Teja",
    license_number: "TN-2220170065544",
    license_category: "Trailer",
    license_expiry_date: new Date("2028-05-30"),
    contact_number: "+91 93456 77889",
    safety_score: 96,
    status: "Off Duty",
  });

  console.log("Seeding trips (full lifecycle: Draft -> Dispatched -> Completed / Cancelled)...");
  {
    await Trip.create([
      // Dispatched: truck1 + drv2 are currently On Trip (see vehicle/driver statuses above).
      {
        source: "Andheri Depot",
        destination: "Pune Hub",
        vehicle_id: truck1._id,
        driver_id: drv2._id,
        cargo_weight: 2800,
        planned_distance: 165,
        status: "Dispatched",
        dispatched_at: new Date("2026-07-10T08:30:00Z"),
        created_at: new Date("2026-07-10T08:00:00Z"),
      },
      // Draft: not yet dispatched, trailer1 + drv5 still Available/Off Duty.
      {
        source: "Whitefield Yard",
        destination: "Chennai Port",
        vehicle_id: trailer1._id,
        driver_id: drv5._id,
        cargo_weight: 6100,
        planned_distance: 340,
        status: "Draft",
        created_at: new Date("2026-07-11T06:15:00Z"),
      },
      // Completed: van1 + drv1 finished their run and are back to Available.
      {
        source: "Karol Bagh Hub",
        destination: "Jaipur Warehouse",
        vehicle_id: van1._id,
        driver_id: drv1._id,
        cargo_weight: 450,
        planned_distance: 280,
        status: "Completed",
        created_at: new Date("2026-07-08T09:00:00Z"),
        dispatched_at: new Date("2026-07-08T09:15:00Z"),
        completed_at: new Date("2026-07-08T16:40:00Z"),
        final_odometer: 42150,
        fuel_consumed_liters: 28,
      },
      // Cancelled: van2 + drv3 — trip never went out, both remained Available.
      {
        source: "Malad Depot",
        destination: "Surat Yard",
        vehicle_id: van2._id,
        driver_id: drv3._id,
        cargo_weight: 300,
        planned_distance: 300,
        status: "Cancelled",
        created_at: new Date("2026-07-06T10:45:00Z"),
        cancelled_at: new Date("2026-07-06T11:00:00Z"),
      },
    ]);
  }

  console.log("Seeding maintenance logs...");
  {
    await MaintenanceLog.create([
      {
        vehicle_id: pickup1._id,
        maintenance_type: "Oil Change",
        description: "Scheduled service + brake pad inspection",
        cost: 4200,
        start_date: new Date("2026-07-09T09:00:00Z"),
        status: "Active",
      },
      {
        vehicle_id: truck1._id,
        maintenance_type: "Tyre Replacement",
        description: "Rear tyre wear beyond threshold",
        cost: 18500,
        start_date: new Date("2026-06-20T09:00:00Z"),
        end_date: new Date("2026-06-24T09:00:00Z"),
        status: "Completed",
      },
    ]);
  }

  console.log("Seeding fuel logs...");
  {
    await FuelLog.create([
      { vehicle_id: van1._id, date: new Date("2026-07-08"), liters: 28, cost: 3080, odometer: 42150 },
      { vehicle_id: truck1._id, date: new Date("2026-07-10"), liters: 96, cost: 10560, odometer: 128400 },
      { vehicle_id: trailer1._id, date: new Date("2026-07-05"), liters: 210, cost: 23100, odometer: 210500 },
    ]);
  }

  console.log("Seeding expenses...");
  {
    await Expense.create([
      { vehicle_id: van1._id, expense_type: "Toll", amount: 640, date: new Date("2026-07-08"), description: "Mumbai-Pune expressway" },
      { vehicle_id: truck1._id, expense_type: "Fine", amount: 1500, date: new Date("2026-07-09"), description: "Overweight check" },
      { vehicle_id: trailer1._id, expense_type: "Permit", amount: 2200, date: new Date("2026-07-05"), description: "Interstate permit renewal" },
    ]);
  }

  console.log("✅ Seed complete");
  await disconnectDB();
  process.exit(0);
}

run().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
