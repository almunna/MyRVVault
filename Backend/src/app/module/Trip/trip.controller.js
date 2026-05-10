const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const QueryBuilder = require('../../../builder/queryBuilder');
const { bucket } = require('../../../config/db');

const col = () => db.collection('trips');

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
    const {
        title, description, startDate, endDate, tripName, states, rvId,
        startOdometer, endOdometer, notes
    } = req.body;

    const selectedRvId = await getSelectedRvByUserId(userId);
    const targetRvId = rvId || selectedRvId;
    if (!targetRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    const startOdo = startOdometer ? Number(startOdometer) : null;
    const endOdo = endOdometer ? Number(endOdometer) : null;
    const milesDriven = startOdo && endOdo && endOdo > startOdo ? endOdo - startOdo : null;

    const photos = (req.files || []).map(f => ({
        url: f.location,
        filename: f.filename,
        mimetype: f.mimetype
    }));

    const data = {
        title,
        description: description || notes || null,
        startDate,
        endDate: endDate || null,
        tripName: tripName ? tripName.toUpperCase() : '',
        states: normalizeStates(states || [], startDate),
        startOdometer: startOdo,
        endOdometer: endOdo,
        milesDriven,
        fuelUsed: null,
        tripMpg: null,
        fuelLogIds: [],
        photos,
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

    if (trip.rvId) {
        const rvSnap = await db.collection('rvs').doc(trip.rvId).get();
        if (rvSnap.exists) {
            trip.rvId = { id: trip.rvId, name: rvSnap.data().name, licensePlate: rvSnap.data().licensePlate };
        }
    }

    // Populate linked fuel logs
    if (trip.fuelLogIds && trip.fuelLogIds.length > 0) {
        const fuelSnaps = await Promise.all(trip.fuelLogIds.map(id => db.collection('fuelLogs').doc(id).get()));
        trip.fuelLogs = fuelSnaps.filter(s => s.exists).map(s => docToObj(s));
    }

    res.status(200).json({ success: true, data: trip });
});


exports.updateTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, description, startDate, endDate, tripName, states, startOdometer, endOdometer, notes } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists || !snap.data().isActive) throw new ApiError('Trip not found', 404);

    const trip = docToObj(snap);
    if (trip.user !== userId) throw new ApiError('Trip not found', 404);

    const updates = { updatedAt: FieldValue.serverTimestamp() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (notes !== undefined) updates.description = notes;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (tripName !== undefined) updates.tripName = tripName.toUpperCase();
    if (states !== undefined) updates.states = normalizeStates(states, startDate || trip.startDate);

    const newStartOdo = startOdometer !== undefined ? (startOdometer ? Number(startOdometer) : null) : trip.startOdometer;
    const newEndOdo = endOdometer !== undefined ? (endOdometer ? Number(endOdometer) : null) : trip.endOdometer;

    if (startOdometer !== undefined) updates.startOdometer = newStartOdo;
    if (endOdometer !== undefined) updates.endOdometer = newEndOdo;

    if (newStartOdo && newEndOdo && newEndOdo > newStartOdo) {
        updates.milesDriven = newEndOdo - newStartOdo;
    }

    // Append new photos
    if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map(f => ({ url: f.location, filename: f.filename, mimetype: f.mimetype }));
        updates.photos = [...(trip.photos || []), ...newPhotos];
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


exports.linkFuelLog = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { fuelLogId } = req.body;

    if (!fuelLogId) throw new ApiError('fuelLogId is required', 400);

    const [tripSnap, fuelSnap] = await Promise.all([
        col().doc(req.params.id).get(),
        db.collection('fuelLogs').doc(fuelLogId).get()
    ]);

    if (!tripSnap.exists || !tripSnap.data().isActive) throw new ApiError('Trip not found', 404);
    const trip = docToObj(tripSnap);
    if (trip.user !== userId) throw new ApiError('Trip not found', 404);

    if (!fuelSnap.exists || fuelSnap.data().user !== userId) throw new ApiError('Fuel log not found', 404);

    // Update fuel log IDs on trip
    const fuelLogIds = Array.from(new Set([...(trip.fuelLogIds || []), fuelLogId]));

    // Recalculate fuelUsed and tripMpg
    const allFuelSnaps = await Promise.all(fuelLogIds.map(id => db.collection('fuelLogs').doc(id).get()));
    const allFuelLogs = allFuelSnaps.filter(s => s.exists).map(s => s.data());
    const fuelUsed = allFuelLogs.reduce((sum, l) => sum + (l.gallons || 0), 0);
    const milesDriven = trip.milesDriven || 0;
    const tripMpg = fuelUsed > 0 && milesDriven > 0 ? parseFloat((milesDriven / fuelUsed).toFixed(2)) : null;

    await col().doc(req.params.id).update({
        fuelLogIds,
        fuelUsed: parseFloat(fuelUsed.toFixed(2)),
        tripMpg,
        updatedAt: FieldValue.serverTimestamp()
    });

    // Also update the fuel log to reference this trip
    await db.collection('fuelLogs').doc(fuelLogId).update({ tripId: req.params.id });

    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, message: 'Fuel log linked to trip', data: updated });
});


exports.unlinkFuelLog = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { fuelLogId } = req.params;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists || !snap.data().isActive) throw new ApiError('Trip not found', 404);
    const trip = docToObj(snap);
    if (trip.user !== userId) throw new ApiError('Trip not found', 404);

    const fuelLogIds = (trip.fuelLogIds || []).filter(id => id !== fuelLogId);

    const allFuelSnaps = await Promise.all(fuelLogIds.map(id => db.collection('fuelLogs').doc(id).get()));
    const allFuelLogs = allFuelSnaps.filter(s => s.exists).map(s => s.data());
    const fuelUsed = allFuelLogs.reduce((sum, l) => sum + (l.gallons || 0), 0);
    const milesDriven = trip.milesDriven || 0;
    const tripMpg = fuelUsed > 0 && milesDriven > 0 ? parseFloat((milesDriven / fuelUsed).toFixed(2)) : null;

    await col().doc(req.params.id).update({
        fuelLogIds,
        fuelUsed: parseFloat(fuelUsed.toFixed(2)),
        tripMpg,
        updatedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({ success: true, message: 'Fuel log unlinked from trip' });
});


exports.deletePhoto = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { filename } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists || !snap.data().isActive) throw new ApiError('Trip not found', 404);
    const trip = docToObj(snap);
    if (trip.user !== userId) throw new ApiError('Trip not found', 404);

    if (filename) await bucket.file(filename).delete().catch(() => {});
    const photos = (trip.photos || []).filter(p => p.filename !== filename);
    await col().doc(req.params.id).update({ photos, updatedAt: FieldValue.serverTimestamp() });

    res.status(200).json({ success: true, message: 'Photo removed', data: { photos } });
});


exports.getActiveTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col()
        .where('user', '==', userId)
        .where('isActive', '==', true)
        .where('tripStatus', '==', 'in_progress')
        .limit(1)
        .get();
    if (snap.empty) return res.status(200).json({ success: true, data: null });
    res.status(200).json({ success: true, data: docToObj(snap.docs[0]) });
});


exports.startTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, startOdometer } = req.body;

    if (!title) throw new ApiError('Trip title is required', 400);

    const existing = await col()
        .where('user', '==', userId)
        .where('isActive', '==', true)
        .where('tripStatus', '==', 'in_progress')
        .limit(1)
        .get();
    if (!existing.empty) throw new ApiError('You already have a trip in progress. End it before starting a new one.', 400);

    const selectedRvId = await getSelectedRvByUserId(userId);
    if (!selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    const startOdo = startOdometer ? Number(startOdometer) : null;
    const startDate = new Date().toISOString().split('T')[0];

    const data = {
        title,
        tripStatus: 'in_progress',
        startDate,
        endDate: null,
        startOdometer: startOdo,
        endOdometer: null,
        milesDriven: null,
        description: null,
        states: [],
        photos: [],
        fuelLogIds: [],
        fuelUsed: null,
        tripMpg: null,
        rvId: selectedRvId,
        user: userId,
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await col().add(data);
    const snap = await ref.get();
    res.status(201).json({ success: true, message: 'Trip started!', data: docToObj(snap) });
});


exports.endTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { endOdometer } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists || !snap.data().isActive) throw new ApiError('Trip not found', 404);
    const trip = docToObj(snap);
    if (trip.user !== userId) throw new ApiError('Trip not found', 404);
    if (trip.tripStatus !== 'in_progress') throw new ApiError('This trip is not in progress', 400);

    const endOdo = endOdometer ? Number(endOdometer) : null;
    const milesDriven = trip.startOdometer && endOdo && endOdo > trip.startOdometer
        ? endOdo - trip.startOdometer
        : trip.milesDriven;
    const endDate = new Date().toISOString().split('T')[0];

    await col().doc(req.params.id).update({
        tripStatus: 'completed',
        endDate,
        endOdometer: endOdo,
        milesDriven: milesDriven || null,
        updatedAt: FieldValue.serverTimestamp()
    });

    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, message: 'Trip completed!', data: updated });
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
