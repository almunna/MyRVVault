const express = require('express');
const router = express.Router();
const { createDvd, getDvd, getDvdById, updateDvd, deleteDvd } = require('./dvd.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createDvd);
router.get('/get', authenticateUser, getDvd);
router.get('/get/:id', authenticateUser, getDvdById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateDvd);
router.post('/delete/:id', authenticateUser, deleteDvd);

module.exports = router;
