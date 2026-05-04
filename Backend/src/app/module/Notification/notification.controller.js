const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const { createNotification, getUserNotificationPrefs } = require('../../../utils/notificationHelper');
const { calculateMaintenanceStatus } = require('../../../utils/maintenanceUtils');

const col = () => db.collection('notifications');

// GET /api/notifications/get  — paginated list for the current user
exports.getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 20;

    const snap = await col().where('userId', '==', userId).get();
    let docs = queryToArr(snap)
        .sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
        });

    const total   = docs.length;
    const unread  = docs.filter(d => !d.isRead).length;
    const data    = docs.slice((page - 1) * limit, page * limit);

    res.status(200).json({
        success: true,
        data,
        meta: { total, unread, page, limit, totalPage: Math.ceil(total / limit) }
    });
});

// GET /api/notifications/unread-count
exports.getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().where('userId', '==', userId).where('isRead', '==', false).get();
    res.status(200).json({ success: true, count: snap.size });
});

// GET /api/notifications/:id
exports.getNotificationById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Notification not found', 404);
    const notif = docToObj(snap);
    if (notif.userId !== userId) throw new ApiError('Not authorized', 403);
    res.status(200).json({ success: true, data: notif });
});

// PUT /api/notifications/read/:id
exports.markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Notification not found', 404);
    const notif = docToObj(snap);
    if (notif.userId !== userId) throw new ApiError('Not authorized', 403);
    await col().doc(req.params.id).update({ isRead: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
});

// PUT /api/notifications/read-all
exports.markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().where('userId', '==', userId).where('isRead', '==', false).get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));
    await batch.commit();
    res.status(200).json({ success: true, message: `${snap.size} notifications marked as read` });
});

// DELETE /api/notifications/delete/:id
exports.deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Notification not found', 404);
    const notif = docToObj(snap);
    if (notif.userId !== userId) throw new ApiError('Not authorized', 403);
    await col().doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'Notification deleted' });
});

// DELETE /api/notifications/clear-all
exports.clearAll = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().where('userId', '==', userId).get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    res.status(200).json({ success: true, message: 'All notifications cleared' });
});

/**
 * POST /api/notifications/generate
 * Called when the user opens the notification center.
 * Checks due maintenance, active trips, and generator hours — creates new notifications
 * for anything not already notified. Safe to call repeatedly (idempotent via refId).
 */
exports.generateNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    if (!selectedRvId) {
        return res.status(200).json({ success: true, created: 0 });
    }

    const prefs = await getUserNotificationPrefs(userId);
    const rvSnap = await db.collection('rvs').doc(selectedRvId).get();
    if (!rvSnap.exists) return res.status(200).json({ success: true, created: 0 });
    const rv = docToObj(rvSnap);

    const currentMileage = rv.currentMileage || 0;
    const generatorHours = rv.generatorHours || 0;
    const currentDate    = new Date();
    let created = 0;

    // ── Maintenance due (mileage, date, hours) ────────────────────────────────
    if (prefs.maintenance) {
        const mainSnap = await db.collection('maintenanceSchedules')
            .where('user',        '==', userId)
            .where('rvId',        '==', selectedRvId)
            .where('isCompleted', '==', false)
            .get();

        await Promise.all(queryToArr(mainSnap).map(async (schedule) => {
            const statusInfo = calculateMaintenanceStatus(schedule, currentMileage, currentDate);

            if (statusInfo.status === 'overdue') {
                const id = await createNotification(userId, {
                    type:     'maintenance',
                    priority: 'high',
                    title:    `Overdue: ${schedule.component}`,
                    message:  schedule.maintenanceToBePerformed || `${schedule.component} maintenance is overdue`,
                    href:     '/newMaintenance',
                    refId:    `maintenance-${schedule.id}-overdue`,
                });
                if (id) created++;
            } else if (statusInfo.status === 'upcoming') {
                const detail = statusInfo.daysUntilDue != null
                    ? `Due in ${statusInfo.daysUntilDue} day${statusInfo.daysUntilDue !== 1 ? 's' : ''}`
                    : statusInfo.mileageUntilDue != null
                    ? `Due in ${statusInfo.mileageUntilDue.toLocaleString()} miles`
                    : '';
                const id = await createNotification(userId, {
                    type:     'maintenance',
                    priority: 'medium',
                    title:    `Due Soon: ${schedule.component}`,
                    message:  `${schedule.maintenanceToBePerformed || schedule.component} — ${detail}`,
                    href:     '/newMaintenance',
                    refId:    `maintenance-${schedule.id}-upcoming`,
                });
                if (id) created++;
            }

            // Hour-based schedule
            if (schedule.hoursAtMaintenance && generatorHours > 0) {
                const hoursUntil = schedule.hoursAtMaintenance - generatorHours;
                if (hoursUntil <= 0) {
                    const id = await createNotification(userId, {
                        type:     'maintenance',
                        priority: 'high',
                        title:    `Hour-Based Service Overdue: ${schedule.component}`,
                        message:  `${schedule.component} was due at ${schedule.hoursAtMaintenance} hrs — current: ${generatorHours} hrs`,
                        href:     '/generatorLog',
                        refId:    `maintenance-hours-${schedule.id}-overdue`,
                    });
                    if (id) created++;
                } else if (hoursUntil <= 20) {
                    const id = await createNotification(userId, {
                        type:     'maintenance',
                        priority: 'medium',
                        title:    `Hour-Based Service Due: ${schedule.component}`,
                        message:  `${schedule.component} due in ${Math.round(hoursUntil)} hrs`,
                        href:     '/generatorLog',
                        refId:    `maintenance-hours-${schedule.id}-upcoming`,
                    });
                    if (id) created++;
                }
            }
        }));
    }

    // ── Generator service reminders ───────────────────────────────────────────
    if (prefs.generatorService && generatorHours > 0) {
        const INTERVALS = [
            { hours: 100, task: 'Oil Change' },
            { hours: 200, task: 'Air Filter' },
            { hours: 300, task: 'Spark Plug Replacement' },
        ];
        await Promise.all(INTERVALS.map(async (interval) => {
            const remainder     = generatorHours % interval.hours;
            const hoursUntilDue = parseFloat((interval.hours - remainder).toFixed(1));
            if (hoursUntilDue <= 10) {
                const id = await createNotification(userId, {
                    type:     'generator',
                    priority: hoursUntilDue <= 0 ? 'high' : 'medium',
                    title:    `Generator: ${interval.task}`,
                    message:  `${interval.task} due — ${hoursUntilDue <= 0 ? 'overdue' : `${hoursUntilDue} hrs remaining`} (every ${interval.hours} hrs)`,
                    href:     '/generatorLog',
                    refId:    `generator-${interval.task.replace(/\s+/g, '-').toLowerCase()}-${Math.floor(generatorHours / interval.hours)}`,
                });
                if (id) created++;
            }
        }));
    }

    // ── Active trip reminders ─────────────────────────────────────────────────
    if (prefs.tripReminders) {
        const tripSnap = await db.collection('trips')
            .where('user',     '==', userId)
            .where('rvId',     '==', selectedRvId)
            .where('isActive', '==', true)
            .get();

        await Promise.all(queryToArr(tripSnap).map(async (trip) => {
            const startDate  = trip.startDate ? new Date(trip.startDate) : null;
            if (!startDate) return;
            const hoursActive = (currentDate - startDate) / 3600000;

            // "End trip?" reminder after 24 h
            if (hoursActive >= 24) {
                const id = await createNotification(userId, {
                    type:     'trip',
                    priority: 'low',
                    title:    'Trip Still Active',
                    message:  `Your trip "${trip.tripName || 'current trip'}" has been active for ${Math.floor(hoursActive / 24)} day${Math.floor(hoursActive / 24) !== 1 ? 's' : ''}. Don't forget to end it!`,
                    href:     '/campgroundReview',
                    refId:    `trip-end-${trip.id}-${Math.floor(hoursActive / 24)}d`,
                });
                if (id) created++;
            }
        }));
    }

    res.status(200).json({ success: true, created });
});
