const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const QueryBuilder = require('../../../builder/queryBuilder');
const { createNotification, getUserNotificationPrefs } = require('../../../utils/notificationHelper');

const col = () => db.collection('fuelLogs');
const rvCol = () => db.collection('rvs');
const userCol = () => db.collection('users');

async function checkRvOwnership(userId, rvId) {
    const userSnap = await userCol().doc(userId).get();
    if (!userSnap.exists) return false;
    const user = userSnap.data();
    return Array.isArray(user.rvIds) && user.rvIds.includes(rvId);
}

async function getPreviousEntry(userId, rvId, excludeId = null) {
    const snap = await col()
        .where('user', '==', userId)
        .where('rvId', '==', rvId)
        .get();
    const logs = queryToArr(snap);
    const filtered = (excludeId ? logs.filter(l => l.id !== excludeId) : logs)
        .sort((a, b) => b.odometer - a.odometer);
    return filtered.length > 0 ? filtered[0] : null;
}

exports.createFuelLog = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.body?.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to add fuel logs for this RV', 403);

    const {
        odometer, gallons, pricePerGallon, notes, tripId, date,
        stationName, stationAddress, stationCity, stationState, stationZip, stationPhone, stationWebsite,
    } = req.body;

    if (!odometer) throw new ApiError('Odometer reading is required', 400);
    if (!gallons) throw new ApiError('Gallons is required', 400);
    if (Number(gallons) <= 0) throw new ApiError('Gallons must be greater than 0', 400);
    if (pricePerGallon !== undefined && Number(pricePerGallon) < 0) throw new ApiError('Price must be 0 or greater', 400);

    const prevEntry = await getPreviousEntry(userId, rvId);
    if (prevEntry && Number(odometer) <= prevEntry.odometer) {
        throw new ApiError(`Odometer must be higher than previous entry (${prevEntry.odometer})`, 400);
    }

    const milesDriven = prevEntry ? Number(odometer) - prevEntry.odometer : 0;
    const mpg = milesDriven > 0 ? parseFloat((milesDriven / Number(gallons)).toFixed(2)) : null;
    const totalCost = pricePerGallon ? parseFloat((Number(pricePerGallon) * Number(gallons)).toFixed(2)) : null;
    const costPerMile = totalCost && milesDriven > 0 ? parseFloat((totalCost / milesDriven).toFixed(4)) : null;

    const data = {
        odometer: Number(odometer),
        gallons: Number(gallons),
        pricePerGallon: pricePerGallon ? Number(pricePerGallon) : null,
        totalCost,
        mpg,
        milesDriven,
        costPerMile,
        notes: notes || '',
        tripId: tripId || null,
        date: date || new Date().toISOString(),
        stationName: stationName || null,
        stationAddress: stationAddress || null,
        stationCity: stationCity || null,
        stationState: stationState || null,
        stationZip: stationZip || null,
        stationPhone: stationPhone || null,
        stationWebsite: stationWebsite || null,
        user: userId,
        rvId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await col().add(data);
    const snap = await ref.get();
    const fuelLog = docToObj(snap);

    // MPG trend alert: notify if this MPG is >25% below the rolling average
    if (mpg && mpg > 0) {
        const prefs = await getUserNotificationPrefs(userId);
        if (prefs.mpgAlerts) {
            const allSnap = await col().where('user', '==', userId).where('rvId', '==', rvId).get();
            const allMpg  = queryToArr(allSnap).filter(l => l.mpg && l.id !== fuelLog.id).map(l => l.mpg);
            if (allMpg.length >= 3) {
                const avg = allMpg.reduce((s, v) => s + v, 0) / allMpg.length;
                if (mpg < avg * 0.75) {
                    await createNotification(userId, {
                        type:     'mpg',
                        priority: 'medium',
                        title:    'MPG Drop Detected',
                        message:  `Latest fill-up was ${mpg} MPG — ${Math.round((1 - mpg / avg) * 100)}% below your average of ${avg.toFixed(1)} MPG`,
                        href:     '/fuelList',
                        refId:    `mpg-alert-${fuelLog.id}`,
                    });
                }
            }
        }
    }

    res.status(201).json({ success: true, message: 'Fuel log created successfully', data: fuelLog });
});

exports.getFuelLogs = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('Access denied', 403);

    const colRef = col().where('user', '==', userId).where('rvId', '==', rvId);
    const result = await new QueryBuilder(colRef, req.query)
        .search(['notes'])
        .filter()
        .sort()
        .paginate()
        .execute();

    // Summary stats across all entries
    const allSnap = await col().where('user', '==', userId).where('rvId', '==', rvId).get();
    const all = queryToArr(allSnap);
    const totalGallons = all.reduce((s, l) => s + (l.gallons || 0), 0);
    const totalCost = all.reduce((s, l) => s + (l.totalCost || 0), 0);
    const mpgValues = all.filter(l => l.mpg != null).map(l => l.mpg);
    const avgMpg = mpgValues.length ? parseFloat((mpgValues.reduce((s, v) => s + v, 0) / mpgValues.length).toFixed(2)) : null;

    res.status(200).json({
        success: true,
        message: 'Fuel logs retrieved successfully',
        data: result.data,
        meta: result.meta,
        summary: {
            totalGallons: parseFloat(totalGallons.toFixed(2)),
            totalCost: parseFloat(totalCost.toFixed(2)),
            avgMpg,
            totalEntries: all.length
        }
    });
});

exports.getFuelLogById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Fuel log not found', 404);
    const log = docToObj(snap);
    if (log.user !== userId) throw new ApiError('Fuel log not found', 404);
    res.status(200).json({ success: true, message: 'Fuel log retrieved successfully', data: log });
});

exports.updateFuelLog = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Fuel log not found', 404);
    const existing = docToObj(snap);
    if (existing.user !== userId) throw new ApiError('Fuel log not found', 404);

    const updates = { ...req.body, updatedAt: FieldValue.serverTimestamp() };

    if (req.body.odometer || req.body.gallons) {
        const newOdometer = Number(req.body.odometer || existing.odometer);
        const newGallons = Number(req.body.gallons || existing.gallons);
        const prevEntry = await getPreviousEntry(userId, existing.rvId, existing.id);

        if (prevEntry && newOdometer <= prevEntry.odometer) {
            throw new ApiError(`Odometer must be higher than previous entry (${prevEntry.odometer})`, 400);
        }

        const milesDriven = prevEntry ? newOdometer - prevEntry.odometer : existing.milesDriven || 0;
        const mpg = milesDriven > 0 ? parseFloat((milesDriven / newGallons).toFixed(2)) : null;
        const newPrice = req.body.pricePerGallon !== undefined ? Number(req.body.pricePerGallon) : existing.pricePerGallon;
        const totalCost = newPrice ? parseFloat((newPrice * newGallons).toFixed(2)) : null;
        const costPerMile = totalCost && milesDriven > 0 ? parseFloat((totalCost / milesDriven).toFixed(4)) : null;

        Object.assign(updates, { odometer: newOdometer, gallons: newGallons, milesDriven, mpg, totalCost, costPerMile });
    }

    await col().doc(req.params.id).update(updates);
    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, message: 'Fuel log updated successfully', data: updated });
});

exports.deleteFuelLog = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Fuel log not found', 404);
    const log = docToObj(snap);
    if (log.user !== userId) throw new ApiError('Fuel log not found', 404);
    await col().doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'Fuel log deleted successfully', data: {} });
});

exports.getFuelStats = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected.', 400);
    if (!rvId) rvId = selectedRvId;

    const snap = await col()
        .where('user', '==', userId)
        .where('rvId', '==', rvId)
        .get();
    const logs = queryToArr(snap).sort((a, b) => a.odometer - b.odometer);

    const mpgTrend = logs.filter(l => l.mpg != null).map(l => ({ date: l.date, mpg: l.mpg, odometer: l.odometer }));
    const costTrend = logs.filter(l => l.totalCost != null).map(l => ({ date: l.date, totalCost: l.totalCost, gallons: l.gallons }));

    const totalMiles = logs.length > 1 ? logs[logs.length - 1].odometer - logs[0].odometer : 0;
    const totalGallons = logs.reduce((s, l) => s + (l.gallons || 0), 0);
    const totalCost = logs.reduce((s, l) => s + (l.totalCost || 0), 0);
    const overallMpg = totalGallons > 0 && totalMiles > 0 ? parseFloat((totalMiles / totalGallons).toFixed(2)) : null;

    res.status(200).json({
        success: true,
        message: 'Fuel stats retrieved successfully',
        data: {
            mpgTrend,
            costTrend,
            summary: {
                totalMiles,
                totalGallons: parseFloat(totalGallons.toFixed(2)),
                totalCost: parseFloat(totalCost.toFixed(2)),
                overallMpg,
                totalFillUps: logs.length
            }
        }
    });
});
