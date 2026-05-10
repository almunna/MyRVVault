const express = require('express');
const router = express.Router();
const {
    createChecklist, getAllChecklists, getChecklist, updateChecklist,
    deleteChecklist, bulkUpdateItems, uncheckAllItems,
    duplicateChecklist, createFromTemplate
} = require('./checklist.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.route('/')
    .post(authenticateUser, createChecklist)
    .get(authenticateUser, getAllChecklists);

router.post('/from-template', authenticateUser, createFromTemplate);

router.route('/:id')
    .get(authenticateUser, getChecklist)
    .patch(authenticateUser, updateChecklist)
    .post(authenticateUser, deleteChecklist);

router.patch('/:id/items', authenticateUser, bulkUpdateItems);
router.post('/:id/uncheck-all', authenticateUser, uncheckAllItems);
router.post('/:id/duplicate', authenticateUser, duplicateChecklist);

module.exports = router;
