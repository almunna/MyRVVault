const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('outdoorRadios', ['name', 'modelNumber'], 'OutdoorRadio');

exports.createOutdoorRadio = create;
exports.getOutdoorRadio = getAll;
exports.getOutdoorRadioById = getById;
exports.updateOutdoorRadio = update;
exports.deleteOutdoorRadio = remove;
