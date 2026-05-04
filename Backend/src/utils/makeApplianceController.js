const { db, FieldValue } = require('../config/db');
const asyncHandler = require('./asyncHandler');
const { ApiError } = require('../errors/errorHandler');
const QueryBuilder = require('../builder/queryBuilder');
const getSelectedRvByUserId = require('./currentRv');
const deleteDocumentWithFiles = require('./deleteDocumentWithImages');
const deleteS3Objects = require('./deleteS3ObjectsImage');
const { calculateHealthScore } = require('./healthScore');
const { docToObj } = require('./firestoreHelper');

/**
 * Fetch current RV mileage for health score calculation.
 */
async function getRvMileage(rvId) {
    try {
        const snap = await db.collection('rvs').doc(rvId).get();
        return snap.exists ? (snap.data().currentMileage || 0) : 0;
    } catch { return 0; }
}

/**
 * Factory that generates standard CRUD + replacement controller methods for an appliance collection.
 */
function makeApplianceController(collectionName, searchFields = [], label = 'Item') {
    const col = () => db.collection(collectionName);

    const create = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const selectedRvId = await getSelectedRvByUserId(userId);
        let rvId = req.body.rvId;
        if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
        if (!rvId) rvId = selectedRvId;

        const images = req.files ? req.files.map(f => f.location) : [];

        const data = {
            ...req.body,
            rvId,
            user: userId,
            images,
            // numeric coercions
            installMileage:    req.body.installMileage    != null ? Number(req.body.installMileage)    : null,
            installHours:      req.body.installHours      != null ? Number(req.body.installHours)      : null,
            cost:              req.body.cost              != null ? Number(req.body.cost)              : null,
            replacementHistory: [],
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        const ref = await col().add(data);
        const snap = await ref.get();
        const item = docToObj(snap);
        const currentMileage = await getRvMileage(rvId);
        const health = calculateHealthScore(item, currentMileage);

        res.status(201).json({
            success: true,
            message: `${label} created successfully`,
            data: { ...item, health }
        });
    });

    const getAll = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const selectedRvId = await getSelectedRvByUserId(userId);
        let rvId = req.query.rvId || selectedRvId;

        if (!rvId) {
            return res.status(200).json({
                success: true,
                message: 'No RV selected',
                meta: { total: 0 },
                data: []
            });
        }

        const currentMileage = await getRvMileage(rvId);

        const qb = new QueryBuilder(
            col().where('user', '==', userId).where('rvId', '==', rvId),
            req.query
        ).search(searchFields).filter().sort().paginate();

        const { data, meta } = await qb.execute();

        const dataWithHealth = data.map(item => ({
            ...item,
            health: calculateHealthScore(item, currentMileage)
        }));

        return res.status(200).json({
            success: true,
            message: data.length === 0 ? `No ${label.toLowerCase()}s found` : `${label} retrieved successfully`,
            meta,
            data: dataWithHealth
        });
    });

    const getById = asyncHandler(async (req, res) => {
        const doc = await col().doc(req.params.id).get();
        if (!doc.exists) throw new ApiError(`${label} not found`, 404);
        const item = docToObj(doc);
        const currentMileage = await getRvMileage(item.rvId);
        const health = calculateHealthScore(item, currentMileage);
        return res.status(200).json({
            success: true,
            message: `${label} retrieved successfully`,
            data: { ...item, health }
        });
    });

    const update = asyncHandler(async (req, res) => {
        const doc = await col().doc(req.params.id).get();
        if (!doc.exists) throw new ApiError(`${label} not found`, 404);

        const updateData = {
            ...req.body,
            updatedAt: FieldValue.serverTimestamp()
        };
        if (req.body.installMileage != null) updateData.installMileage = Number(req.body.installMileage);
        if (req.body.installHours   != null) updateData.installHours   = Number(req.body.installHours);
        if (req.body.cost           != null) updateData.cost           = Number(req.body.cost);

        const oldImages = doc.data().images || [];
        const newUploads = req.files ? req.files.map(f => f.location) : [];
        const keepImages = req.body.keepImages ? JSON.parse(req.body.keepImages) : null;
        delete updateData.keepImages;

        if (keepImages !== null) {
            const toDelete = oldImages.filter(url => !keepImages.includes(url));
            updateData.images = [...keepImages, ...newUploads];
            await col().doc(req.params.id).update(updateData);
            if (toDelete.length > 0) await deleteS3Objects(toDelete);
        } else if (newUploads.length > 0) {
            updateData.images = newUploads;
            await col().doc(req.params.id).update(updateData);
            await deleteS3Objects(oldImages);
        } else {
            await col().doc(req.params.id).update(updateData);
        }

        const updated = docToObj(await col().doc(req.params.id).get());
        const currentMileage = await getRvMileage(updated.rvId);
        const health = calculateHealthScore(updated, currentMileage);

        return res.status(200).json({
            success: true,
            message: `${label} updated successfully`,
            data: { ...updated, health }
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

    /**
     * Mark component as replaced:
     * - Appends entry to replacementHistory
     * - Sets lastReplacedDate, resets installDate/installMileage/installHours
     */
    const markAsReplaced = asyncHandler(async (req, res) => {
        const doc = await col().doc(req.params.id).get();
        if (!doc.exists) throw new ApiError(`${label} not found`, 404);

        const existing = docToObj(doc);
        const now = new Date().toISOString();

        const historyEntry = {
            replacedAt:     now,
            notes:          req.body.notes          || '',
            replacedMileage: req.body.replacedMileage != null ? Number(req.body.replacedMileage) : null,
            replacedHours:  req.body.replacedHours  != null ? Number(req.body.replacedHours)   : null,
            cost:           req.body.cost           != null ? Number(req.body.cost)            : null,
        };

        const updateData = {
            lastReplacedDate:    now,
            installDate:         now,
            installMileage:      req.body.replacedMileage != null ? Number(req.body.replacedMileage) : (existing.installMileage || null),
            installHours:        req.body.replacedHours  != null ? Number(req.body.replacedHours)   : (existing.installHours   || null),
            replacementHistory:  FieldValue.arrayUnion(historyEntry),
            updatedAt:           FieldValue.serverTimestamp()
        };

        await col().doc(req.params.id).update(updateData);
        const updated = docToObj(await col().doc(req.params.id).get());
        const currentMileage = await getRvMileage(updated.rvId);
        const health = calculateHealthScore(updated, currentMileage);

        return res.status(200).json({
            success: true,
            message: `${label} marked as replaced. Age and mileage reset.`,
            data: { ...updated, health }
        });
    });

    return { create, getAll, getById, update, remove, markAsReplaced };
}

module.exports = makeApplianceController;
