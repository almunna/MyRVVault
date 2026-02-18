const express = require('express');
const router = express.Router();
const { createCellingFans, getCellingFans, getCellingFansById, updateCellingFans, deleteCellingFans } = require('./cellingFans.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createCellingFans);
router.get('/get', authenticateUser, getCellingFans);
router.get('/get/:id', authenticateUser, getCellingFansById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateCellingFans);
router.post('/delete/:id', authenticateUser, deleteCellingFans);

module.exports = router;
