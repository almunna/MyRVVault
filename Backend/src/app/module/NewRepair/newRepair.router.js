const express = require('express');
const router = express.Router();

const { createNewRepair, getNewRepairs, getNewRepairById, updateNewRepair, deleteNewRepair } = require('./newRepair.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createNewRepair);
router.get('/get', authenticateUser, getNewRepairs);
router.get('/get/:id', authenticateUser, getNewRepairById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateNewRepair);
router.post('/delete/:id', authenticateUser, deleteNewRepair);

module.exports = router;


