const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('wifiRouters', ['name', 'modelNumber'], 'WifiRouter');

exports.createWifiRouter = create;
exports.getWifiRouters = getAll;
exports.getWifiRouterById = getById;
exports.updateWifiRouter = update;
exports.deleteWifiRouter = remove;
