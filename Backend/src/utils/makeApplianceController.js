const { db, FieldValue } = require('../config/db');
const asyncHandler = require('./asyncHandler');
const { ApiError } = require('../errors/errorHandler');
const QueryBuilder = require('../builder/queryBuilder');
const getSelectedRvByUserId = require('./currentRv');
const deleteDocumentWithFiles = require('./deleteDocumentWithImages');
const deleteS3Objects = require('./deleteS3ObjectsImage');

/**
 * Factory that generates standard CRUD controller methods for an appliance collection.
 * @param {string} collectionName - Firestore collection name (e.g. 'tires')
 * @param {string[]} searchFields  - Fields to search in list endpoint (e.g. ['name', 'brand'])
 * @param {string} label          - Human-readable label for response messages (e.g. 'Tire')
 */
function makeApplianceController(collectionName, searchFields = [], label = 'Item') {
  const create = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if (!rvId) rvId = selectedRvId;

    const images = req.files ? req.files.map(f => f.location) : [];

    const ref = await db.collection(collectionName).add({
      ...req.body,
      rvId,
      user: userId,
      images,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    const doc = await ref.get();
    res.status(201).json({
      success: true,
      message: `${label} created successfully`,
      data: { id: doc.id, ...doc.data() }
    });
  });

  const getAll = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if (!rvId) rvId = selectedRvId;

    const qb = new QueryBuilder(
      db.collection(collectionName).where('user', '==', userId).where('rvId', '==', rvId),
      req.query
    )
      .search(searchFields)
      .filter()
      .sort()
      .paginate();

    const { data, meta } = await qb.execute();

    return res.status(200).json({
      success: true,
      message: data.length === 0 ? `No ${label.toLowerCase()}s found` : `${label} retrieved successfully`,
      meta,
      data
    });
  });

  const getById = asyncHandler(async (req, res) => {
    const doc = await db.collection(collectionName).doc(req.params.id).get();
    if (!doc.exists) throw new ApiError(`${label} not found`, 404);
    return res.status(200).json({
      success: true,
      message: `${label} retrieved successfully`,
      data: { id: doc.id, ...doc.data() }
    });
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await db.collection(collectionName).doc(req.params.id).get();
    if (!doc.exists) throw new ApiError(`${label} not found`, 404);

    const updateData = { ...req.body, updatedAt: FieldValue.serverTimestamp() };

    if (req.files && req.files.length > 0) {
      const oldImages = doc.data().images || [];
      updateData.images = req.files.map(f => f.location);
      await db.collection(collectionName).doc(req.params.id).update(updateData);
      await deleteS3Objects(oldImages);
    } else {
      await db.collection(collectionName).doc(req.params.id).update(updateData);
    }

    const updated = await db.collection(collectionName).doc(req.params.id).get();
    return res.status(200).json({
      success: true,
      message: `${label} updated successfully`,
      data: { id: updated.id, ...updated.data() }
    });
  });

  const remove = asyncHandler(async (req, res) => {
    const data = await deleteDocumentWithFiles(collectionName, req.params.id);
    if (!data) throw new ApiError(`${label} not found`, 404);
    return res.status(200).json({
      success: true,
      message: `${label} deleted successfully`,
      data
    });
  });

  return { create, getAll, getById, update, remove };
}

module.exports = makeApplianceController;
