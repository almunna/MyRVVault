const express = require('express');
const router = express.Router();
const { markAsReplaced, getHealthScore } = require('./component.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.put('/replace/:collection/:id',   authenticateUser, markAsReplaced);
router.get('/health/:collection/:id',    authenticateUser, getHealthScore);

module.exports = router;
