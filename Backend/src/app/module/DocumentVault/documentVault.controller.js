const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const QueryBuilder = require('../../../builder/queryBuilder');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const { bucket } = require('../../../config/db');

const col = () => db.collection('documents');

const CATEGORIES = ['warranty', 'insurance', 'registration', 'receipt', 'manual', 'photo', 'other'];
const LINK_TYPES = ['component', 'repair_order', 'rv', 'maintenance', 'general'];


exports.uploadDocument = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, category, notes, linkedToType, linkedToId, rvId } = req.body;

    const selectedRvId = await getSelectedRvByUserId(userId);
    const targetRvId = rvId || selectedRvId;
    if (!targetRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    if (category && !CATEGORIES.includes(category)) {
        throw new ApiError(`Category must be one of: ${CATEGORIES.join(', ')}`, 400);
    }

    if (linkedToType && !LINK_TYPES.includes(linkedToType)) {
        throw new ApiError(`linkedToType must be one of: ${LINK_TYPES.join(', ')}`, 400);
    }

    const files = req.files || [];
    const fileData = files.map(f => ({
        url: f.location,
        filename: f.filename,
        mimetype: f.mimetype,
        size: f.size || null,
        fileType: f.mimetype.startsWith('image/') ? 'image' : f.mimetype === 'application/pdf' ? 'pdf' : 'other'
    }));

    if (fileData.length === 0) throw new ApiError('At least one file is required', 400);

    const data = {
        title: title || files[0]?.originalname || 'Document',
        category: category || 'other',
        notes: notes || null,
        files: fileData,
        linkedToType: linkedToType || 'general',
        linkedToId: linkedToId || null,
        rvId: targetRvId,
        user: userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await col().add(data);
    const snap = await ref.get();

    res.status(201).json({ success: true, message: 'Document uploaded successfully', data: docToObj(snap) });
});


exports.getAllDocuments = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let { rvId, category, linkedToType, linkedToId } = req.query;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected.', 400);
    if (!rvId) rvId = selectedRvId;

    let colRef = col().where('user', '==', userId).where('rvId', '==', rvId);
    if (category) colRef = colRef.where('category', '==', category);
    if (linkedToType) colRef = colRef.where('linkedToType', '==', linkedToType);
    if (linkedToId) colRef = colRef.where('linkedToId', '==', linkedToId);

    const result = await new QueryBuilder(colRef, req.query)
        .search(['title', 'notes'])
        .sort()
        .paginate()
        .execute();

    res.status(200).json({
        success: true,
        message: result.data.length ? 'Documents retrieved successfully' : 'No documents found',
        meta: result.meta,
        data: result.data
    });
});


exports.getDocument = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Document not found', 404);

    const doc = docToObj(snap);
    if (doc.user !== userId) throw new ApiError('Document not found', 404);

    res.status(200).json({ success: true, data: doc });
});


exports.updateDocument = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, category, notes, linkedToType, linkedToId } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Document not found', 404);

    const doc = docToObj(snap);
    if (doc.user !== userId) throw new ApiError('Document not found', 404);

    const updates = { updatedAt: FieldValue.serverTimestamp() };
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (notes !== undefined) updates.notes = notes;
    if (linkedToType !== undefined) updates.linkedToType = linkedToType;
    if (linkedToId !== undefined) updates.linkedToId = linkedToId;

    // Handle new file uploads (append to existing)
    if (req.files && req.files.length > 0) {
        const newFiles = req.files.map(f => ({
            url: f.location,
            filename: f.filename,
            mimetype: f.mimetype,
            size: f.size || null,
            fileType: f.mimetype.startsWith('image/') ? 'image' : f.mimetype === 'application/pdf' ? 'pdf' : 'other'
        }));
        updates.files = [...(doc.files || []), ...newFiles];
    }

    await col().doc(req.params.id).update(updates);
    const updated = docToObj(await col().doc(req.params.id).get());

    res.status(200).json({ success: true, message: 'Document updated successfully', data: updated });
});


exports.deleteDocument = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Document not found', 404);

    const doc = docToObj(snap);
    if (doc.user !== userId) throw new ApiError('Document not found', 404);

    // Delete files from Firebase Storage
    const deletePromises = (doc.files || []).map(f => {
        if (f.filename) {
            return bucket.file(f.filename).delete().catch(() => {});
        }
        return Promise.resolve();
    });
    await Promise.all(deletePromises);

    await col().doc(req.params.id).delete();

    res.status(200).json({ success: true, message: 'Document deleted successfully', data: {} });
});


// Remove a single file from a document
exports.deleteFile = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { filename } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Document not found', 404);

    const doc = docToObj(snap);
    if (doc.user !== userId) throw new ApiError('Document not found', 404);

    const fileToRemove = (doc.files || []).find(f => f.filename === filename);
    if (fileToRemove) {
        await bucket.file(filename).delete().catch(() => {});
    }

    const updatedFiles = (doc.files || []).filter(f => f.filename !== filename);
    await col().doc(req.params.id).update({ files: updatedFiles, updatedAt: FieldValue.serverTimestamp() });

    res.status(200).json({ success: true, message: 'File removed successfully', data: { files: updatedFiles } });
});
