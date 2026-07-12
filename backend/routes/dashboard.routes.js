const express=require("express");
const router=express.Router();


const {
getDashboard,
exportCSV
}=require("../controllers/dashboard.controller");


const {requireAuth}=require("../middleware/auth");



router.get(
"/",
requireAuth,
getDashboard
);



router.get(
"/export",
requireAuth,
exportCSV
);



module.exports=router;