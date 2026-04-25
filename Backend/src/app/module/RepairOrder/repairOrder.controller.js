const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const { createNotification, getUserNotificationPrefs } = require('../../../utils/notificationHelper');
const QueryBuilder = require('../../../builder/queryBuilder');

const col = () => db.collection('repairOrders');
const userCol = () => db.collection('users');

async function checkRvOwnership(userId, rvId) {
    const userSnap = await userCol().doc(userId).get();
    if (!userSnap.exists) return false;
    const user = userSnap.data();
    return Array.isArray(user.rvIds) && user.rvIds.includes(rvId);
}

function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function calcTotal(lineItems) {
    if (!Array.isArray(lineItems)) return 0;
    return parseFloat(lineItems.reduce((s, item) => s + (Number(item.cost || 0) * Number(item.quantity || 1)), 0).toFixed(2));
}

function parseLineItems(raw) {
    if (!raw) return null;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return Array.isArray(raw) ? raw : null;
}

exports.createRepairOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.body?.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('Access denied', 403);

    const lineItems = parseLineItems(req.body.lineItems);
    if (!lineItems || lineItems.length === 0) {
        throw new ApiError('At least one line item is required', 400);
    }

    const processedLineItems = lineItems.map(item => ({
        id: item.id || makeId(),
        component: item.component || '',
        description: item.description || '',
        cost: Number(item.cost || 0),
        quantity: Number(item.quantity || 1)
    }));

    const totalCost = calcTotal(processedLineItems);
    const images = req.files ? req.files.map(f => f.location) : [];
    const initialStatus = req.body.status || 'pending';

    const data = {
        title: req.body.title || '',
        vendor: req.body.vendor || '',
        status: initialStatus,
        statusHistory: [{ status: initialStatus, date: new Date().toISOString(), note: 'Order created' }],
        lineItems: processedLineItems,
        totalCost,
        notes: req.body.notes || '',
        images,
        recallId: req.body.recallId || null,
        rvId,
        user: userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await col().add(data);
    const snap = await ref.get();
    res.status(201).json({ success: true, message: 'Repair order created successfully', data: docToObj(snap) });
});

exports.getRepairOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) throw new ApiError('Access denied', 403);

    const colRef = col().where('user', '==', userId).where('rvId', '==', rvId);
    const result = await new QueryBuilder(colRef, req.query)
        .search(['title', 'vendor', 'notes'])
        .filter()
        .sort()
        .paginate()
        .execute();

    res.status(200).json({ success: true, message: 'Repair orders retrieved successfully', data: result.data, meta: result.meta });
});

exports.getRepairOrderById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Repair order not found', 404);
    const order = docToObj(snap);
    if (order.user !== userId) throw new ApiError('Repair order not found', 404);
    res.status(200).json({ success: true, message: 'Repair order retrieved successfully', data: order });
});

exports.updateRepairOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Repair order not found', 404);
    const existing = docToObj(snap);
    if (existing.user !== userId) throw new ApiError('Repair order not found', 404);

    const updates = { ...req.body, updatedAt: FieldValue.serverTimestamp() };

    // Reprocess line items if provided
    const lineItems = parseLineItems(req.body.lineItems);
    if (lineItems) {
        const processedLineItems = lineItems.map(item => ({
            id: item.id || makeId(),
            component: item.component || '',
            description: item.description || '',
            cost: Number(item.cost || 0),
            quantity: Number(item.quantity || 1)
        }));
        updates.lineItems = processedLineItems;
        updates.totalCost = calcTotal(processedLineItems);
    }

    // Append new images
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => f.location);
        updates.images = [...(existing.images || []), ...newImages];
    }

    // Track status change in history
    if (req.body.status && req.body.status !== existing.status) {
        const statusHistory = existing.statusHistory || [];
        statusHistory.push({ status: req.body.status, date: new Date().toISOString(), note: req.body.statusNote || '' });
        updates.statusHistory = statusHistory;
    }

    delete updates.statusNote;
    await col().doc(req.params.id).update(updates);
    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, message: 'Repair order updated successfully', data: updated });
});

exports.deleteRepairOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Repair order not found', 404);
    const order = docToObj(snap);
    if (order.user !== userId) throw new ApiError('Repair order not found', 404);
    await col().doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'Repair order deleted successfully', data: {} });
});

exports.updateRepairOrderStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!status || !validStatuses.includes(status)) {
        throw new ApiError('Status must be one of: pending, in-progress, completed', 400);
    }

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Repair order not found', 404);
    const order = docToObj(snap);
    if (order.user !== userId) throw new ApiError('Repair order not found', 404);

    const statusHistory = order.statusHistory || [];
    statusHistory.push({ status, date: new Date().toISOString(), note: note || '' });

    await col().doc(req.params.id).update({ status, statusHistory, updatedAt: FieldValue.serverTimestamp() });
    const updated = docToObj(await col().doc(req.params.id).get());

    // Fire notification for status change
    const prefs = await getUserNotificationPrefs(userId);
    if (prefs.repairOrders) {
        const statusLabels = { 'pending': 'Pending', 'in-progress': 'In Progress', 'completed': 'Completed' };
        await createNotification(userId, {
            type:     'repair',
            priority: status === 'completed' ? 'low' : 'medium',
            title:    `Repair Order ${statusLabels[status] || status}`,
            message:  `Repair order status changed to "${statusLabels[status] || status}"${note ? ` — ${note}` : ''}`,
            href:     '/repairOrders',
            refId:    `repair-${req.params.id}-${status}`,
        });
    }

    res.status(200).json({ success: true, message: 'Repair order status updated successfully', data: updated });
});
