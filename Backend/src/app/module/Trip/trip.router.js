const express = require('express');
const router = express.Router();
const {
    createTrip,
    getAllTrips,
    getTrip,
    updateTrip,
    deleteTrip,
    addStateVisit,
    removeStateVisit,
    getStateStatistics,
    getTripsByState
} = require('./trip.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.route('/')
    .post(authenticateUser, createTrip)
    .get(authenticateUser, getAllTrips);

router.route('/stats/map')
    .get(authenticateUser, getStateStatistics);

router.route('/state/:state')
    .get(authenticateUser, getTripsByState);

router.route('/:id')
    .get(authenticateUser, getTrip)
    .patch(authenticateUser, updateTrip)
    .post(authenticateUser, deleteTrip);

router.route('/:id/states')
    .post(authenticateUser, addStateVisit);

router.route('/:id/states/:stateVisitId')
    .delete(authenticateUser, removeStateVisit);

module.exports = router;


// {weight} Kg
//$