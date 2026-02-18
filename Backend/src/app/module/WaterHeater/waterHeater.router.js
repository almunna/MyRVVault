const express = require('express');
const router = express.Router();

const { createWaterHeater, getWaterHeater, getWaterHeaterById, updateWaterHeater, deleteWaterHeater } = require('./waterHeater.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.post('/create', authenticateUser, upload.array('images'), createWaterHeater);
router.get('/get', authenticateUser, getWaterHeater);
router.get('/get/:id', authenticateUser, getWaterHeaterById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateWaterHeater);
router.post('/delete/:id', authenticateUser, deleteWaterHeater);

module.exports = router;
