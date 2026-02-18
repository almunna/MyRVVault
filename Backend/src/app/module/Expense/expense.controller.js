const Expense = require('./Expense');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const QueryBuilder = require('../../../builder/queryBuilder');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');


exports.createExpense = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }
    
    const expense = await Expense.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!expense) throw new ApiError('Expense not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        expense.images = imagePaths;
        await expense.save();
    }

    res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense
    });
});


exports.getExpenses = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;

    const baseQuery = { user: userId, rvId };

    const expenseQuery = new QueryBuilder(
        Expense.find(baseQuery),
        req.query
    );
    
    const expenses = await expenseQuery
        .search(['expenseType', 'vendor', 'notes']) // Add searchable fields
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        Expense.find(baseQuery),
        req.query
    ).countTotal();

    if (!expenses || expenses.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No expenses found',
            meta,
            data: []
        });
    }

    res.status(200).json({
        success: true,
        message: 'Expenses retrieved successfully',
        meta,
        data: expenses
    });
});


exports.getExpenseById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    
    const expense = await Expense.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!expense) {
        return res.status(200).json({
            success: true,
            message: 'Expense not found or access denied',
            data: expense
        });
    }

    res.status(200).json({
        success: true,
        message: 'Expense retrieved successfully',
        data: expense
    });
});


exports.updateExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);
    if (!expense) throw new ApiError('Expense not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        expense[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...expense.images];
        
        // Update with new images
        expense.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await expense.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await expense.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        expense
    });
});


exports.deleteExpense = asyncHandler(async (req, res) => {
    const expense = await deleteDocumentWithFiles(Expense, req.params.id, "uploads");
    if (!expense) throw new ApiError("Expense not found", 404);

    return res.status(200).json({
        success: true,
        message: "Expense deleted successfully (with images)",
        expense,
    });
});