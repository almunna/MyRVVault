const express = require('express');
const router = express.Router();
const { createOther, getOthers, getOtherById, updateOther, deleteOther, markOtherReplaced } = require('./other.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.post('/create', authenticateUser, upload.array('images'), createOther);
router.get('/get', authenticateUser, getOthers);
router.get('/get/:id', authenticateUser, getOtherById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateOther);
router.post('/delete/:id', authenticateUser, deleteOther);
router.post('/mark-replaced/:id', authenticateUser, markOtherReplaced);

module.exports = router;
