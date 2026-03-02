const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('dryers', ['name', 'modelNumber'], 'Dryer');

exports.createDryer = create;
exports.getDryers = getAll;
exports.getDryerById = getById;
exports.updateDryer = update;
exports.deleteDryer = remove;
