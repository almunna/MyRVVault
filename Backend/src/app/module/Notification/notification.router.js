const express = require('express');
const router  = express.Router();
const {
    getNotifications,
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
router.put('/read/:id',         authenticateUser, markAsRead);
router.put('/read-all',         authenticateUser, markAllAsRead);
router.delete('/delete/:id',    authenticateUser, deleteNotification);
router.delete('/clear-all',     authenticateUser, clearAll);
router.post('/generate',        authenticateUser, generateNotifications);

module.exports = router;
