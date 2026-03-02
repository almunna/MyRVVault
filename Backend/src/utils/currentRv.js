const { db } = require('../config/db');
const { ApiError } = require('../errors/errorHandler');

const getSelectedRvByUserId = async (userId) => {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) throw new ApiError('User not found', 404);
  return userDoc.data().selectedRvId || null;
};

module.exports = getSelectedRvByUserId;
