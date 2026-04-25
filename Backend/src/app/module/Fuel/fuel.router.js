const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/auth.middleware');
const {
    createFuelLog,
    getFuelLogs,
    getFuelLogById,
    updateFuelLog,
    deleteFuelLog,
    getFuelStats
} = require('./fuel.controller');

router.use(authenticateUser);

router.post('/create', createFuelLog);
router.get('/get', getFuelLogs);
router.get('/stats', getFuelStats);
router.get('/get/:id', getFuelLogById);
router.put('/update/:id', updateFuelLog);
router.post('/delete/:id', deleteFuelLog);

module.exports = router;
