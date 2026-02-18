const express = require('express');
const router = express.Router();
const { addSellRv, getUserSellRvs } = require('./sellRv.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/add', authenticateUser, addSellRv);
router.get('/all', authenticateUser, getUserSellRvs);



module.exports = router;