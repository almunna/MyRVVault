const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/auth.middleware');
const {
    createGeneratorLog,
    getGeneratorLogs,
    getGeneratorLogById,
    updateGeneratorLog,
    deleteGeneratorLog
} = require('./generatorLog.controller');

router.use(authenticateUser);

router.post('/create', createGeneratorLog);
router.get('/get', getGeneratorLogs);
router.get('/get/:id', getGeneratorLogById);
router.put('/update/:id', updateGeneratorLog);
router.post('/delete/:id', deleteGeneratorLog);

module.exports = router;
