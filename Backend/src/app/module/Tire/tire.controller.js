const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('tires', ['name', 'manufacturer', 'tireSize'], 'Tire');

exports.createTire = create;
exports.getTire = getAll;
exports.getTireById = getById;
exports.updateTire = update;
exports.deleteTire = remove;
