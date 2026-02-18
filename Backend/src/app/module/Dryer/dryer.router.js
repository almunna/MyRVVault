const express = require('express');
const router = express.Router();
const { createDryer, getDryers, getDryerById, updateDryer, deleteDryer } = require('./dryer.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createDryer);
router.get('/get', authenticateUser, getDryers);
router.get('/get/:id', authenticateUser, getDryerById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateDryer);
router.post('/delete/:id', authenticateUser, deleteDryer);

module.exports = router;
