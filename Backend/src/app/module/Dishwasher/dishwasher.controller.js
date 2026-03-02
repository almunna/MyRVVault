const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('dishwashers', ['name', 'modelNumber'], 'Dishwasher');

exports.createDishwasher = create;
exports.getDishwashers = getAll;
exports.getDishwasherById = getById;
exports.updateDishwasher = update;
exports.deleteDishwasher = remove;
