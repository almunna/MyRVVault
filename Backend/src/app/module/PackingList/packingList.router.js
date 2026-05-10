const express = require('express');
const router = express.Router();
const {
    createPackingList, getAllPackingLists, getPackingList,
    updatePackingList, deletePackingList, uncheckAll, duplicatePackingList
} = require('./packingList.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.route('/')
    .post(authenticateUser, createPackingList)
    .get(authenticateUser, getAllPackingLists);

router.route('/:id')
    .get(authenticateUser, getPackingList)
    .patch(authenticateUser, updatePackingList)
    .delete(authenticateUser, deletePackingList);

router.post('/:id/uncheck-all', authenticateUser, uncheckAll);
router.post('/:id/duplicate', authenticateUser, duplicatePackingList);

module.exports = router;
