const express = require('express');
const router = express.Router();
const { createMembership, getMemberships, getMembershipById, updateMembership, deleteMembership } = require('./membership.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create', authenticateUser, upload.array('images'), createMembership);
router.get('/get', authenticateUser, getMemberships);
router.get('/get/:id', authenticateUser, getMembershipById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateMembership);
router.post('/delete/:id', authenticateUser, deleteMembership);

module.exports = router;

