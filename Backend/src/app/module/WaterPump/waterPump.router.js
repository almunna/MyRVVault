const express = require('express');

const router = express.Router();

const { createWaterPump, getWaterPump, getWaterPumpById, updateWaterPump, deleteWaterPump } = require('./waterPump.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.post('/create', authenticateUser, upload.array('images'), createWaterPump);
router.get('/get', authenticateUser, getWaterPump);
router.get('/get/:id', authenticateUser, getWaterPumpById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateWaterPump);
router.post('/delete/:id', authenticateUser, deleteWaterPump);

module.exports = router;

