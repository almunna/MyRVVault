const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('insurance', ['insuranceCompany', 'policyNumber'], 'InsuranceCompany');

exports.createInsuranceCompany = create;
exports.getInsuranceCompanies = getAll;
exports.getInsuranceCompanyById = getById;
exports.updateInsuranceCompany = update;
exports.deleteInsuranceCompany = remove;
