const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const QueryBuilder = require('../../../builder/queryBuilder');

const col = () => db.collection('checklists');

// Simple ID generator for nested items (replaces Mongoose subdoc _id)
const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const normalizeItems = (items = []) =>
    items.map(item => ({ id: item.id || makeId(), name: item.name, status: item.status ?? false }));


exports.createChecklist = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, rvId, items } = req.body;

    const selectedRvId = await getSelectedRvByUserId(userId);
    const targetRvId = rvId || selectedRvId;
    if (!targetRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    const data = {
        title,
        rvId: targetRvId,
        user: userId,
        items: normalizeItems(items),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await col().add(data);
    const snap = await ref.get();

    res.status(201).json({ success: true, message: 'Checklist created successfully', data: docToObj(snap) });
});


exports.getAllChecklists = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    if (!selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    const colRef = col().where('user', '==', userId).where('rvId', '==', selectedRvId);
    const result = await new QueryBuilder(colRef, req.query)
        .search(['title', 'status'])
        .filter()
        .sort()
        .paginate()
        .execute();

    res.status(200).json({
        success: true,
        message: result.data.length ? 'Checklists retrieved successfully' : 'No checklists found',
        meta: result.meta,
        data: result.data
    });
});


exports.getChecklist = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Checklist not found', 404);

    const checklist = docToObj(snap);
    if (checklist.user !== userId) throw new ApiError('Checklist not found', 404);

    res.status(200).json({ success: true, data: checklist });
});


exports.updateChecklist = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, items, itemOperations } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Checklist not found', 404);

    const checklist = docToObj(snap);
    if (checklist.user !== userId) throw new ApiError('Checklist not found', 404);

    const updates = { updatedAt: FieldValue.serverTimestamp() };
    if (title !== undefined) updates.title = title;

    let currentItems = items !== undefined ? normalizeItems(items) : (checklist.items || []);

    if (itemOperations && Array.isArray(itemOperations)) {
        itemOperations.forEach(operation => {
            switch (operation.action) {
                case 'add':
                    if (operation.items && Array.isArray(operation.items)) {
                        currentItems = [...currentItems, ...normalizeItems(operation.items)];
                    }
                    break;
                case 'update':
                    if (operation.itemId && operation.updates) {
                        currentItems = currentItems.map(item =>
                            item.id === operation.itemId
                                ? { ...item, ...operation.updates, id: item.id }
                                : item
                        );
                    }
                    break;
                case 'remove':
                    if (operation.itemId) {
                        currentItems = currentItems.filter(item => item.id !== operation.itemId);
                    }
                    break;
                case 'reorder':
                    if (operation.itemIds && Array.isArray(operation.itemIds)) {
                        const itemMap = new Map(currentItems.map(item => [item.id, item]));
                        currentItems = operation.itemIds.map(id => itemMap.get(id)).filter(Boolean);
                    }
                    break;
            }
        });
    }

    updates.items = currentItems;
    await col().doc(req.params.id).update(updates);

    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, message: 'Checklist updated successfully', data: updated });
});


exports.deleteChecklist = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Checklist not found', 404);

    const checklist = docToObj(snap);
    if (checklist.user !== userId) throw new ApiError('Checklist not found', 404);

    await col().doc(req.params.id).delete();

    res.status(200).json({ success: true, message: 'Checklist deleted successfully', data: {} });
});


exports.bulkUpdateItems = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { items, operations } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Checklist not found', 404);

    const checklist = docToObj(snap);
    if (checklist.user !== userId) throw new ApiError('Checklist not found', 404);

    let currentItems = items !== undefined ? normalizeItems(items) : (checklist.items || []);

    if (operations && Array.isArray(operations)) {
        operations.forEach(operation => {
            switch (operation.action) {
                case 'add':
                    if (operation.item) {
                        currentItems = [...currentItems, normalizeItems([operation.item])[0]];
                    }
                    break;
                case 'update':
                    if (operation.itemId && operation.updates) {
                        currentItems = currentItems.map(item =>
                            item.id === operation.itemId
                                ? { ...item, ...operation.updates, id: item.id }
                                : item
                        );
                    }
                    break;
                case 'remove':
                    if (operation.itemId) {
                        currentItems = currentItems.filter(item => item.id !== operation.itemId);
                    }
                    break;
                case 'reorder':
                    if (operation.itemIds && Array.isArray(operation.itemIds)) {
                        const itemMap = new Map(currentItems.map(item => [item.id, item]));
                        currentItems = operation.itemIds.map(id => itemMap.get(id)).filter(Boolean);
                    }
                    break;
            }
        });
    }

    await col().doc(req.params.id).update({ items: currentItems, updatedAt: FieldValue.serverTimestamp() });

    res.status(200).json({ success: true, message: 'Items updated successfully', data: currentItems });
});


exports.uncheckAllItems = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Checklist not found', 404);

    const checklist = docToObj(snap);
    if (checklist.user !== userId) throw new ApiError('Checklist not found', 404);

    const uncheckedItems = (checklist.items || []).map(item => ({ ...item, status: false }));
    await col().doc(req.params.id).update({ items: uncheckedItems, updatedAt: FieldValue.serverTimestamp() });

    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, message: 'All items unchecked successfully', data: updated });
});
