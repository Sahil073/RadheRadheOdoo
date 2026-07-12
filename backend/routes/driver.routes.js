const express=require("express");
const router=express.Router();


const {
getDrivers,
createDriver,
updateDriver,
deleteDriver
}=require("../controllers/driver.controller");


const {requireAuth}=require("../middleware/auth");


router.get(
"/",
requireAuth,
getDrivers
);


router.post(
"/",
requireAuth,
createDriver
);


router.put(
"/:id",
requireAuth,
updateDriver
);


router.delete(
"/:id",
requireAuth,
deleteDriver
);


module.exports=router;