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
        // Deduplication: skip if same refId was created within the last 24 hours (read or unread)
        if (data.refId) {
            const existing = await db.collection('notifications')
                .where('userId', '==', userId)
                .where('refId',  '==', data.refId)
                .get();
            if (!existing.empty) {
                const cutoff = Date.now() - 24 * 60 * 60 * 1000;
                const recent = existing.docs.some(doc => {
                    const t = doc.data().createdAt;
                    const ms = t?.toMillis ? t.toMillis() : (t ? new Date(t).getTime() : 0);
                    return ms > cutoff;
                });
                if (recent) return null;
            }
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
