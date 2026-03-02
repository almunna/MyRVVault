const express = require('express');
require('./config/db'); // Initialize Firebase Firestore
const app = express();
const cors = require('cors');
const path = require("path");
const fs = require("fs");
const { errorHandler } = require('./errors/errorHandler');
// const authRoutes = require('./routes/auth.routes'); 
// const userRoutes = require('./routes/user.routes');
// const rvRoutes = require('./routes/rv.routes');
// const membershipRoutes = require('./routes/membership.routes')
// const insuranceRoutes = require('./routes/insurance.routes');
// const maintenanceRoutes = require('./routes/maintenance.routes');
// const repairRoutes = require('./routes/repair.routes');
const dotenv = require('dotenv');
// const path = require('path');
// const newExpenseRoutes = require('./routes/newExpense.routes');
// const tripsRoutes = require('./routes/trips.routes');
// const chassisRoutes = require('./routes/chessis.routes');
// const tireRoutes = require('./routes/appliance.routes/tire.routes');
app.use("/", express.static(path.join(__dirname, '..')));

dotenv.config();

// Firebase Firestore is initialized via require('./config/db') above

// Middleware
// Increase JSON payload limit to handle large tokens (default is 100kb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const allowedOrigins = [
  "https://myrvvault.onrender.com",  // Render frontend (hardcoded for reliability)
  process.env.FRONTEND_URL,          // custom domain override
  "http://10.10.20.60:3002",
  "http://localhost:5173",
  "http://localhost:3002",
  "http://51.20.217.10:5000",
  "http://51.20.217.10:3000",
  "http://51.20.217.10:3001",
  "http://localhost:3000",
  "http://10.10.20.52:3000",
].filter(Boolean);


// Security Middlewares (apply CORS only to API routes so static assets aren't blocked)
// app.use(helmet());  
const apiCors = cors({
  origin: function (origin, callback) {
    console.log("Incoming origin:", origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      console.log("Allowed:", origin);
      return callback(null, true);
    }
    console.log("Blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
});
app.use('/api', apiCors);

// Serve admin SPA and its assets before API routes
app.use('/admin', express.static(path.join(__dirname, 'admin', 'dist')))
app.use('/assets', express.static(path.join(__dirname, 'admin', 'dist', 'assets')))

// Mount routes
app.use('/api/auth', require('./app/module/Auth/auth.router'));
app.use('/api/user', require('./app/module/User/user.router'));
app.use('/api/rv', require('./app/module/RV/rv.router'));
app.use('/api/chassis', require('./app/module/Chassis/chassis.router'));
app.use('/api/tire', require('./app/module/Tire/tire.router'));
app.use('/api/heater', require('./app/module/Heater/heater.router'));
app.use('/api/air-condition', require('./app/module/Air-condition/air-condition.router'));
app.use('/api/water-pump', require('./app/module/WaterPump/waterPump.router'));
app.use('/api/washer', require('./app/module/Washer/washer.router'));
app.use('/api/water-heater', require('./app/module/WaterHeater/waterHeater.router'));
app.use('/api/toilet', require('./app/module/Toilet/toilet.router'));
app.use('/api/dryer', require('./app/module/Dryer/dryer.router'));
app.use('/api/tv', require('./app/module/TV/tv.router'));
app.use('/api/exhaust-fans', require('./app/module/ExhaustFans/exhaustFans.router'));
app.use('/api/vent-fans', require('./app/module/VentFans/ventFans.router'));
app.use('/api/dishwasher', require('./app/module/Dishwasher/dishwasher.router'));
app.use('/api/celling-fans', require('./app/module/CellingFans/cellingFans.router'));
app.use('/api/dvd', require('./app/module/DVD/dvd.router'));
app.use('/api/gps', require('./app/module/GPS/gps.router'));
app.use('/api/checklist', require('./app/module/Checklist/checklist.router'));
app.use('/api/internet-satellite', require('./app/module/InternetSatellite/internetSatellite.router'));
app.use('/api/wifi-router', require('./app/module/WifiRouter/wifiRouter.router'));
app.use('/api/outdoor-radio', require('./app/module/OutdoorRadio/outdoorRadio.router'));
app.use('/api/surround-sound', require('./app/module/SurroundSound/surroundSound.router'));
app.use('/api/membership', require('./app/module/Membership/membership.router'));
app.use('/api/insurance-company', require('./app/module/InsuranceCompany/insuranceCompany.router'));
app.use('/api/new-repair', require('./app/module/NewRepair/newRepair.router'));
app.use('/api/reports', require('./app/module/Reports/reports.router'));
app.use('/api/expense', require('./app/module/Expense/expense.router'));
app.use('/api/maintenance-schedule', require('./app/module/MaintenanceSchedule/maintenanceSchedule.router'));
app.use('/api/dashboard', require('./app/module/Dashboard/dashboard.router'));
app.use('/api/manage', require('./app/module/Manage/manage.router'));
app.use('/api/admin', require('./app/module/Admin/admin.router'));
app.use('/api/trips', require('./app/module/Trip/trip.router'));
app.use('/api/sell-rv', require('./app/module/SellRv/sellRv.router'));

app.get('/', (req, res) => {
  res.send("All ok")
})
// app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/rv', rvRoutes);
// app.use('/api/membership', membershipRoutes);
// app.use('/api/insurance', insuranceRoutes);
// app.use('/api/maintenance', maintenanceRoutes);
// app.use('/api/repair', repairRoutes);
// app.use('/api/expenses', newExpenseRoutes);
// app.use('/api/trips', tripsRoutes);
// app.use('/api/chassis', chassisRoutes);
// app.use('/api/appliance/tire', tireRoutes);
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;
