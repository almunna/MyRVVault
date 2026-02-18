const express = require('express');

const router  = express.Router();

const { createAirCondition, getAirConditions, getAirConditionById, updateAirCondition, deleteAirCondition } = require('./air-condition.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.post('/create',  authenticateUser, upload.array('images'), createAirCondition);
router.get('/get', authenticateUser, getAirConditions);
router.get('/get/:id', authenticateUser, getAirConditionById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateAirCondition);
router.post('/delete/:id', authenticateUser, deleteAirCondition);

module.exports = router;

