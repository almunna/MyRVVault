const express = require('express');
const router = express.Router();
const {
    createVendor, getAllVendors, getVendor,
    updateVendor, deleteVendor, toggleFavorite,
    findNearby, saveGooglePlace, getPlaceDetails
} = require('./vendor.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.route('/')
    .post(authenticateUser, createVendor)
    .get(authenticateUser, getAllVendors);

router.get('/places/nearby', authenticateUser, findNearby);
router.get('/places/details', authenticateUser, getPlaceDetails);
router.post('/places/save', authenticateUser, saveGooglePlace);

router.route('/:id')
    .get(authenticateUser, getVendor)
    .put(authenticateUser, updateVendor)
    .delete(authenticateUser, deleteVendor);

router.patch('/:id/favorite', authenticateUser, toggleFavorite);

module.exports = router;
