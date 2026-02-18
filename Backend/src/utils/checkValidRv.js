const User = require('../app/module/User/User');
async function checkValidRv(userId, rvId) {
    // Check if the user has the specified RV in their user schema
    const user = await User.findById(userId).select('rvIds');
    if (!user || !user.rvIds.includes(rvId)) {
        return false;
    }
    return true;
}

module.exports = checkValidRv;
