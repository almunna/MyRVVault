const express = require('express');
const router = express.Router();
const {
    createChecklist,
    getAllChecklists,
    getChecklist,
    updateChecklist,
    deleteChecklist,
    bulkUpdateItems,
    uncheckAllItems
} = require('./checklist.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');

// Checklist routes
router.route('/')
    .post(authenticateUser, createChecklist)
    .get(authenticateUser, getAllChecklists);

router.route('/:id')
    .get(authenticateUser, getChecklist)
    .patch(authenticateUser, updateChecklist)  // Changed to PATCH
    .post(authenticateUser, deleteChecklist);

// Bulk items operations
router.route('/:id/items')
    .patch(authenticateUser, bulkUpdateItems);  // PATCH for items operations

// Uncheck all items in a checklist
router.route('/:id/uncheck-all')
    .post(authenticateUser, uncheckAllItems);

module.exports = router;