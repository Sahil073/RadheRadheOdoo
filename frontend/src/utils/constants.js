// Central enums shared across the app. Keeping these in one place makes it
// trivial to keep the future backend's enum values in sync with the UI.

export const ROLES = {
  FLEET_MANAGER: "Fleet Manager",
  DRIVER: "Driver",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
};

export const ROLE_LIST = Object.values(ROLES);

// Which roles can access which top-level nav sections / actions.
export const ROLE_PERMISSIONS = {
  [ROLES.FLEET_MANAGER]: ["dashboard", "fleet", "drivers", "trips", "maintenance", "fuel", "analytics", "settings"],
  [ROLES.DRIVER]: ["dashboard", "trips"],
  [ROLES.SAFETY_OFFICER]: ["dashboard", "drivers", "trips", "settings"],
  [ROLES.FINANCIAL_ANALYST]: ["dashboard", "fuel", "analytics"],
};

export const VEHICLE_STATUS = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
};

export const VEHICLE_TYPES = ["Van", "Truck", "Pickup", "Trailer", "Refrigerated Truck"];

export const DRIVER_STATUS = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  OFF_DUTY: "Off Duty",
  SUSPENDED: "Suspended",
};

export const LICENSE_CATEGORIES = ["LMV", "HMV", "MC", "HGMV", "Trailer"];

export const TRIP_STATUS = {
  DRAFT: "Draft",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const MAINTENANCE_STATUS = {
  OPEN: "Open",
  CLOSED: "Closed",
};

export const EXPENSE_CATEGORIES = ["Toll", "Parking", "Fine", "Insurance", "Permit", "Other"];

export const REGIONS = ["North Hub", "South Hub", "East Hub", "West Hub"];

export function statusTone(status) {
  switch (status) {
    case VEHICLE_STATUS.AVAILABLE:
    case DRIVER_STATUS.AVAILABLE:
    case TRIP_STATUS.COMPLETED:
    case MAINTENANCE_STATUS.CLOSED:
      return "success";
    case VEHICLE_STATUS.ON_TRIP:
    case DRIVER_STATUS.ON_TRIP:
    case TRIP_STATUS.DISPATCHED:
      return "info";
    case VEHICLE_STATUS.IN_SHOP:
    case MAINTENANCE_STATUS.OPEN:
    case TRIP_STATUS.DRAFT:
      return "warning";
    case VEHICLE_STATUS.RETIRED:
    case DRIVER_STATUS.SUSPENDED:
    case DRIVER_STATUS.OFF_DUTY:
    case TRIP_STATUS.CANCELLED:
      return "destructive";
    default:
      return "secondary";
  }
}
