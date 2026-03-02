const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('newRepairs', ['component', 'expenseType', 'vendor'], 'NewRepair');

exports.createNewRepair = create;
exports.getNewRepairs = getAll;
exports.getNewRepairById = getById;
exports.updateNewRepair = update;
exports.deleteNewRepair = remove;
