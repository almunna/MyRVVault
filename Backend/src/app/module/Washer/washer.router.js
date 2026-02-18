const express = require('express');
const router = express.Router();

const { createWasher, getWasher, getWasherById, updateWasher, deleteWasher } = require('./washer.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.post('/create', authenticateUser, upload.array('images'), createWasher);
router.get('/get', authenticateUser, getWasher);
router.get('/get/:id', authenticateUser, getWasherById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateWasher);
router.post('/delete/:id', authenticateUser, deleteWasher);

module.exports = router;
