const express = require('express');
const router = express.Router();
const { createSurroundSound, getSurroundSounds, getSurroundSoundById, updateSurroundSound, deleteSurroundSound } = require('./surroundSound.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');


router.post('/create', authenticateUser, upload.array('images'), createSurroundSound);
router.get('/get', authenticateUser, getSurroundSounds);
router.get('/get/:id', authenticateUser, getSurroundSoundById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateSurroundSound);
router.post('/delete/:id', authenticateUser, deleteSurroundSound);

module.exports = router;

