const express = require('express');
const router = express.Router();

const { createExhaustFans, getExhaustFans, getExhaustFansById, updateExhaustFans, deleteExhaustFans } = require('./exhaustFans.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.post('/create', authenticateUser, upload.array('images'), createExhaustFans);
router.get('/get', authenticateUser, getExhaustFans);
router.get('/get/:id', authenticateUser, getExhaustFansById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateExhaustFans);
router.post('/delete/:id', authenticateUser, deleteExhaustFans);

module.exports = router;
