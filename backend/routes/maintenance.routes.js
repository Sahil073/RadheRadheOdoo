const express=require("express");
const router=express.Router();


const {
createMaintenance,
closeMaintenance,
getMaintenance
}=require("../controllers/maintenance.controller");


const {requireAuth}=require("../middleware/auth");



router.get(
"/",
requireAuth,
getMaintenance
);



router.post(
"/",
requireAuth,
createMaintenance
);



router.patch(
"/:id/close",
requireAuth,
closeMaintenance
);



module.exports=router;