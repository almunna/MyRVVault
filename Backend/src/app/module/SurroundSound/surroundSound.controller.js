const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('surroundSounds', ['name', 'modelNumber'], 'SurroundSound');

exports.createSurroundSound = create;
exports.getSurroundSounds = getAll;
exports.getSurroundSoundById = getById;
exports.updateSurroundSound = update;
exports.deleteSurroundSound = remove;
