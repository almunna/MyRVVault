const express = require('express');
const router = express.Router();
// const { authenticateAdmin } = require('../../middleware/auth.middleware');
const { getUsers, getUserById, toggleBlockUser, deleteUser, getAllUsersMonthlyGrowthAndTotalRvAddingGrowth, getDashboardData } = require('./userManagement');

router.get('/users', getUsers);
router.get('/user/:id', getUserById);
router.put('/toggle-block/:id', toggleBlockUser);
router.post('/delete-user/:id', deleteUser);
router.get('/all-users/:year', getAllUsersMonthlyGrowthAndTotalRvAddingGrowth);
router.get('/:year', getDashboardData);
module.exports = router;