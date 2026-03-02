const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const QueryBuilder = require('../../../builder/queryBuilder');

const col = () => db.collection('trips');

// Simple ID generator for nested state visits (replaces Mongoose subdoc _id)
const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const normalizeStates = (states = [], startDate) =>
    states.map(sv => ({
        id: sv.id || makeId(),
        state: sv.state ? sv.state.toUpperCase() : sv.state,
        status: sv.status ? sv.status.toUpperCase() : sv.status,
        visitDate: sv.visitDate || (sv.status && sv.status.toUpperCase() !== 'PLANNING' ? startDate : null)
    }));


exports.createTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, description, startDate, endDate, tripName, states, rvId } = req.body;

    const selectedRvId = await getSelectedRvByUserId(userId);
    const targetRvId = rvId || selectedRvId;
    if (!targetRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    const data = {
        title,
        description,
        startDate,
        endDate,
        tripName: tripName ? tripName.toUpperCase() : '',
        states: normalizeStates(states || [], startDate),
        rvId: targetRvId,
        user: userId,
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await col().add(data);
    const snap = await ref.get();

    res.status(201).json({ success: true, message: 'Trip created successfully', data: docToObj(snap) });
});


exports.getAllTrips = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const colRef = col().where('user', '==', userId).where('isActive', '==', true);
    const result = await new QueryBuilder(colRef, req.query)
        .search(['title', 'description', 'tripName'])
        .filter()
        .sort()
        .paginate()
        .execute();

    // Manual populate: attach RV name/licensePlate for each trip
    const rvCache = {};
    const data = await Promise.all(result.data.map(async trip => {
        if (!trip.rvId) return trip;
        if (!rvCache[trip.rvId]) {
            const rvSnap = await db.collection('rvs').doc(trip.rvId).get();
            rvCache[trip.rvId] = rvSnap.exists ? { name: rvSnap.data().name, licensePlate: rvSnap.data().licensePlate } : null;
        }
        return { ...trip, rvId: rvCache[trip.rvId] ? { id: trip.rvId, ...rvCache[trip.rvId] } : trip.rvId };
    }));

    res.status(200).json({
        success: true,
        message: data.length ? 'Trips retrieved successfully' : 'No trips found',
        meta: result.meta,
        data
    });
});


exports.getTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists || !snap.data().isActive) {
        return res.status(200).json({ success: true, message: 'Trip not found', data: null });
    }

    const trip = docToObj(snap);
    if (trip.user !== userId) {
        return res.status(200).json({ success: true, message: 'Trip not found', data: null });
    }

    // Populate RV info
    if (trip.rvId) {
        const rvSnap = await db.collection('rvs').doc(trip.rvId).get();
        if (rvSnap.exists) {
            trip.rvId = { id: trip.rvId, name: rvSnap.data().name, licensePlate: rvSnap.data().licensePlate };
        }
    }

    res.status(200).json({ success: true, data: trip });
});


exports.updateTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, description, startDate, endDate, tripName, states } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists || !snap.data().isActive) throw new ApiError('Trip not found', 404);

    const trip = docToObj(snap);
    if (trip.user !== userId) throw new ApiError('Trip not found', 404);

    const updates = { updatedAt: FieldValue.serverTimestamp() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (tripName !== undefined) updates.tripName = tripName.toUpperCase();
    if (states !== undefined) {
        updates.states = normalizeStates(states, startDate || trip.startDate);
    }

    await col().doc(req.params.id).update(updates);
    const updated = docToObj(await col().doc(req.params.id).get());

    res.status(200).json({ success: true, message: 'Trip updated successfully', data: updated });
});


exports.deleteTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Trip not found', 404);

    const trip = docToObj(snap);
    if (trip.user !== userId) throw new ApiError('Trip not found', 404);

    await col().doc(req.params.id).update({ isActive: false, updatedAt: FieldValue.serverTimestamp() });

    res.status(200).json({ success: true, message: 'Trip deleted successfully', data: {} });
});


exports.addStateVisit = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { state, status, visitDate } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists || !snap.data().isActive) throw new ApiError('Trip not found', 404);

    const trip = docToObj(snap);
    if (trip.user !== userId) throw new ApiError('Trip not found', 404);

    const newStateVisit = {
        id: makeId(),
        state: state.toUpperCase(),
        status: status.toUpperCase(),
        visitDate: visitDate || (status.toUpperCase() !== 'PLANNING' ? trip.startDate : null)
    };

    const updatedStates = [...(trip.states || []), newStateVisit];
    await col().doc(req.params.id).update({ states: updatedStates, updatedAt: FieldValue.serverTimestamp() });

    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, message: 'State visit added successfully', data: updated });
});


exports.removeStateVisit = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists || !snap.data().isActive) throw new ApiError('Trip not found', 404);

    const trip = docToObj(snap);
    if (trip.user !== userId) throw new ApiError('Trip not found', 404);

    const updatedStates = (trip.states || []).filter(sv => sv.id !== req.params.stateVisitId);
    await col().doc(req.params.id).update({ states: updatedStates, updatedAt: FieldValue.serverTimestamp() });

    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, message: 'State visit removed successfully', data: updated });
});


exports.getStateStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().where('user', '==', userId).where('isActive', '==', true).get();
    const trips = queryToArr(snap);

    const stateStats = {};
    trips.forEach(trip => {
        (trip.states || []).forEach(stateVisit => {
            const stateName = stateVisit.name || stateVisit.state;
            const status = stateVisit.status ? stateVisit.status.toLowerCase() : '';

            if (!stateStats[stateName]) {
                stateStats[stateName] = { state: stateName, total: 0, camped: 0, planning: 0, traveled: 0, lastVisit: null };
            }

            stateStats[stateName].total += 1;
            if (status === 'camped') stateStats[stateName].camped += 1;
            else if (status === 'planning') stateStats[stateName].planning += 1;
            else if (status === 'traveled_through') stateStats[stateName].traveled += 1;

            if (stateVisit.visitDate) {
                const vDate = new Date(stateVisit.visitDate);
                if (!stateStats[stateName].lastVisit || vDate > new Date(stateStats[stateName].lastVisit)) {
                    stateStats[stateName].lastVisit = stateVisit.visitDate;
                }
            }
        });
    });

    const result = Object.values(stateStats).sort((a, b) => b.total - a.total);
    res.status(200).json({ success: true, data: result });
});


exports.getTripsByState = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const state = req.params.state.toUpperCase();

    // Firestore doesn't support array-contains for nested objects with field matching,
    // so fetch all active trips and filter JS-side
    const snap = await col().where('user', '==', userId).where('isActive', '==', true).get();
    const trips = queryToArr(snap);

    const filtered = trips
        .filter(trip => (trip.states || []).some(sv => sv.state === state))
        .sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
            const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
            return dateB - dateA;
        });

    res.status(200).json({ success: true, count: filtered.length, state, data: filtered });
});
