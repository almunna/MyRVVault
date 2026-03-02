const { db } = require('../config/db');

async function checkValidRv(userId, rvId) {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return false;
  const rvIds = userDoc.data().rvIds || [];
  return rvIds.includes(rvId);
}

module.exports = checkValidRv;
