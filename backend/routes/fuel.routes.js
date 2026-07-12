const express=require("express");
const router=express.Router();


const {
addFuelLog,
getFuelLogs
}=require("../controllers/fuel.controller");


const {requireAuth}=require("../middleware/auth");



router.get(
"/",
requireAuth,
getFuelLogs
);



router.post(
"/",
requireAuth,
addFuelLog
);



module.exports=router;