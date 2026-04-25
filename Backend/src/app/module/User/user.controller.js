const { db, FieldValue } = require('../../../config/db');
const { ApiError } = require('../../../errors/errorHandler');
const asyncHandler = require('../../../utils/asyncHandler');
const bcrypt = require('bcrypt');

exports.getUserProfile = asyncHandler(async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.id).get();
  if (!userDoc.exists) throw new ApiError('User not found', 404);
  const user = { id: userDoc.id, ...userDoc.data() };
  delete user.password;

  // Populate rvIds
  const rvIds = user.rvIds || [];
  const rvDetails = await Promise.all(
    rvIds.map(async (rvId) => {
      const doc = await db.collection('rvs').doc(rvId).get();
      if (!doc.exists) return null;
      const rv = doc.data();
      return { id: doc.id, nickname: rv.nickname, currentMileage: rv.currentMileage, isOverdueForMaintenance: rv.isOverdueForMaintenance, isSold: rv.isSold };
    })
  );

  // Populate selectedRvId
  let selectedRv = null;
  if (user.selectedRvId) {
    const selDoc = await db.collection('rvs').doc(user.selectedRvId).get();
    if (selDoc.exists) {
      const d = selDoc.data();
      selectedRv = { id: selDoc.id, nickname: d.nickname, currentMileage: d.currentMileage, isOverdueForMaintenance: d.isOverdueForMaintenance, isSold: d.isSold, isUpcomingMaintenance: d.isUpcomingMaintenance };
    }
  }

  // Populate soldRvs
  const soldRvs = user.soldRvs || [];
  const populatedSoldRvs = await Promise.all(
    soldRvs.map(async (entry) => {
      const doc = await db.collection('rvs').doc(entry.rvId).get();
      const rvData = doc.exists ? { id: doc.id, nickname: doc.data().nickname } : null;
      return { ...entry, rvId: rvData };
    })
  );

  return res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    user: { ...user, rvIds: rvDetails.filter(Boolean), selectedRvId: selectedRv, soldRvs: populatedSoldRvs }
  });
});

exports.updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, phone, currentMileage } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (phone !== undefined) update.phone = phone;
  if (req.file) update.profilePic = req.file.location;
  update.updatedAt = FieldValue.serverTimestamp();

  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) throw new ApiError('User not found', 404);
  const user = { id: userDoc.id, ...userDoc.data() };

  if (user.selectedRvId && currentMileage !== undefined) {
    const rvDoc = await db.collection('rvs').doc(user.selectedRvId).get();
    if (!rvDoc.exists) throw new ApiError('RV not found', 404);
    await db.collection('rvs').doc(user.selectedRvId).update({ currentMileage, updatedAt: FieldValue.serverTimestamp() });
  }

  await db.collection('users').doc(userId).update(update);
  const updatedDoc = await db.collection('users').doc(userId).get();
  const updatedUser = { id: updatedDoc.id, ...updatedDoc.data() };
  delete updatedUser.password;

  return res.status(200).json({
    success: true,
    message: 'User profile updated successfully',
    user: updatedUser
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userDoc = await db.collection('users').doc(req.user.id).get();
  if (!userDoc.exists) throw new ApiError('User not found', 404);
  const user = { id: userDoc.id, ...userDoc.data() };
  if (newPassword !== confirmPassword) throw new ApiError('Confirm password do not match', 400);
  if (oldPassword === newPassword) throw new ApiError('New password cannot be the same as the old password', 400);
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new ApiError('Invalid old password', 404);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await db.collection('users').doc(req.user.id).update({ password: hashedPassword, updatedAt: FieldValue.serverTimestamp() });
  return res.status(200).json({ success: true, message: 'Password changed successfully' });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.id).get();
  if (!userDoc.exists) throw new ApiError('User not found', 404);
  await db.collection('users').doc(req.user.id).delete();
  return res.status(200).json({ success: true, message: 'Account deleted successfully' });
});

exports.selectRV = asyncHandler(async (req, res) => {
  const { rvId } = req.body;
  const userDoc = await db.collection('users').doc(req.user.id).get();
  if (!userDoc.exists) throw new ApiError('User not found', 404);
  const user = { id: userDoc.id, ...userDoc.data() };
  const rvIds = user.rvIds || [];
  const selectedRvId = rvIds.length > 1 ? rvId : (rvIds[0] || rvId);
  await db.collection('users').doc(req.user.id).update({ selectedRvId, updatedAt: FieldValue.serverTimestamp() });
  return res.status(200).json({ success: true, message: 'RV selected successfully' });
});

exports.sellRv = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { rvId, sellingPrice, sellingMileage, sellingDate } = req.body;

  if (!rvId || !sellingPrice || !sellingMileage || !sellingDate) {
    throw new ApiError('All fields are required: rvId, sellingPrice, sellingMileage, sellingDate', 400);
  }
  if (sellingPrice <= 0) throw new ApiError('Selling price must be greater than 0', 400);
  if (sellingMileage < 0) throw new ApiError('Selling mileage cannot be negative', 400);

  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) throw new ApiError('User not found', 404);
  const user = { id: userDoc.id, ...userDoc.data() };

  const rvIds = user.rvIds || [];
  if (!rvIds.includes(rvId)) throw new ApiError('RV does not belong to this user', 403);

  const soldRvs = user.soldRvs || [];
  if (soldRvs.some(s => s.rvId === rvId)) throw new ApiError('This RV has already been sold', 400);

  const rvDoc = await db.collection('rvs').doc(rvId).get();
  if (!rvDoc.exists) throw new ApiError('RV not found', 404);
  if (rvDoc.data().isSold) throw new ApiError('This RV is already marked as sold', 400);

  await db.collection('rvs').doc(rvId).update({ isSold: true, updatedAt: FieldValue.serverTimestamp() });

  const soldEntry = { rvId, sellingPrice, sellingMileage, sellingDate: new Date(sellingDate) };
  await db.collection('users').doc(userId).update({
    soldRvs: FieldValue.arrayUnion(soldEntry),
    updatedAt: FieldValue.serverTimestamp()
  });

  return res.status(200).json({ success: true, message: 'RV sold successfully', soldRv: soldEntry });
});

exports.updateNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const allowed = ['maintenance', 'repairOrders', 'mpgAlerts', 'tripReminders', 'warrantyExpiry', 'generatorService'];
  const prefs = {};
  allowed.forEach(key => {
    if (req.body[key] !== undefined) prefs[key] = Boolean(req.body[key]);
  });
  await db.collection('users').doc(userId).update({
    notificationPreferences: prefs,
    updatedAt: FieldValue.serverTimestamp()
  });
  return res.status(200).json({ success: true, message: 'Notification preferences updated', notificationPreferences: prefs });
});

exports.getSoldRvs = asyncHandler(async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.id).get();
  if (!userDoc.exists) throw new ApiError('User not found', 404);
  const user = { id: userDoc.id, ...userDoc.data() };
  const soldRvs = user.soldRvs || [];

  const populated = await Promise.all(
    soldRvs.map(async (entry) => {
      const doc = await db.collection('rvs').doc(entry.rvId).get();
      const rv = doc.exists ? { id: doc.id, nickname: doc.data().nickname, manufacturer: doc.data().manufacturer, modelName: doc.data().modelName, modelYear: doc.data().modelYear, currentMileage: doc.data().currentMileage, isSold: doc.data().isSold } : null;
      return { ...entry, rvId: rv };
    })
  );

  return res.status(200).json({
    success: true,
    message: 'Sold RVs retrieved successfully',
    count: populated.length,
    soldRvs: populated
  });
});
