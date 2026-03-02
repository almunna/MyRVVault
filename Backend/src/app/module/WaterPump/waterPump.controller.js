const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('waterPumps', ['name', 'modelNumber'], 'WaterPump');

exports.createWaterPump = create;
exports.getWaterPump = getAll;
exports.getWaterPumpById = getById;
exports.updateWaterPump = update;
exports.deleteWaterPump = remove;
