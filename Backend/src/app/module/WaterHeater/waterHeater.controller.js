const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('waterHeaters', ['name', 'modelNumber'], 'WaterHeater');

exports.createWaterHeater = create;
exports.getWaterHeater = getAll;
exports.getWaterHeaterById = getById;
exports.updateWaterHeater = update;
exports.deleteWaterHeater = remove;
