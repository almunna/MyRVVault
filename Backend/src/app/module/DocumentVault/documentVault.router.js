const express = require('express');
const router = express.Router();
const {
    uploadDocument, getAllDocuments, getDocument,
    updateDocument, deleteDocument, deleteFile
} = require('./documentVault.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const upload = require('../../../utils/uploadConfig');

router.route('/')
    .post(authenticateUser, upload.array('files', 10), uploadDocument)
    .get(authenticateUser, getAllDocuments);

router.route('/:id')
    .get(authenticateUser, getDocument)
    .put(authenticateUser, upload.array('files', 10), updateDocument)
    .delete(authenticateUser, deleteDocument);

router.delete('/:id/file', authenticateUser, deleteFile);

module.exports = router;
