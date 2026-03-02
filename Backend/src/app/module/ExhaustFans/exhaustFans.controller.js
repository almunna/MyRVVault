const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('exhaustFans', ['name', 'modelNumber'], 'ExhaustFans');

exports.createExhaustFans = create;
exports.getExhaustFans = getAll;
exports.getExhaustFansById = getById;
exports.updateExhaustFans = update;
exports.deleteExhaustFans = remove;
