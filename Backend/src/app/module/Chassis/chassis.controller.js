const { db, FieldValue } = require('../../../config/db');
const { ApiError } = require('../../../errors/errorHandler');
const asyncHandler = require('../../../utils/asyncHandler');
const { docToObj } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

const col = () => db.collection('chassis');
const rvCol = () => db.collection('rvs');

exports.createChassis = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.body.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to add chassis for this RV', 403);

    const data = {
        ...req.body,
        user: userId,
        rvId,
        images: req.files?.map(f => f.location) || [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await col().add(data);
    const snap = await ref.get();
    const chassis = docToObj(snap);

    // Link chassis to RV
    await rvCol().doc(rvId).update({ chassis: chassis.id, updatedAt: FieldValue.serverTimestamp() });

    res.status(201).json({ success: true, message: 'Chassis created successfully', data: chassis });
});


exports.createOrUpdateChassis = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { id } = req.body;

    // Update existing chassis
    if (id) {
        const snap = await col().doc(id).get();
        if (!snap.exists) throw new ApiError('Chassis not found', 404);

        const chassis = docToObj(snap);
        const updates = { updatedAt: FieldValue.serverTimestamp() };
        Object.keys(req.body).forEach(key => { if (key !== 'id') updates[key] = req.body[key]; });

        if (req.files?.length > 0) {
            const oldImages = chassis.images || [];
            updates.images = req.files.map(f => f.location);
            await col().doc(id).update(updates);
            await deleteS3Objects(oldImages);
        } else {
            await col().doc(id).update(updates);
        }

        const updated = docToObj(await col().doc(id).get());
        return res.status(200).json({ success: true, message: 'Chassis updated successfully', data: updated });
    }

    // Create new chassis
    const selectedRvId = await getSelectedRvByUserId(userId);
    const rvId = req.body.rvId || selectedRvId;
    if (!rvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to add chassis for this RV', 403);

    const data = {
        ...req.body,
        user: userId,
        rvId,
        images: req.files?.map(f => f.location) || [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await col().add(data);
    const newSnap = await ref.get();
    const chassis = docToObj(newSnap);

    await rvCol().doc(rvId).update({ chassis: chassis.id, updatedAt: FieldValue.serverTimestamp() });

    return res.status(201).json({ success: true, message: 'Chassis created successfully', data: chassis });
});


exports.getChassis = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to view chassis for this RV', 403);

    const rvSnap = await rvCol().doc(rvId).get();
    if (!rvSnap.exists) throw new ApiError('RV not found', 404);

    const rv = docToObj(rvSnap);
    const chassisId = rv.chassis;

    if (!chassisId) {
        return res.status(200).json({ success: true, message: 'No chassis found', data: {} });
    }

    const chassisSnap = await col().doc(chassisId).get();
    if (!chassisSnap.exists) {
        return res.status(200).json({ success: true, message: 'No chassis found', data: {} });
    }

    const chassis = docToObj(chassisSnap);
    res.status(200).json({ success: true, message: 'Chassis retrieved successfully', data: chassis });
});


exports.getChassisById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Chassis not found or access denied', 404);

    const chassis = docToObj(snap);
    if (chassis.user !== userId) throw new ApiError('Chassis not found or access denied', 404);

    res.status(200).json({ success: true, message: 'Chassis retrieved successfully', data: chassis });
});


exports.updateChassis = asyncHandler(async (req, res) => {
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Chassis not found', 404);

    const chassis = docToObj(snap);
    const updates = { ...req.body, updatedAt: FieldValue.serverTimestamp() };

    if (req.files?.length > 0) {
        const oldImages = chassis.images || [];
        updates.images = req.files.map(f => f.location);
        await col().doc(req.params.id).update(updates);
        await deleteS3Objects(oldImages);
    } else {
        await col().doc(req.params.id).update(updates);
    }

    const updated = docToObj(await col().doc(req.params.id).get());
    return res.status(200).json({ success: true, message: 'Chassis updated successfully', data: updated });
});


exports.deleteChassis = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Chassis not found or access denied', 404);

    const chassis = docToObj(snap);
    if (chassis.user !== userId) throw new ApiError('Chassis not found or access denied', 404);

    // Remove chassis reference from RV
    if (chassis.rvId) {
        const rvSnap = await rvCol().doc(chassis.rvId).get();
        if (rvSnap.exists && rvSnap.data().chassis === req.params.id) {
            await rvCol().doc(chassis.rvId).update({
                chassis: FieldValue.delete(),
                updatedAt: FieldValue.serverTimestamp()
            });
        }
    }

    await col().doc(req.params.id).delete();

    res.status(200).json({ success: true, message: 'Chassis deleted successfully', data: {} });
});
