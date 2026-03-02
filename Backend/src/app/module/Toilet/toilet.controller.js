const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('toilets', ['name', 'modelNumber'], 'Toilet');

exports.createToilet = create;
exports.getToilets = getAll;
exports.getToiletById = getById;
exports.updateToilet = update;
exports.deleteToilet = remove;
