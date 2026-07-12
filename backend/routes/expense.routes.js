const express=require("express");
const router=express.Router();


const {
addExpense,
getExpenses
}=require("../controllers/expense.controller");


const {requireAuth}=require("../middleware/auth");



router.get(
"/",
requireAuth,
getExpenses
);



router.post(
"/",
requireAuth,
addExpense
);



module.exports=router;