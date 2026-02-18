const express = require('express');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');
const { createTire, getTire, getTireById, updateTire, deleteTire } = require('./tire.controller');
const router = express.Router();

router.post('/add-tire', authenticateUser, upload.array('images'), createTire);
router.get('/get-tire', authenticateUser, getTire);
router.get('/get-tire/:id', authenticateUser, getTireById);
router.put('/update-tire/:id', authenticateUser, upload.array('images'), updateTire);
router.post('/delete-tire/:id', authenticateUser, deleteTire);

module.exports = router;
