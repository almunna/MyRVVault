const express = require('express');

const router = express.Router();

const { getUserProfile, updateUserProfile, changePassword, deleteAccount, selectRV, sellRv, getSoldRvs } = require('./user.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');


 


router.get('/profile', authenticateUser, getUserProfile);
router.put('/update-profile', authenticateUser, upload.single('profilePic'), updateUserProfile);
router.put('/change-password', authenticateUser, changePassword);
router.post('/delete-account', authenticateUser, deleteAccount);
router.put('/select-rv', authenticateUser, selectRV);
router.post('/sell-rv', authenticateUser, sellRv);
router.get('/sold-rvs', authenticateUser, getSoldRvs);

module.exports = router;
