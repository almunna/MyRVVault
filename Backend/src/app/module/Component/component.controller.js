/**
 * Generic component endpoint — handles operations that apply to any appliance collection.
 * Currently: markAsReplaced, getHealthScore
 *
 * Route param :collection must be one of the valid appliance Firestore collections.
 */
const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj } = require('../../../utils/firestoreHelper');
const { calculateHealthScore } = require('../../../utils/healthScore');

// Whitelist of valid appliance collections (security: prevent arbitrary collection access)
const VALID_COLLECTIONS = new Set([
    'airConditioners', 'heaters', 'waterPumps', 'washers', 'waterHeaters',
    'dryers', 'toilets', 'dishwashers', 'exhaustFans', 'ventFans', 'cellingFans',
    'tvs', 'dvds', 'surroundSounds', 'wifiRouters', 'internetSatellite',
    'gpsSystems', 'outdoorRadios', 'tires'
]);

async function getRvMileage(rvId) {
    try {
        const snap = await db.collection('rvs').doc(rvId).get();
        return snap.exists ? (snap.data().currentMileage || 0) : 0;
    } catch { return 0; }
}

/**
 * PUT /api/component/replace/:collection/:id
 * Body: { notes, replacedMileage, replacedHours, cost }
 * Appends to replacementHistory and resets install date/mileage/hours.
 */
exports.markAsReplaced = asyncHandler(async (req, res) => {
    const { collection, id } = req.params;
    const userId = req.user.id;

    if (!VALID_COLLECTIONS.has(collection)) {
        throw new ApiError(`Invalid component collection: ${collection}`, 400);
    }

    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) throw new ApiError('Component not found', 404);

    const existing = docToObj(doc);
    if (existing.user !== userId) throw new ApiError('Not authorized', 403);

    const now = new Date().toISOString();
    const historyEntry = {
        replacedAt:      now,
        notes:           req.body.notes            || '',
        replacedMileage: req.body.replacedMileage  != null ? Number(req.body.replacedMileage) : null,
        replacedHours:   req.body.replacedHours    != null ? Number(req.body.replacedHours)   : null,
        cost:            req.body.cost             != null ? Number(req.body.cost)            : null,
    };

    await db.collection(collection).doc(id).update({
        lastReplacedDate:    now,
        installDate:         now,
        installMileage:      historyEntry.replacedMileage ?? (existing.installMileage ?? null),
        installHours:        historyEntry.replacedHours   ?? (existing.installHours   ?? null),
        replacementHistory:  FieldValue.arrayUnion(historyEntry),
        updatedAt:           FieldValue.serverTimestamp()
    });

    const updated = docToObj(await db.collection(collection).doc(id).get());
    const currentMileage = await getRvMileage(updated.rvId);
    const health = calculateHealthScore(updated, currentMileage);

    res.status(200).json({
        success: true,
        message: 'Component marked as replaced. Health score reset.',
        data: { ...updated, health }
    });
});

/**
 * GET /api/component/health/:collection/:id
 * Returns the current health score for a component.
 */
exports.getHealthScore = asyncHandler(async (req, res) => {
    const { collection, id } = req.params;
    const userId = req.user.id;

    if (!VALID_COLLECTIONS.has(collection)) {
        throw new ApiError(`Invalid component collection: ${collection}`, 400);
    }

    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) throw new ApiError('Component not found', 404);

    const item = docToObj(doc);
    if (item.user !== userId) throw new ApiError('Not authorized', 403);

    const currentMileage = await getRvMileage(item.rvId);
    const health = calculateHealthScore(item, currentMileage);

    res.status(200).json({
        success: true,
        message: 'Health score calculated',
        data: { componentId: id, collection, ...health }
    });
});
