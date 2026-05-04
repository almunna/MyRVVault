const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const { updateRVMaintenanceStatus: updateRVMaintenanceStatusUtil, calculateMaintenanceStatus } = require('../../../utils/maintenanceUtils');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteStorageFiles = require('../../../utils/deleteS3ObjectsImage');

const col = () => db.collection('maintenanceSchedules');
const rvCol = () => db.collection('rvs');
const userCol = () => db.collection('users');

async function checkRvOwnership(userId, rvId) {
    const userSnap = await userCol().doc(userId).get();
    if (!userSnap.exists) return false;
    const user = userSnap.data();
    return Array.isArray(user.rvIds) && user.rvIds.includes(rvId);
}


exports.createMaintenanceSchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.body?.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to add maintenance for this RV', 403);

    const images = req.files ? req.files.map(f => f.location) : [];

    const data = {
        ...req.body,
        images,
        cost: req.body.cost ? Number(req.body.cost) : null,
        hoursAtMaintenance: req.body.hoursAtMaintenance ? Number(req.body.hoursAtMaintenance) : null,
        user: userId,
        rvId,
        isCompleted: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await col().add(data);
    const snap = await ref.get();
    const maintenanceSchedule = docToObj(snap);

    if (!maintenanceSchedule) throw new ApiError('Failed to create maintenance schedule', 500);

    await updateRVMaintenanceStatusUtil(rvId);

    res.status(201).json({ success: true, message: 'Maintenance schedule created successfully', data: maintenanceSchedule });
});


exports.getMaintenanceSchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to view maintenance for this RV', 403);

    const rvStatus = await updateRVMaintenanceStatusUtil(rvId);

    const rvSnap = await rvCol().doc(rvId).get();
    const currentMileage = rvSnap.exists ? (rvSnap.data().currentMileage || 0) : 0;

    const colRef = col().where('user', '==', userId).where('rvId', '==', rvId);
    const result = await new QueryBuilder(colRef, req.query)
        .search(['component', 'maintenanceToBePerformed', 'notes'])
        .filter()
        .sort()
        .paginate()
        .execute();

    if (!result.data.length) {
        return res.status(200).json({
            success: true,
            message: 'No maintenance schedules found',
            data: [],
            meta: result.meta,
            rvMaintenanceStatus: rvStatus
        });
    }

    const schedulesWithStatus = result.data.map(schedule => {
        const statusInfo = calculateMaintenanceStatus(schedule, currentMileage);
        return { ...schedule, ...statusInfo };
    });

    res.status(200).json({
        success: true,
        message: 'Maintenance schedules retrieved successfully',
        data: schedulesWithStatus,
        meta: result.meta,
        rvMaintenanceStatus: rvStatus
    });
});


exports.getMaintenanceScheduleById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Maintenance schedule not found or access denied', 404);

    const maintenanceSchedule = docToObj(snap);
    if (maintenanceSchedule.user !== userId) throw new ApiError('Maintenance schedule not found or access denied', 404);

    await updateRVMaintenanceStatusUtil(maintenanceSchedule.rvId);

    const rvSnap = await rvCol().doc(maintenanceSchedule.rvId).get();
    const currentMileage = rvSnap.exists ? (rvSnap.data().currentMileage || 0) : 0;

    const statusInfo = calculateMaintenanceStatus(maintenanceSchedule, currentMileage);

    res.status(200).json({
        success: true,
        message: 'Maintenance schedule retrieved successfully',
        data: { ...maintenanceSchedule, ...statusInfo }
    });
});


exports.getMaintenanceByStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { status } = req.params;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to view maintenance for this RV', 403);

    const rvStatus = await updateRVMaintenanceStatusUtil(rvId);

    const rvSnap = await rvCol().doc(rvId).get();
    const currentMileage = rvSnap.exists ? (rvSnap.data().currentMileage || 0) : 0;

    const snap = await col().where('user', '==', userId).where('rvId', '==', rvId).get();
    const maintenanceSchedules = queryToArr(snap);

    if (!maintenanceSchedules.length) {
        return res.status(200).json({ success: true, message: 'No maintenance schedules found', data: [], rvMaintenanceStatus: rvStatus });
    }

    const schedulesWithStatus = maintenanceSchedules.map(schedule => {
        const statusInfo = calculateMaintenanceStatus(schedule, currentMileage);
        return { ...schedule, ...statusInfo };
    });

    let filteredSchedules = schedulesWithStatus;
    if (status !== 'all') {
        filteredSchedules = schedulesWithStatus.filter(item => item.status === status);
    }

    filteredSchedules.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return (a.daysUntilDue || 9999) - (b.daysUntilDue || 9999);
    });

    const summary = {
        total: schedulesWithStatus.length,
        overdue: schedulesWithStatus.filter(item => item.status === 'overdue').length,
        upcoming: schedulesWithStatus.filter(item => item.status === 'upcoming').length,
        scheduled: schedulesWithStatus.filter(item => item.status === 'scheduled').length
    };

    res.status(200).json({
        success: true,
        message: `Maintenance schedules${status !== 'all' ? ` with status '${status}'` : ''} retrieved successfully`,
        data: filteredSchedules,
        summary,
        rvMaintenanceStatus: rvStatus
    });
});


exports.getMaintenanceDashboard = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to view maintenance for this RV', 403);

    const rvStatus = await updateRVMaintenanceStatusUtil(rvId);

    const rvSnap = await rvCol().doc(rvId).get();
    const currentMileage = rvSnap.exists ? (rvSnap.data().currentMileage || 0) : 0;

    const snap = await col().where('user', '==', userId).where('rvId', '==', rvId).get();
    const maintenanceSchedules = queryToArr(snap);

    const emptyDashboard = {
        overdue: [], upcoming: [], scheduled: [], completed: [],
        summary: { total: 0, overdue: 0, upcoming: 0, scheduled: 0, completed: 0 }
    };

    if (!maintenanceSchedules.length) {
        return res.status(200).json({ success: true, message: 'No maintenance schedules found', data: emptyDashboard, rvMaintenanceStatus: rvStatus });
    }

    const overdue = [], upcoming = [], scheduled = [], completed = [];

    maintenanceSchedules.forEach(schedule => {
        const statusInfo = calculateMaintenanceStatus(schedule, currentMileage);
        const s = { ...schedule, ...statusInfo };
        if (statusInfo.status === 'overdue') overdue.push(s);
        else if (statusInfo.status === 'upcoming') upcoming.push(s);
        else if (statusInfo.status === 'scheduled') scheduled.push(s);
        else if (statusInfo.status === 'completed') completed.push(s);
    });

    overdue.sort((a, b) => (a.daysUntilDue || -9999) - (b.daysUntilDue || -9999));
    upcoming.sort((a, b) => (a.daysUntilDue || 9999) - (b.daysUntilDue || 9999));
    scheduled.sort((a, b) => (a.daysUntilDue || 9999) - (b.daysUntilDue || 9999));
    completed.sort((a, b) => {
        const dateA = a.completionDate ? new Date(a.completionDate) : new Date(0);
        const dateB = b.completionDate ? new Date(b.completionDate) : new Date(0);
        return dateB - dateA;
    });

    const summary = { total: maintenanceSchedules.length, overdue: overdue.length, upcoming: upcoming.length, scheduled: scheduled.length, completed: completed.length };

    res.status(200).json({
        success: true,
        message: 'Maintenance dashboard retrieved successfully',
        data: { overdue, upcoming, scheduled, completed, summary },
        rvMaintenanceStatus: rvStatus
    });
});


exports.updateMaintenanceSchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Maintenance schedule not found or access denied', 404);

    const existingSchedule = docToObj(snap);
    if (existingSchedule.user !== userId) throw new ApiError('Maintenance schedule not found or access denied', 404);

    if (req.body.rvId && req.body.rvId !== existingSchedule.rvId) {
        const hasAccess = await checkRvOwnership(userId, req.body.rvId);
        if (!hasAccess) throw new ApiError('You do not have permission to assign maintenance to this RV', 403);
    }

    const updates = { ...req.body, updatedAt: FieldValue.serverTimestamp() };

    if (req.body.cost !== undefined) updates.cost = req.body.cost ? Number(req.body.cost) : null;
    if (req.body.hoursAtMaintenance !== undefined) updates.hoursAtMaintenance = req.body.hoursAtMaintenance ? Number(req.body.hoursAtMaintenance) : null;

    const oldImages = existingSchedule.images || [];
    const newUploads = req.files ? req.files.map(f => f.location) : [];
    const keepImages = req.body.keepImages ? JSON.parse(req.body.keepImages) : null;
    delete updates.keepImages;

    if (keepImages !== null) {
        const toDelete = oldImages.filter(url => !keepImages.includes(url));
        updates.images = [...keepImages, ...newUploads];
        if (toDelete.length > 0) await deleteStorageFiles(toDelete);
    } else if (newUploads.length > 0) {
        updates.images = [...oldImages, ...newUploads];
    }

    await col().doc(req.params.id).update(updates);
    const maintenanceSchedule = docToObj(await col().doc(req.params.id).get());

    if (req.body.rvId && req.body.rvId !== existingSchedule.rvId) {
        await updateRVMaintenanceStatusUtil(existingSchedule.rvId);
        await updateRVMaintenanceStatusUtil(req.body.rvId);
    } else {
        await updateRVMaintenanceStatusUtil(maintenanceSchedule.rvId);
    }

    res.status(200).json({ success: true, message: 'Maintenance schedule updated successfully', data: maintenanceSchedule });
});


exports.deleteMaintenanceSchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Maintenance schedule not found or access denied', 404);

    const maintenanceSchedule = docToObj(snap);
    if (maintenanceSchedule.user !== userId) throw new ApiError('Maintenance schedule not found or access denied', 404);

    await col().doc(req.params.id).delete();
    await updateRVMaintenanceStatusUtil(maintenanceSchedule.rvId);

    res.status(200).json({ success: true, message: 'Maintenance schedule deleted successfully', data: {} });
});


exports.updateRVMaintenanceStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { rvId } = req.params;
    const { maintenanceScheduleId, vendor, cost, date } = req.body;

    if (!maintenanceScheduleId) throw new ApiError('maintenanceScheduleId is required in request body', 400);

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to update status for this RV', 403);

    const snap = await col().doc(maintenanceScheduleId).get();
    if (!snap.exists) throw new ApiError('Maintenance schedule not found or access denied', 404);

    const ms = docToObj(snap);
    if (ms.user !== userId || ms.rvId !== rvId) throw new ApiError('Maintenance schedule not found or access denied', 404);

    const completionDateStr = new Date().toISOString();
    await col().doc(maintenanceScheduleId).update({
        isCompleted: true,
        completionDate: completionDateStr,
        vendor,
        cost,
        date,
        updatedAt: FieldValue.serverTimestamp()
    });

    // Auto-schedule next occurrence if recurrence fields are set
    let nextSchedule = null;
    if (ms.recurringMiles || ms.recurringMonths) {
        const rvSnap = await rvCol().doc(rvId).get();
        const currentMileage = rvSnap.exists ? (rvSnap.data().currentMileage || 0) : 0;
        const completionDate = new Date(completionDateStr);

        const nextData = {
            component: ms.component || null,
            maintenanceToBePerformed: ms.maintenanceToBePerformed || null,
            notes: ms.notes || null,
            recurringMiles: ms.recurringMiles || null,
            recurringMonths: ms.recurringMonths || null,
            images: [],
            isCompleted: false,
            user: userId,
            rvId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        if (ms.componentInstance) nextData.componentInstance = ms.componentInstance;
        if (ms.recurringMiles) nextData.initialMilage = currentMileage + Number(ms.recurringMiles);
        if (ms.recurringMonths) {
            const nextDate = new Date(completionDate);
            nextDate.setMonth(nextDate.getMonth() + Number(ms.recurringMonths));
            nextData.dateOfMaintenance = nextDate.toISOString();
        }

        const nextRef = await col().add(nextData);
        nextSchedule = docToObj(await nextRef.get());
    }

    const rvStatus = await updateRVMaintenanceStatusUtil(rvId);
    const updated = docToObj(await col().doc(maintenanceScheduleId).get());

    res.status(200).json({
        success: true,
        message: nextSchedule
            ? 'Maintenance completed and next service auto-scheduled'
            : 'Maintenance schedule marked as completed and RV status updated successfully',
        data: { maintenanceSchedule: updated, rvStatus, nextSchedule }
    });
});
