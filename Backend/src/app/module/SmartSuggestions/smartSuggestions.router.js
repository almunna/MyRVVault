const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/auth.middleware');
const { getSmartSuggestions, getRelatedComponents } = require('./smartSuggestions.controller');

router.use(authenticateUser);

router.get('/get', getSmartSuggestions);
router.get('/related-components', getRelatedComponents);

module.exports = router;
