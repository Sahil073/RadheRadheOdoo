/* 
Purpose of seed.sql:

Insert default roles for RBAC
Add demo users for testing login
Add sample vehicles
Add sample drivers
Add sample data for testing trips, maintenance, fuel, expenses
*/

-- =====================================
-- INSERT ROLES
-- =====================================

INSERT INTO roles(role_name)
VALUES
('Admin'),
('Fleet Manager'),
('Driver'),
('Safety Officer'),
('Financial Analyst')
ON CONFLICT DO NOTHING;



-- =====================================
-- INSERT USERS
-- Passwords are bcrypt examples
-- Use register API for real users
-- =====================================


INSERT INTO users
(
name,
email,
password,
role_id
)

VALUES

(
'Admin User',
'admin@transitops.com',
'$2b$10$abcdefghijklmnopqrstuv',
1
),

(
'Fleet Manager',
'fleet@transitops.com',
'$2b$10$abcdefghijklmnopqrstuv',
2
)

ON CONFLICT(email)
DO NOTHING;





-- =====================================
-- INSERT VEHICLES
-- =====================================


INSERT INTO vehicles
(
registration_number,
vehicle_name,
vehicle_type,
max_load_capacity,
odometer,
acquisition_cost,
status
)

VALUES

(
'UP16AB1234',
'Tata Ace',
'Mini Truck',
750,
20000,
600000,
'Available'
),


(
'DL01XY5678',
'Ashok Leyland Dost',
'Truck',
1500,
45000,
1200000,
'Available'
),


(
'UP14CD7890',
'Mahindra Bolero',
'Pickup',
1000,
30000,
900000,
'In Shop'
)


ON CONFLICT(registration_number)
DO NOTHING;





-- =====================================
-- INSERT DRIVERS
-- =====================================


INSERT INTO drivers
(
name,
license_number,
license_category,
license_expiry_date,
contact_number,
safety_score,
status
)

VALUES


(
'Rahul Sharma',
'DL123456',
'Heavy Vehicle',
'2027-12-31',
'9876543210',
90,
'Available'
),



(
'Amit Kumar',
'DL789012',
'Commercial',
'2026-10-31',
'9876501234',
85,
'Available'
),



(
'Ravi Singh',
'DL345678',
'Heavy Vehicle',
'2025-01-01',
'9876540000',
70,
'Suspended'
)


ON CONFLICT(license_number)
DO NOTHING;





-- =====================================
-- INSERT SAMPLE TRIPS
-- =====================================


INSERT INTO trips
(
source,
destination,
vehicle_id,
driver_id,
cargo_weight,
planned_distance,
status
)

VALUES

(
'Mathura',
'Delhi',
1,
1,
500,
180,
'Draft'
),


(
'Agra',
'Noida',
2,
2,
1000,
220,
'Draft'
);





-- =====================================
-- INSERT MAINTENANCE LOG
-- =====================================


INSERT INTO maintenance_logs
(
vehicle_id,
maintenance_type,
description,
cost,
start_date,
status
)

VALUES

(
3,
'Engine Service',
'Engine oil and filter replacement',
15000,
CURRENT_DATE,
'Active'
);





-- =====================================
-- INSERT FUEL LOGS
-- =====================================


INSERT INTO fuel_logs
(
vehicle_id,
liters,
cost,
date,
distance
)

VALUES


(
1,
50,
5000,
CURRENT_DATE,
180
),


(
2,
70,
7000,
CURRENT_DATE,
250
);





-- =====================================
-- INSERT EXPENSES
-- =====================================


INSERT INTO expenses
(
vehicle_id,
expense_type,
amount,
date,
description
)

VALUES


(
1,
'Toll',
500,
CURRENT_DATE,
'Highway toll charges'
),


(
2,
'Repair',
3000,
CURRENT_DATE,
'Minor repair'
);