const express = require('express');
const router = express.Router();
const {
    createTrip, getAllTrips, getTrip, updateTrip, deleteTrip,
    addStateVisit, removeStateVisit, getStateStatistics, getTripsByState,
    linkFuelLog, unlinkFuelLog, deletePhoto,
    getActiveTrip, startTrip, endTrip
} = require('./trip.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.route('/')
    .post(authenticateUser, upload.array('photos', 10), createTrip)
    .get(authenticateUser, getAllTrips);

router.get('/stats/map', authenticateUser, getStateStatistics);
router.get('/active', authenticateUser, getActiveTrip);
router.post('/start', authenticateUser, startTrip);
router.get('/state/:state', authenticateUser, getTripsByState);

router.route('/:id')
    .get(authenticateUser, getTrip)
    .patch(authenticateUser, upload.array('photos', 10), updateTrip)
    .post(authenticateUser, deleteTrip);

router.patch('/:id/end', authenticateUser, endTrip);
router.post('/:id/states', authenticateUser, addStateVisit);
router.delete('/:id/states/:stateVisitId', authenticateUser, removeStateVisit);

router.post('/:id/fuel', authenticateUser, linkFuelLog);
router.delete('/:id/fuel/:fuelLogId', authenticateUser, unlinkFuelLog);
router.delete('/:id/photo', authenticateUser, deletePhoto);

module.exports = router;
