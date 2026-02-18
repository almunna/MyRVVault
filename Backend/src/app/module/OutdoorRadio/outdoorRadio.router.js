const express = require('express');
const router = express.Router();
const { createOutdoorRadio, getOutdoorRadio, getOutdoorRadioById, updateOutdoorRadio, deleteOutdoorRadio } = require('./outdoorRadio.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');


router.post('/create', authenticateUser, upload.array('images'), createOutdoorRadio);
router.get('/get', authenticateUser, getOutdoorRadio);
router.get('/get/:id', authenticateUser, getOutdoorRadioById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateOutdoorRadio);
router.post('/delete/:id', authenticateUser, deleteOutdoorRadio);

module.exports = router;
