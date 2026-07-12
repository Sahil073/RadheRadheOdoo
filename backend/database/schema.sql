-- =========================
-- ROLES
-- =========================

CREATE TABLE roles(
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);



-- =========================
-- USERS
-- =========================

CREATE TABLE users(

    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role_id INT REFERENCES roles(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================
-- VEHICLES
-- =========================

CREATE TABLE vehicles(

    id SERIAL PRIMARY KEY,

    registration_number VARCHAR(50)
        UNIQUE NOT NULL,

    vehicle_name VARCHAR(100),

    vehicle_type VARCHAR(50),

    max_load_capacity DECIMAL NOT NULL
        CHECK(max_load_capacity > 0),

    odometer INT DEFAULT 0,

    acquisition_cost DECIMAL DEFAULT 0,

    status VARCHAR(20)
        DEFAULT 'Available'
        CHECK(
            status IN
            (
            'Available',
            'On Trip',
            'In Shop',
            'Retired'
            )
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- DRIVERS
-- =========================

CREATE TABLE drivers(

    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    license_number VARCHAR(100)
        UNIQUE NOT NULL,

    license_category VARCHAR(50),

    license_expiry_date DATE,

    contact_number VARCHAR(20),

    safety_score INT DEFAULT 0
        CHECK(
            safety_score BETWEEN 0 AND 100
        ),

    status VARCHAR(20)
        DEFAULT 'Available'
        CHECK(
            status IN
            (
            'Available',
            'On Trip',
            'Off Duty',
            'Suspended'
            )
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- TRIPS
-- =========================

CREATE TABLE trips(

    id SERIAL PRIMARY KEY,


    source VARCHAR(100) NOT NULL,


    destination VARCHAR(100) NOT NULL,


    vehicle_id INT
        REFERENCES vehicles(id)
        ON DELETE RESTRICT,


    driver_id INT
        REFERENCES drivers(id)
        ON DELETE RESTRICT,


    cargo_weight DECIMAL NOT NULL
        CHECK(cargo_weight > 0),


    planned_distance DECIMAL
        CHECK(planned_distance > 0),


    status VARCHAR(20)
        DEFAULT 'Draft'
        CHECK(
            status IN
            (
            'Draft',
            'Dispatched',
            'Completed',
            'Cancelled'
            )
        ),


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- MAINTENANCE LOGS
-- =========================

CREATE TABLE maintenance_logs(

    id SERIAL PRIMARY KEY,


    vehicle_id INT
        REFERENCES vehicles(id)
        ON DELETE CASCADE,


    maintenance_type VARCHAR(100),


    description TEXT,


    cost DECIMAL DEFAULT 0,


    start_date DATE,


    end_date DATE,


    status VARCHAR(20)
        DEFAULT 'Active'
        CHECK(
            status IN
            (
            'Active',
            'Completed'
            )
        )


);



-- =========================
-- FUEL LOGS
-- =========================

CREATE TABLE fuel_logs(

    id SERIAL PRIMARY KEY,


    vehicle_id INT
        REFERENCES vehicles(id)
        ON DELETE CASCADE,


    liters DECIMAL
        CHECK(liters > 0),


    cost DECIMAL
        CHECK(cost >=0),


    date DATE DEFAULT CURRENT_DATE,


    distance DECIMAL
        CHECK(distance >=0)

);



-- =========================
-- EXPENSES
-- =========================

CREATE TABLE expenses(

    id SERIAL PRIMARY KEY,


    vehicle_id INT
        REFERENCES vehicles(id)
        ON DELETE CASCADE,


    expense_type VARCHAR(100),


    amount DECIMAL
        CHECK(amount >=0),


    date DATE DEFAULT CURRENT_DATE,


    description TEXT

);



-- =========================
-- INDEXES
-- =========================


CREATE INDEX idx_vehicle_status
ON vehicles(status);



CREATE INDEX idx_driver_status
ON drivers(status);



CREATE INDEX idx_trip_status
ON trips(status);



CREATE INDEX idx_trip_vehicle
ON trips(vehicle_id);



CREATE INDEX idx_trip_driver
ON trips(driver_id);