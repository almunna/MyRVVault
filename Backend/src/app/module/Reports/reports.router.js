const express = require('express');

const router = express.Router();

const { createReport, getReports, getReportById, updateReport, deleteReport, toggleFavoriteReport, getFavoriteReports } = require('./reports.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createReport);
router.get('/get', authenticateUser, getReports);
router.get('/get/:id', authenticateUser, getReportById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateReport);
router.post('/delete/:id', authenticateUser, deleteReport); 
//favorite the report
router.post('/toggleFavorite/:id', authenticateUser, toggleFavoriteReport);
router.get('/getFavorite', authenticateUser, getFavoriteReports);
module.exports = router;
