const express = require('express');
const router = express.Router();
const { 
    createMaintenanceSchedule, 
    getMaintenanceSchedule, 
    getMaintenanceScheduleById, 
    updateMaintenanceSchedule, 
    deleteMaintenanceSchedule,
    getMaintenanceByStatus,
    getMaintenanceDashboard,
    updateRVMaintenanceStatus // Add this
} = require('./maintenanceSchedule.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create', authenticateUser, createMaintenanceSchedule);
router.get('/get', authenticateUser, getMaintenanceSchedule);
router.get('/get/:id', authenticateUser, getMaintenanceScheduleById);
router.put('/update/:id', authenticateUser, updateMaintenanceSchedule);
router.post('/delete/:id', authenticateUser, deleteMaintenanceSchedule);
router.get('/status/:status', authenticateUser, getMaintenanceByStatus);
router.get('/dashboard', authenticateUser, getMaintenanceDashboard);

// Add this new route
router.put('/update-rv-status/:rvId', authenticateUser, updateRVMaintenanceStatus);

module.exports = router;