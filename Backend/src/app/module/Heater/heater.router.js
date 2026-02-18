const express = require('express');
const router = express.Router();

const { createHeater, getHeaters, getHeaterById, updateHeater, deleteHeater } = require('./heater.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.post('/create', authenticateUser, upload.array('images'), createHeater);
router.get('/get', authenticateUser, getHeaters);
router.get('/get/:id', authenticateUser, getHeaterById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateHeater);
router.post('/delete/:id', authenticateUser, deleteHeater);

module.exports = router;
