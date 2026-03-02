const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('airConditioners', ['name', 'modelNumber'], 'AirCondition');

exports.createAirCondition = create;
exports.getAirConditions = getAll;
exports.getAirConditionById = getById;
exports.updateAirCondition = update;
exports.deleteAirCondition = remove;
