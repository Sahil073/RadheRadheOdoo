const express=require("express");

const router=express.Router();


const {
createTrip,
dispatchTrip,
completeTrip,
cancelTrip,
getTrips
}=require("../controllers/trip.controller");


const {requireAuth}=require("../middleware/auth");



router.get(
"/",
requireAuth,
getTrips
);



router.post(
"/",
requireAuth,
createTrip
);



router.patch(
"/:id/dispatch",
requireAuth,
dispatchTrip
);



router.patch(
"/:id/complete",
requireAuth,
completeTrip
);



router.patch(
"/:id/cancel",
requireAuth,
cancelTrip
);



module.exports=router;