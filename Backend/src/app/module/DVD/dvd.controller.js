const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('dvds', ['name', 'modelNumber'], 'DVD');

exports.createDvd = create;
exports.getDvd = getAll;
exports.getDvdById = getById;
exports.updateDvd = update;
exports.deleteDvd = remove;
