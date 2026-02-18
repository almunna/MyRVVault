const express = require('express');
const router = express.Router();

const { createInsuranceCompany, getInsuranceCompanies, getInsuranceCompanyById, updateInsuranceCompany, deleteInsuranceCompany } = require('./insuranceCompany.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/create',authenticateUser, upload.array('images'), createInsuranceCompany);
router.get('/get', authenticateUser, getInsuranceCompanies);
router.get('/get/:id', authenticateUser, getInsuranceCompanyById);
router.put('/update/:id', authenticateUser, upload.array('images'), updateInsuranceCompany);
router.post('/delete/:id', authenticateUser, deleteInsuranceCompany);

module.exports = router;
