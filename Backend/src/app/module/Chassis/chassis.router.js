const express = require('express');
const { createChassis, getChassis, getChassisById, updateChassis, deleteChassis, createOrUpdateChassis } = require('./chassis.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const router = express.Router();

router.post('/add-chassis',authenticateUser, createChassis);
router.post('/create-or-update-chassis',authenticateUser, createOrUpdateChassis);
router.get('/get-chassis', authenticateUser, getChassis);
router.get('/get-chassis/:id', authenticateUser, getChassisById);
router.put('/update-chassis/:id', authenticateUser, updateChassis);
router.post('/delete-chassis/:id', authenticateUser, deleteChassis);

module.exports = router;
