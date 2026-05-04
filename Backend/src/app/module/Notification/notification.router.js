const express = require('express');
const router  = express.Router();
const {
    getNotifications,
    getNotificationById,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    generateNotifications,
} = require('./notification.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.get('/get',              authenticateUser, getNotifications);
router.get('/unread-count',     authenticateUser, getUnreadCount);
router.put('/read-all',         authenticateUser, markAllAsRead);
router.put('/read/:id',         authenticateUser, markAsRead);
router.delete('/clear-all',     authenticateUser, clearAll);
router.delete('/delete/:id',    authenticateUser, deleteNotification);
router.post('/generate',        authenticateUser, generateNotifications);
router.get('/:id',              authenticateUser, getNotificationById); // must be last

module.exports = router;
