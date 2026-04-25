const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const QueryBuilder = require('../../../builder/queryBuilder');

const col = () => db.collection('generatorLogs');
const rvCol = () => db.collection('rvs');
const userCol = () => db.collection('users');

async function checkRvOwnership(userId, rvId) {
    const userSnap = await userCol().doc(userId).get();
    if (!userSnap.exists) return false;
    const user = userSnap.data();
    return Array.isArray(user.rvIds) && user.rvIds.includes(rvId);
}

async function recalcTotalHours(userId, rvId) {
    const snap = await col().where('user', '==', userId).where('rvId', '==', rvId).get();
    const logs = queryToArr(snap);
    return logs.reduce((sum, l) => sum + (Number(l.hours) || 0), 0);
}

exports.createGeneratorLog = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.body?.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('Access denied', 403);

    const { hours, date, notes } = req.body;
    if (!hours || Number(hours) <= 0) throw new ApiError('Hours must be a positive number', 400);

    const data = {
        hours: Number(hours),
        date: date || new Date().toISOString(),
        notes: notes || '',
        user: userId,
        rvId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await col().add(data);
    const snap = await ref.get();
    const log = docToObj(snap);

    // Update RV total generator hours
    const totalHours = await recalcTotalHours(userId, rvId);
    await rvCol().doc(rvId).update({ generatorHours: parseFloat(totalHours.toFixed(1)), updatedAt: FieldValue.serverTimestamp() });

    res.status(201).json({ success: true, message: 'Generator log created successfully', data: { ...log, totalHours } });
});

exports.getGeneratorLogs = asyncHandler(async (req, res) => {
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

    const totalHours = await recalcTotalHours(userId, rvId);

    // Hour-based reminders (PRD: oil change, spark plugs, air filter)
    const GENERATOR_INTERVALS = [
        { hours: 100,  task: 'Oil Change' },
        { hours: 300,  task: 'Spark Plug Replacement' },
        { hours: 200,  task: 'Air Filter' },
    ];
    const reminders = GENERATOR_INTERVALS.map(interval => {
        const remainder = totalHours % interval.hours;
        const hoursUntilDue = parseFloat((interval.hours - remainder).toFixed(1));
        return { task: interval.task, interval: interval.hours, hoursUntilDue, isDue: hoursUntilDue <= 10 };
    });

    res.status(200).json({
        success: true,
        message: 'Generator logs retrieved successfully',
        data: result.data,
        meta: result.meta,
        totalHours: parseFloat(totalHours.toFixed(1)),
        reminders
    });
});

exports.getGeneratorLogById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Generator log not found', 404);
    const log = docToObj(snap);
    if (log.user !== userId) throw new ApiError('Generator log not found', 404);
    res.status(200).json({ success: true, message: 'Generator log retrieved successfully', data: log });
});

exports.updateGeneratorLog = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Generator log not found', 404);
    const existing = docToObj(snap);
    if (existing.user !== userId) throw new ApiError('Generator log not found', 404);

    if (req.body.hours !== undefined && Number(req.body.hours) <= 0) {
        throw new ApiError('Hours must be a positive number', 400);
    }

    const updates = { ...req.body, updatedAt: FieldValue.serverTimestamp() };
    if (req.body.hours) updates.hours = Number(req.body.hours);

    await col().doc(req.params.id).update(updates);
    const updated = docToObj(await col().doc(req.params.id).get());

    const totalHours = await recalcTotalHours(userId, existing.rvId);
    await rvCol().doc(existing.rvId).update({ generatorHours: parseFloat(totalHours.toFixed(1)), updatedAt: FieldValue.serverTimestamp() });

    res.status(200).json({ success: true, message: 'Generator log updated successfully', data: { ...updated, totalHours } });
});

exports.deleteGeneratorLog = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Generator log not found', 404);
    const log = docToObj(snap);
    if (log.user !== userId) throw new ApiError('Generator log not found', 404);

    await col().doc(req.params.id).delete();

    const totalHours = await recalcTotalHours(userId, log.rvId);
    await rvCol().doc(log.rvId).update({ generatorHours: parseFloat(totalHours.toFixed(1)), updatedAt: FieldValue.serverTimestamp() });

    res.status(200).json({ success: true, message: 'Generator log deleted successfully', data: {} });
});
