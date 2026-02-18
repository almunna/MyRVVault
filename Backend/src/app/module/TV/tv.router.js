const express = require('express');
const router = express.Router();
const { createTv, getTvs, getTvById, updateTv, deleteTv } = require('./tv.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createTv);
router.get('/get', authenticateUser, getTvs);
router.get('/get/:id', authenticateUser, getTvById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateTv);
router.post('/delete/:id', authenticateUser, deleteTv);

module.exports = router;

