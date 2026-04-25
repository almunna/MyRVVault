const { db, FieldValue } = require('../config/db');

const DEFAULT_PREFS = {
    maintenance:    true,
    repairOrders:   true,
    mpgAlerts:      true,
    tripReminders:  true,
    warrantyExpiry: true,
    generatorService: true,
};

async function getUserNotificationPrefs(userId) {
    const snap = await db.collection('users').doc(userId).get();
    if (!snap.exists) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(snap.data().notificationPreferences || {}) };
}

/**
 * Creates a notification document.
 * Skips creation if refId already has an unread notification (deduplication).
 *
 * @param {string} userId
 * @param {object} data  { type, title, message, priority, href, refId, metadata }
 */
async function createNotification(userId, data) {
    try {
        // Deduplication: skip if same refId already exists unread
        if (data.refId) {
            const existing = await db.collection('notifications')
                .where('userId',  '==', userId)
                .where('refId',   '==', data.refId)
                .where('isRead',  '==', false)
                .get();
            if (!existing.empty) return null;
        }

        const doc = {
            userId,
            type:      data.type     || 'info',
            title:     data.title    || '',
            message:   data.message  || '',
            priority:  data.priority || 'medium',
            href:      data.href     || null,
            refId:     data.refId    || null,
            metadata:  data.metadata || {},
            isRead:    false,
            createdAt: FieldValue.serverTimestamp(),
        };

        const ref = await db.collection('notifications').add(doc);
        return ref.id;
    } catch (err) {
        console.error('[notificationHelper] createNotification error:', err.message);
        return null;
    }
}

module.exports = { createNotification, getUserNotificationPrefs, DEFAULT_PREFS };
