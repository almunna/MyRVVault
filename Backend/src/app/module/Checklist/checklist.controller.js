const Checklist = require("./Checklist");
const asyncHandler = require("../../../utils/asyncHandler");
const { ApiError } = require("../../../errors/errorHandler");
const getSelectedRvByUserId = require("../../../utils/currentRv");
const QueryBuilder = require("../../../builder/queryBuilder");


exports.createChecklist = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, rvId, items } = req.body;

    const selectedRvId = await getSelectedRvByUserId(userId);
    const targetRvId = rvId || selectedRvId;

    if (!targetRvId) {
        throw new ApiError("No RV selected. Please select an RV first.", 400);
    }

    const checklist = await Checklist.create({
        title,
        rvId: targetRvId,
        user: userId,
        items: items || []
    });

    res.status(201).json({
        success: true,
        message: 'Checklist created successfully',
        data: checklist
    });
});


exports.getAllChecklists = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    if (!selectedRvId) {
        throw new ApiError("No RV selected. Please select an RV first.", 400);
    }

    const baseQuery = {
        user: userId,
        rvId: selectedRvId
    };

    const checklistQuery = new QueryBuilder(
        Checklist.find(baseQuery),
        req.query
    )
        .search(['title', 'status'])  // Add searchable fields
        .filter()
        .sort()
        .paginate()
        .fields();

    const checklists = await checklistQuery.modelQuery;

    const meta = await new QueryBuilder(
        Checklist.find(baseQuery),
        req.query
    ).countTotal();

    if (!checklists || checklists.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No checklists found',
            meta,
            data: checklists
        });
    }

    res.status(200).json({
        success: true,
        message: 'Checklists retrieved successfully',
        meta,
        data: checklists
    });
});


exports.getChecklist = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const checklist = await Checklist.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!checklist) {
        throw new ApiError('Checklist not found', 404);
    }

    res.status(200).json({
        success: true,
        data: checklist
    });
});


exports.updateChecklist = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, items, itemOperations } = req.body;

    const checklist = await Checklist.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!checklist) {
        throw new ApiError('Checklist not found', 404);
    }

    // Update title if provided
    if (title !== undefined) {
        checklist.title = title;
    }

    // Replace entire items array if provided
    if (items !== undefined) {
        checklist.items = items;
    }

    // Handle individual item operations (add, update, remove)
    if (itemOperations && Array.isArray(itemOperations)) {
        itemOperations.forEach(operation => {
            switch (operation.action) {
                case 'add':
                    // if (operation.item) {
                    //     checklist.items.push(operation.item);
                    // }
                    if (operation.items && Array.isArray(operation.items)) {
                        checklist.items.push(...operation.items);
                    }
                    break;
                case 'update':
                    if (operation.itemId && operation.updates) {
                        const itemIndex = checklist.items.findIndex(
                            item => item._id.toString() === operation.itemId
                        );
                        if (itemIndex !== -1) {
                            Object.assign(checklist.items[itemIndex], operation.updates);
                        }
                    }
                    break;
                case 'remove':
                    if (operation.itemId) {
                        checklist.items = checklist.items.filter(
                            item => item._id.toString() !== operation.itemId
                        );
                    }
                    break;
                case 'reorder':
                    if (operation.itemIds && Array.isArray(operation.itemIds)) {
                        // Create a map for quick lookup
                        const itemMap = new Map();
                        checklist.items.forEach(item => {
                            itemMap.set(item._id.toString(), item);
                        });

                        // Reorder items based on the provided array of IDs
                        checklist.items = operation.itemIds.map(id => itemMap.get(id)).filter(Boolean);
                    }
                    break;
            }
        });
    }

    await checklist.save();

    res.status(200).json({
        success: true,
        message: 'Checklist updated successfully',
        data: checklist
    });
});


exports.deleteChecklist = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const checklist = await Checklist.findOneAndDelete({
        _id: req.params.id,
        user: userId
    });

    if (!checklist) {
        throw new ApiError('Checklist not found', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Checklist deleted successfully',
        data: {}
    });
});


exports.bulkUpdateItems = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { items, operations } = req.body;

    const checklist = await Checklist.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!checklist) {
        throw new ApiError('Checklist not found', 404);
    }

    // Replace entire items array if provided
    if (items !== undefined) {
        checklist.items = items;
    }

    // Handle individual operations if provided
    if (operations && Array.isArray(operations)) {
        operations.forEach(operation => {
            switch (operation.action) {
                case 'add':
                    if (operation.item) {
                        checklist.items.push(operation.item);
                    }
                    break;

                case 'update':
                    if (operation.itemId && operation.updates) {
                        const itemIndex = checklist.items.findIndex(
                            item => item._id.toString() === operation.itemId
                        );
                        if (itemIndex !== -1) {
                            Object.assign(checklist.items[itemIndex], operation.updates);
                        }
                    }
                    break;

                case 'remove':
                    if (operation.itemId) {
                        checklist.items = checklist.items.filter(
                            item => item._id.toString() !== operation.itemId
                        );
                    }
                    break;

                case 'reorder':
                    if (operation.itemIds && Array.isArray(operation.itemIds)) {
                        const itemMap = new Map();
                        checklist.items.forEach(item => {
                            itemMap.set(item._id.toString(), item);
                        });

                        checklist.items = operation.itemIds.map(id => itemMap.get(id)).filter(Boolean);
                    }
                    break;
            }
        });
    }

    await checklist.save();

    res.status(200).json({
        success: true,
        message: 'Items updated successfully',
        data: checklist.items
    });
});


exports.uncheckAllItems = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const checklist = await Checklist.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!checklist) {
        throw new ApiError('Checklist not found', 404);
    }

    // Set all item statuses to false (unchecked)
    checklist.items.forEach(item => {
        item.status = false;
    });

    await checklist.save();

    res.status(200).json({
        success: true,
        message: 'All items unchecked successfully',
        data: checklist
    });
});