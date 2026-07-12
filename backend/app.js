const express = require("express");
const cors = require("cors");
require("dotenv").config();


// Import error handler
const errorHandler = require("./middleware/errorHandler");


// Create Express app
const app = express();


// Middleware

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));




// Routes

const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const driverRoutes = require("./routes/driver.routes");
const tripRoutes = require("./routes/trip.routes");
const maintenanceRoutes = require("./routes/maintenance.routes");
const fuelRoutes = require("./routes/fuel.routes");
const expenseRoutes = require("./routes/expense.routes");
const dashboardRoutes = require("./routes/dashboard.routes");




// API endpoints

app.use("/api/auth", authRoutes);

app.use("/api/vehicles", vehicleRoutes);

app.use("/api/drivers", driverRoutes);

app.use("/api/trips", tripRoutes);

app.use("/api/maintenance", maintenanceRoutes);

app.use("/api/fuel", fuelRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/dashboard", dashboardRoutes);




// Health check route

app.get("/", (req,res)=>{

    res.json({
        message:"TransitOps Backend Running 🚚"
    });

});




// Error handler
// Always keep this at the end

app.use(errorHandler);



module.exports = app;