const express = require("express");
const router = express.Router();

const {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
} = require("../controllers/vehicle.controller");

const {requireAuth, requireRole}=require("../middleware/auth");


// View vehicles
router.get(
"/",
requireAuth,
getVehicles
);


// Single vehicle
router.get(
"/:id",
requireAuth,
getVehicleById
);


// Add vehicle
router.post(
"/",
requireAuth,
requireRole("Fleet Manager"),
createVehicle
);


// Update vehicle
router.put(
"/:id",
requireAuth,
requireRole("Fleet Manager"),
updateVehicle
);


// Retire vehicle
router.delete(
"/:id",
requireAuth,
requireRole("Fleet Manager"),
deleteVehicle
);


module.exports=router;