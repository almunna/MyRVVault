const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');
const {
    createRepairOrder,
    getRepairOrders,
    getRepairOrderById,
    updateRepairOrder,
    deleteRepairOrder,
    updateRepairOrderStatus
} = require('./repairOrder.controller');

router.use(authenticateUser);

router.post('/create', upload.array('images', 10), createRepairOrder);
router.get('/get', getRepairOrders);
router.get('/get/:id', getRepairOrderById);
router.put('/update/:id', upload.array('images', 10), updateRepairOrder);
router.post('/delete/:id', deleteRepairOrder);
router.put('/status/:id', updateRepairOrderStatus);

module.exports = router;
