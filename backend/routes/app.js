const express=require("express");

const app=express();

const errorHandler=require("./middleware/errorHandler");


app.use(express.json());


// Routes

app.use("/api/auth",
require("./routes/auth.routes"));


app.use("/api/vehicles",
require("./routes/vehicle.routes"));


app.use("/api/drivers",
require("./routes/driver.routes"));


app.use("/api/trips",
require("./routes/trip.routes"));


app.use("/api/maintenance",
require("./routes/maintenance.routes"));


app.use("/api/fuel",
require("./routes/fuel.routes"));


app.use("/api/expenses",
require("./routes/expense.routes"));


app.use("/api/dashboard",
require("./routes/dashboard.routes"));



// Error middleware
app.use(errorHandler);


module.exports=app;