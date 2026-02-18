const express = require('express');
const router = express.Router();

const { createWifiRouter, getWifiRouters, getWifiRouterById, updateWifiRouter, deleteWifiRouter } = require('./wifiRouter.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create', authenticateUser, upload.array('images'), createWifiRouter);
router.get('/get', authenticateUser, getWifiRouters);
router.get('/get/:id', authenticateUser, getWifiRouterById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateWifiRouter);
router.post('/delete/:id', authenticateUser, deleteWifiRouter);

module.exports = router;
