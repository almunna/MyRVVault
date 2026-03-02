const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('tvs', ['name', 'modelNumber'], 'TV');

exports.createTv = create;
exports.getTvs = getAll;
exports.getTvById = getById;
exports.updateTv = update;
exports.deleteTv = remove;
