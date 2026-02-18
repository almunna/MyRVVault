const User = require('../../src/app/module/User/User');
const {ApiError} = require('../errors/errorHandler');

const getSelectedRvByUserId = async (userId) => {
    const user = await User.findById(userId).select('selectedRvId');
    if (!user) throw new ApiError('User not found', 404);
    return user.selectedRvId;
};

module.exports = getSelectedRvByUserId;
