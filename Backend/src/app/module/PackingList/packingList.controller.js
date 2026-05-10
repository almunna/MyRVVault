const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const QueryBuilder = require('../../../builder/queryBuilder');

const col = () => db.collection('packingLists');

const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const normalizeItems = (items = []) =>
    items.map(item => ({
        id: item.id || makeId(),
        name: item.name,
        quantity: item.quantity || 1,
        checked: item.checked ?? false,
        category: item.category || 'general'
    }));

const PRE_DEPARTURE_TEMPLATE = [
    { name: 'Check tire pressure', category: 'safety' },
    { name: 'Test brake lights & turn signals', category: 'safety' },
    { name: 'Check engine oil level', category: 'mechanical' },
    { name: 'Check coolant level', category: 'mechanical' },
    { name: 'Check brake fluid', category: 'mechanical' },
    { name: 'Inspect slide-outs (retracted)', category: 'rv' },
    { name: 'Disconnect shore power', category: 'rv' },
    { name: 'Disconnect water & sewer hoses', category: 'rv' },
    { name: 'Secure all cabinets & drawers', category: 'rv' },
    { name: 'Lock all windows', category: 'rv' },
    { name: 'Retract awning', category: 'rv' },
    { name: 'Stow outdoor furniture', category: 'rv' },
    { name: 'Turn off propane', category: 'safety' },
    { name: 'Level blocks & jacks stored', category: 'rv' },
    { name: 'Hitch & safety chains checked', category: 'safety' },
    { name: 'Verify weight distribution', category: 'safety' },
    { name: 'Pack emergency kit', category: 'emergency' },
    { name: 'First aid kit', category: 'emergency' },
    { name: 'Route & destination confirmed', category: 'planning' },
    { name: 'Campground reservation confirmed', category: 'planning' }
];

const SETUP_TEMPLATE = [
    { name: 'Level the RV (front-to-back, side-to-side)', category: 'setup' },
    { name: 'Deploy stabilizer jacks', category: 'setup' },
    { name: 'Connect shore power', category: 'utilities' },
    { name: 'Connect fresh water hose', category: 'utilities' },
    { name: 'Connect sewer hose', category: 'utilities' },
    { name: 'Turn on propane', category: 'utilities' },
    { name: 'Extend slide-outs', category: 'setup' },
    { name: 'Set up awning', category: 'comfort' },
    { name: 'Set out outdoor furniture', category: 'comfort' },
    { name: 'Test smoke & CO detectors', category: 'safety' },
    { name: 'Check water heater bypass', category: 'utilities' },
    { name: 'Turn on refrigerator', category: 'appliances' },
    { name: 'Set thermostat', category: 'appliances' },
    { name: 'Set up outdoor rug / mat', category: 'comfort' },
    { name: 'Locate campground amenities', category: 'planning' }
];


exports.createPackingList = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, rvId, items, templateType } = req.body;

    const selectedRvId = await getSelectedRvByUserId(userId);
    const targetRvId = rvId || selectedRvId;
    if (!targetRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    if (!title) throw new ApiError('Title is required', 400);

    let initialItems = items ? normalizeItems(items) : [];
    if (templateType === 'pre_departure') initialItems = normalizeItems(PRE_DEPARTURE_TEMPLATE);
    else if (templateType === 'setup') initialItems = normalizeItems(SETUP_TEMPLATE);

    const data = {
        title,
        rvId: targetRvId,
        user: userId,
        items: initialItems,
        templateType: templateType || 'custom',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await col().add(data);
    const snap = await ref.get();

    res.status(201).json({ success: true, message: 'Packing list created successfully', data: docToObj(snap) });
});


exports.getAllPackingLists = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    if (!selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);

    const colRef = col().where('user', '==', userId).where('rvId', '==', selectedRvId);
    const result = await new QueryBuilder(colRef, req.query)
        .search(['title'])
        .sort()
        .paginate()
        .execute();

    res.status(200).json({
        success: true,
        message: result.data.length ? 'Packing lists retrieved' : 'No packing lists found',
        meta: result.meta,
        data: result.data
    });
});


exports.getPackingList = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Packing list not found', 404);

    const list = docToObj(snap);
    if (list.user !== userId) throw new ApiError('Packing list not found', 404);

    res.status(200).json({ success: true, data: list });
});


exports.updatePackingList = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, items, itemOperations } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Packing list not found', 404);

    const list = docToObj(snap);
    if (list.user !== userId) throw new ApiError('Packing list not found', 404);

    const updates = { updatedAt: FieldValue.serverTimestamp() };
    if (title !== undefined) updates.title = title;

    let currentItems = items !== undefined ? normalizeItems(items) : (list.items || []);

    if (itemOperations && Array.isArray(itemOperations)) {
        itemOperations.forEach(op => {
            switch (op.action) {
                case 'add':
                    currentItems = [...currentItems, ...normalizeItems(op.items || [op.item].filter(Boolean))];
                    break;
                case 'update':
                    if (op.itemId && op.updates) {
                        currentItems = currentItems.map(item =>
                            item.id === op.itemId ? { ...item, ...op.updates, id: item.id } : item
                        );
                    }
                    break;
                case 'remove':
                    if (op.itemId) currentItems = currentItems.filter(item => item.id !== op.itemId);
                    break;
                case 'reorder':
                    if (op.itemIds) {
                        const map = new Map(currentItems.map(i => [i.id, i]));
                        currentItems = op.itemIds.map(id => map.get(id)).filter(Boolean);
                    }
                    break;
            }
        });
    }

    updates.items = currentItems;
    await col().doc(req.params.id).update(updates);
    const updated = docToObj(await col().doc(req.params.id).get());

    res.status(200).json({ success: true, message: 'Packing list updated', data: updated });
});


exports.deletePackingList = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Packing list not found', 404);

    const list = docToObj(snap);
    if (list.user !== userId) throw new ApiError('Packing list not found', 404);

    await col().doc(req.params.id).delete();

    res.status(200).json({ success: true, message: 'Packing list deleted', data: {} });
});


exports.uncheckAll = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Packing list not found', 404);

    const list = docToObj(snap);
    if (list.user !== userId) throw new ApiError('Packing list not found', 404);

    const reset = (list.items || []).map(item => ({ ...item, checked: false }));
    await col().doc(req.params.id).update({ items: reset, updatedAt: FieldValue.serverTimestamp() });

    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, message: 'All items unchecked', data: updated });
});


exports.duplicatePackingList = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Packing list not found', 404);

    const list = docToObj(snap);
    if (list.user !== userId) throw new ApiError('Packing list not found', 404);

    const newData = {
        title: `${list.title} (Copy)`,
        rvId: list.rvId,
        user: userId,
        items: (list.items || []).map(item => ({ ...item, id: makeId(), checked: false })),
        templateType: list.templateType,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await col().add(newData);
    const newSnap = await ref.get();

    res.status(201).json({ success: true, message: 'Packing list duplicated', data: docToObj(newSnap) });
});
