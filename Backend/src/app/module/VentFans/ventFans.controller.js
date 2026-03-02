const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('ventFans', ['name', 'modelNumber'], 'VentFan');

exports.createVentFans = create;
exports.getVentFans = getAll;
exports.getVentFanById = getById;
exports.updateVentFan = update;
exports.deleteVentFan = remove;
