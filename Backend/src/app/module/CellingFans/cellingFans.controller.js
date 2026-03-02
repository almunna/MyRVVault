const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('cellingFans', ['name', 'modelNumber'], 'CellingFans');

exports.createCellingFans = create;
exports.getCellingFans = getAll;
exports.getCellingFansById = getById;
exports.updateCellingFans = update;
exports.deleteCellingFans = remove;
