const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('heaters', ['name', 'modelNumber'], 'Heater');

exports.createHeater = create;
exports.getHeaters = getAll;
exports.getHeaterById = getById;
exports.updateHeater = update;
exports.deleteHeater = remove;
