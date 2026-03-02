const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('memberships', ['name', 'accountNo'], 'Membership');

exports.createMembership = create;
exports.getMemberships = getAll;
exports.getMembershipById = getById;
exports.updateMembership = update;
exports.deleteMembership = remove;
