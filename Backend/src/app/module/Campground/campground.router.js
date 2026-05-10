const express = require('express');
const router = express.Router();
const {
    createCampground, getAllCampgrounds, getCampground,
    updateCampground, deleteCampground, toggleFavorite, deletePhoto
} = require('./campground.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.route('/')
    .post(authenticateUser, upload.array('photos', 10), createCampground)
    .get(authenticateUser, getAllCampgrounds);

router.route('/:id')
    .get(authenticateUser, getCampground)
    .put(authenticateUser, upload.array('photos', 10), updateCampground)
    .delete(authenticateUser, deleteCampground);

router.patch('/:id/favorite', authenticateUser, toggleFavorite);
router.delete('/:id/photo', authenticateUser, deletePhoto);

module.exports = router;
