const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const QueryBuilder = require('../../../builder/queryBuilder');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const { bucket } = require('../../../config/db');

const col = () => db.collection('campgrounds');


exports.createCampground = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { name, location, checkIn, checkOut, notes, rating, tripId, rvId } = req.body;

    if (!name) throw new ApiError('Campground name is required', 400);

    const selectedRvId = await getSelectedRvByUserId(userId);
    const targetRvId = rvId || selectedRvId;
    if (!targetRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    if (rating !== undefined && (Number(rating) < 1 || Number(rating) > 5)) {
        throw new ApiError('Rating must be between 1 and 5', 400);
    }

    const photos = (req.files || []).map(f => ({
        url: f.location,
        filename: f.filename,
        mimetype: f.mimetype
    }));

    const data = {
        name,
        location: location || null,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        notes: notes || null,
        rating: rating ? Number(rating) : null,
        photos,
        tripId: tripId || null,
        rvId: targetRvId,
        user: userId,
        isFavorite: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await col().add(data);
    const snap = await ref.get();

    res.status(201).json({ success: true, message: 'Campground added successfully', data: docToObj(snap) });
});


exports.getAllCampgrounds = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let { rvId, tripId } = req.query;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected.', 400);
    if (!rvId) rvId = selectedRvId;

    let colRef = col().where('user', '==', userId).where('rvId', '==', rvId);
    if (tripId) colRef = colRef.where('tripId', '==', tripId);

    const result = await new QueryBuilder(colRef, req.query)
        .search(['name', 'location', 'notes'])
        .sort()
        .paginate()
        .execute();

    res.status(200).json({
        success: true,
        message: result.data.length ? 'Campgrounds retrieved' : 'No campgrounds found',
        meta: result.meta,
        data: result.data
    });
});


exports.getCampground = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Campground not found', 404);

    const cg = docToObj(snap);
    if (cg.user !== userId) throw new ApiError('Campground not found', 404);

    // Populate trip info if linked
    if (cg.tripId) {
        const tripSnap = await db.collection('trips').doc(cg.tripId).get();
        if (tripSnap.exists) {
            cg.trip = { id: cg.tripId, title: tripSnap.data().title, startDate: tripSnap.data().startDate };
        }
    }

    res.status(200).json({ success: true, data: cg });
});


exports.updateCampground = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { name, location, checkIn, checkOut, notes, rating, tripId } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Campground not found', 404);

    const cg = docToObj(snap);
    if (cg.user !== userId) throw new ApiError('Campground not found', 404);

    if (rating !== undefined && rating !== null && (Number(rating) < 1 || Number(rating) > 5)) {
        throw new ApiError('Rating must be between 1 and 5', 400);
    }

    const updates = { updatedAt: FieldValue.serverTimestamp() };
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (checkIn !== undefined) updates.checkIn = checkIn;
    if (checkOut !== undefined) updates.checkOut = checkOut;
    if (notes !== undefined) updates.notes = notes;
    if (rating !== undefined) updates.rating = rating ? Number(rating) : null;
    if (tripId !== undefined) updates.tripId = tripId;

    // Append new photos
    if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map(f => ({
            url: f.location,
            filename: f.filename,
            mimetype: f.mimetype
        }));
        updates.photos = [...(cg.photos || []), ...newPhotos];
    }

    await col().doc(req.params.id).update(updates);
    const updated = docToObj(await col().doc(req.params.id).get());

    res.status(200).json({ success: true, message: 'Campground updated', data: updated });
});


exports.deleteCampground = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Campground not found', 404);

    const cg = docToObj(snap);
    if (cg.user !== userId) throw new ApiError('Campground not found', 404);

    // Delete photos from storage
    const deleteOps = (cg.photos || []).map(p => {
        if (p.filename) return bucket.file(p.filename).delete().catch(() => {});
        return Promise.resolve();
    });
    await Promise.all(deleteOps);

    await col().doc(req.params.id).delete();

    res.status(200).json({ success: true, message: 'Campground deleted', data: {} });
});


exports.toggleFavorite = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Campground not found', 404);

    const cg = docToObj(snap);
    if (cg.user !== userId) throw new ApiError('Campground not found', 404);

    const newVal = !cg.isFavorite;
    await col().doc(req.params.id).update({ isFavorite: newVal, updatedAt: FieldValue.serverTimestamp() });

    res.status(200).json({ success: true, message: newVal ? 'Added to favorites' : 'Removed from favorites', data: { isFavorite: newVal } });
});


exports.deletePhoto = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { filename } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Campground not found', 404);

    const cg = docToObj(snap);
    if (cg.user !== userId) throw new ApiError('Campground not found', 404);

    if (filename) await bucket.file(filename).delete().catch(() => {});
    const updatedPhotos = (cg.photos || []).filter(p => p.filename !== filename);
    await col().doc(req.params.id).update({ photos: updatedPhotos, updatedAt: FieldValue.serverTimestamp() });

    res.status(200).json({ success: true, message: 'Photo removed', data: { photos: updatedPhotos } });
});
