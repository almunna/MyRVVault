const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('washers', ['name', 'modelNumber'], 'Washer');

exports.createWasher = create;
exports.getWasher = getAll;
exports.getWasherById = getById;
exports.updateWasher = update;
exports.deleteWasher = remove;
