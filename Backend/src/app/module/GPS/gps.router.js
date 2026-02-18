const express = require('express');
const router = express.Router();
const { createGps, getGps, getGpsById, updateGps, deleteGps } = require('./gps.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');


router.post('/create', authenticateUser, upload.array('images'), createGps);
router.get('/get', authenticateUser, getGps);
router.get('/get/:id', authenticateUser, getGpsById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateGps);
router.post('/delete/:id', authenticateUser, deleteGps);

module.exports = router;