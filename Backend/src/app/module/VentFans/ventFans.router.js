const express = require('express');
const router = express.Router();
const { createVentFans, getVentFans, getVentFanById, deleteVentFan, updateVentFan } = require('./ventFans.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createVentFans);
router.get('/get', authenticateUser, getVentFans);
router.get('/get/:id', authenticateUser, getVentFanById);
router.post('/delete/:id', authenticateUser, deleteVentFan);
router.put('/update/:id', authenticateUser, upload.array('images'), updateVentFan);

module.exports = router;
