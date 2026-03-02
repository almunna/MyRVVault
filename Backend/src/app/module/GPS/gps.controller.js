const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('gpsSystems', ['name', 'modelNumber'], 'GPS');

exports.createGps = create;
exports.getGps = getAll;
exports.getGpsById = getById;
exports.updateGps = update;
exports.deleteGps = remove;
