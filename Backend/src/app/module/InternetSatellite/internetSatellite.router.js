const express =  require('express');
const router = express.Router();
const { createInternetSatellite, getInternetSatellites, getInternetSatelliteById, updateInternetSatellite, deleteInternetSatellite } = require('./internetSatellite.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create', authenticateUser, upload.array('images'), createInternetSatellite );
router.get('/get', authenticateUser, getInternetSatellites);
router.get('/get/:id', authenticateUser, getInternetSatelliteById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateInternetSatellite);
router.post('/delete/:id', authenticateUser, deleteInternetSatellite);

module.exports = router;
