const makeApplianceController = require('../../../utils/makeApplianceController');

const { create, getAll, getById, update, remove, markAsReplaced } =
  makeApplianceController('others', ['name', 'description', 'location'], 'Other Item');

module.exports = { createOther: create, getOthers: getAll, getOtherById: getById, updateOther: update, deleteOther: remove, markOtherReplaced: markAsReplaced };
