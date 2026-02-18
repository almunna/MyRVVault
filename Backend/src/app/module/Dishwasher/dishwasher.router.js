const express = require('express');
const router = express.Router();
const { createDishwasher, getDishwashers, getDishwasherById, updateDishwasher, deleteDishwasher } = require('./dishwasher.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createDishwasher);
router.get('/get', authenticateUser, getDishwashers);
router.get('/get/:id', authenticateUser, getDishwasherById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateDishwasher);
router.post('/delete/:id', authenticateUser, deleteDishwasher);

module.exports = router;

