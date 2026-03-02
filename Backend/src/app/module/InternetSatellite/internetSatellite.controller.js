const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('internetSatellite', ['name', 'modelNumber'], 'InternetSatellite');

exports.createInternetSatellite = create;
exports.getInternetSatellites = getAll;
exports.getInternetSatelliteById = getById;
exports.updateInternetSatellite = update;
exports.deleteInternetSatellite = remove;
