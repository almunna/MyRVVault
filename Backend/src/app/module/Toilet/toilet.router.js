const express = require('express');
const router = express.Router();
const { createToilet, getToilets, getToiletById, updateToilet, deleteToilet } = require('./toilet.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createToilet);
router.get('/get', authenticateUser, getToilets);
router.get('/get/:id', authenticateUser, getToiletById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateToilet);
router.post('/delete/:id', authenticateUser, deleteToilet);

module.exports = router;
