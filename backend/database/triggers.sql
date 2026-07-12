/* 
It will handle:

✅ Cargo weight cannot exceed vehicle capacity
✅ Vehicle cannot be dispatched if unavailable
✅ Driver cannot be assigned if unavailable
✅ Dispatch → Vehicle + Driver status becomes "On Trip"
✅ Complete trip → Vehicle + Driver become "Available"
✅ Cancel trip → Vehicle + Driver become "Available"
✅ Maintenance creation → Vehicle becomes "In Shop"
✅ Maintenance completion → Vehicle becomes "Available"
*/

-- ============================================
-- 1. VALIDATE TRIP BEFORE INSERT
-- ============================================

CREATE OR REPLACE FUNCTION validate_trip()
RETURNS TRIGGER
AS $$

DECLARE

vehicle_capacity DECIMAL;
vehicle_status VARCHAR(20);
driver_status VARCHAR(20);
driver_expiry DATE;

BEGIN


-- Get vehicle details

SELECT 
max_load_capacity,
status

INTO
vehicle_capacity,
vehicle_status

FROM vehicles

WHERE id = NEW.vehicle_id;



-- Check vehicle exists

IF vehicle_capacity IS NULL THEN

RAISE EXCEPTION 
'Vehicle does not exist';

END IF;



-- Check vehicle availability

IF vehicle_status <> 'Available' THEN

RAISE EXCEPTION
'Vehicle is not available';

END IF;



-- Cargo validation

IF NEW.cargo_weight > vehicle_capacity THEN

RAISE EXCEPTION
'Cargo weight exceeds vehicle maximum capacity';

END IF;



-- Driver details

SELECT 
status,
license_expiry_date

INTO
driver_status,
driver_expiry

FROM drivers

WHERE id = NEW.driver_id;



-- Check driver status

IF driver_status <> 'Available' THEN

RAISE EXCEPTION
'Driver is not available';

END IF;



-- License validation

IF driver_expiry < CURRENT_DATE THEN

RAISE EXCEPTION
'Driver license has expired';

END IF;



RETURN NEW;


END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER before_trip_insert

BEFORE INSERT ON trips

FOR EACH ROW

EXECUTE FUNCTION validate_trip();





-- ============================================
-- 2. DISPATCH TRIP STATUS UPDATE
-- ============================================


CREATE OR REPLACE FUNCTION dispatch_trip_update()

RETURNS TRIGGER

AS $$

BEGIN


IF NEW.status='Dispatched'
AND OLD.status <> 'Dispatched'

THEN



UPDATE vehicles

SET status='On Trip'

WHERE id=NEW.vehicle_id;



UPDATE drivers

SET status='On Trip'

WHERE id=NEW.driver_id;



END IF;



RETURN NEW;


END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER after_trip_dispatch

AFTER UPDATE OF status ON trips

FOR EACH ROW

EXECUTE FUNCTION dispatch_trip_update();





-- ============================================
-- 3. COMPLETE / CANCEL TRIP
-- ============================================


CREATE OR REPLACE FUNCTION restore_after_trip()

RETURNS TRIGGER

AS $$

BEGIN


IF 
NEW.status IN ('Completed','Cancelled')

AND OLD.status='Dispatched'

THEN



UPDATE vehicles

SET status='Available'

WHERE id=NEW.vehicle_id;



UPDATE drivers

SET status='Available'

WHERE id=NEW.driver_id;



END IF;



RETURN NEW;


END;

$$ LANGUAGE plpgsql;




CREATE TRIGGER after_trip_complete_cancel

AFTER UPDATE OF status ON trips

FOR EACH ROW

EXECUTE FUNCTION restore_after_trip();






-- ============================================
-- 4. MAINTENANCE CREATION
-- Vehicle becomes In Shop
-- ============================================


CREATE OR REPLACE FUNCTION start_vehicle_maintenance()

RETURNS TRIGGER

AS $$

BEGIN



UPDATE vehicles

SET status='In Shop'

WHERE id=NEW.vehicle_id;



RETURN NEW;


END;

$$ LANGUAGE plpgsql;




CREATE TRIGGER after_maintenance_create

AFTER INSERT ON maintenance_logs

FOR EACH ROW

EXECUTE FUNCTION start_vehicle_maintenance();






-- ============================================
-- 5. CLOSE MAINTENANCE
-- Vehicle becomes Available
-- ============================================


CREATE OR REPLACE FUNCTION close_vehicle_maintenance()

RETURNS TRIGGER

AS $$

BEGIN



IF NEW.status='Completed'
AND OLD.status='Active'

THEN


UPDATE vehicles

SET status='Available'

WHERE id=NEW.vehicle_id
AND status <> 'Retired';



END IF;



RETURN NEW;


END;

$$ LANGUAGE plpgsql;





CREATE TRIGGER after_maintenance_complete

AFTER UPDATE OF status ON maintenance_logs

FOR EACH ROW

EXECUTE FUNCTION close_vehicle_maintenance();





-- ============================================
-- 6. PREVENT RETIRED VEHICLE USAGE
-- ============================================


CREATE OR REPLACE FUNCTION prevent_retired_vehicle()

RETURNS TRIGGER

AS $$

DECLARE

vehicle_status VARCHAR(20);


BEGIN


SELECT status

INTO vehicle_status

FROM vehicles

WHERE id=NEW.vehicle_id;



IF vehicle_status='Retired'

THEN

RAISE EXCEPTION
'Retired vehicles cannot be assigned';

END IF;



RETURN NEW;


END;

$$ LANGUAGE plpgsql;




CREATE TRIGGER check_vehicle_retired

BEFORE INSERT OR UPDATE ON trips

FOR EACH ROW

EXECUTE FUNCTION prevent_retired_vehicle();