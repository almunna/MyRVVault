const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const QueryBuilder = require('../../../builder/queryBuilder');

exports.addRv = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const rvRef = await db.collection('rvs').add({
    ...req.body,
    user: userId,
    isSold: false,
    isOverdueForMaintenance: false,
    overdueMaintenanceCount: 0,
    isUpcomingMaintenance: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  await db.collection('users').doc(userId).update({
    rvIds: FieldValue.arrayUnion(rvRef.id),
    selectedRvId: rvRef.id,
    updatedAt: FieldValue.serverTimestamp()
  });

  const rvDoc = await rvRef.get();
  res.status(201).json({ success: true, data: { id: rvDoc.id, ...rvDoc.data() } });
});

exports.getUserRvs = asyncHandler(async (req, res) => {
  const qb = new QueryBuilder(
    db.collection('rvs').where('user', '==', req.user.id),
    req.query
  )
    .search(['brand', 'model', 'nickname', 'nickName'])
    .filter()
    .sort()
    .paginate();

  const { data, meta } = await qb.execute();
  res.status(200).json({ success: true, meta, data });
});

exports.getRv = asyncHandler(async (req, res) => {
  const doc = await db.collection('rvs').doc(req.params.id).get();
  if (!doc.exists) throw new ApiError('RV not found', 404);
  res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
});

exports.updateRv = asyncHandler(async (req, res) => {
  await db.collection('rvs').doc(req.params.id).update({
    ...req.body,
    updatedAt: FieldValue.serverTimestamp()
  });
  const doc = await db.collection('rvs').doc(req.params.id).get();
  res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
});

exports.deleteRv = asyncHandler(async (req, res) => {
  const rvDoc = await db.collection('rvs').doc(req.params.id).get();
  if (!rvDoc.exists) throw new ApiError('RV not found', 404);
  const rv = { id: rvDoc.id, ...rvDoc.data() };

  await db.collection('rvs').doc(req.params.id).delete();

  // Remove rvId from all users that reference it
  const usersSnap = await db.collection('users').where('rvIds', 'array-contains', rv.id).get();
  const batch = db.batch();
  usersSnap.docs.forEach(doc => {
    batch.update(doc.ref, {
      rvIds: FieldValue.arrayRemove(rv.id),
      updatedAt: FieldValue.serverTimestamp()
    });
  });
  if (!usersSnap.empty) await batch.commit();

  res.status(200).json({ success: true, data: rv });
});

exports.updateCurrentMileage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentMileage } = req.body;
  if (typeof currentMileage !== 'number') {
    return res.status(400).json({ success: false, message: 'currentMileage must be a number' });
  }
  const doc = await db.collection('rvs').doc(id).get();
  if (!doc.exists) return res.status(404).json({ success: false, message: 'RV not found' });
  await db.collection('rvs').doc(id).update({ currentMileage, updatedAt: FieldValue.serverTimestamp() });
  const updated = await db.collection('rvs').doc(id).get();
  res.status(200).json({ success: true, message: 'Current mileage updated successfully', data: { id: updated.id, ...updated.data() } });
});

// Admin endpoint
exports.getRvs = asyncHandler(async (req, res) => {
  const snap = await db.collection('rvs').get();
  const rvs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, data: rvs });
});
