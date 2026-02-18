const Report = require('./Reports');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createReport = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;

    if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add reports for this RV', 403);
    }

    const report = await Report.create({
        rvId,
        ...req.body,
        user: userId,
        status: 'pending' // Default status
    });

    res.status(201).json({
        success: true,
        message: 'Report created successfully',
        data: report
    });
});

exports.getReports = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let { rvId, from, to, searchTerm, sort, page = 1, limit = 10, component, expenseType } = req.query;

    if (!rvId && !selectedRvId) {
        throw new ApiError("No selected RV found", 404);
    }
    if (!rvId) rvId = selectedRvId;

    // Base filter
    const filter = { user: userId, rvId };

    // Component filter (only add if provided)
    if (component) {
        filter.component = component;
    }

    // Expense type filter (only add if provided)
    if (expenseType) {
        filter.expenseType = expenseType;
    }

    // Date range filter
    if (from && to) {
        filter.dateOfService = { $gte: new Date(from), $lte: new Date(to) };
    }

    // Search
    if (searchTerm) {
        filter.reportTitle = { $regex: searchTerm, $options: "i" };
    }

    // Pagination
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Sorting
    const sortOption = sort ? sort.split(",").join(" ") : "-createdAt";

    // Calculate cumulative cost using aggregation
    const costAggregation = await Report.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalCost: { $sum: "$cost" }
            }
        }
    ]);

    const cumulativeCost = costAggregation.length > 0 ? costAggregation[0].totalCost : 0;

    // Query
    const [reports, total] = await Promise.all([
        Report.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .select("-__v"),
        Report.countDocuments(filter),
    ]);

    if (!reports.length) {
        return res.status(200).json({
            success: true,
            message: "No reports found",
            meta: { page, limit, total: 0, totalPage: 0, cumulativeCost: 0 },
            data: [],
        });
    }

    res.status(200).json({
        success: true,
        message: "Reports retrieved successfully",
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
            cumulativeCost,
        },
        data: reports,
    });
});

exports.getReportById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const report = await Report.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!report) {
        throw new ApiError('Report not found or access denied', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Report retrieved successfully',
        data: report
    });
});

exports.updateReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) throw new ApiError('Report not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        report[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...report.images];

        // Update with new images
        report.images = req.files.map(file => file.location);

        // Save the document (only once)
        await report.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await report.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        report
    });
});

exports.deleteReport = asyncHandler(async (req, res) => {
    const report = await deleteDocumentWithFiles(Report, req.params.id, "uploads");
    if (!report) throw new ApiError("Report not found", 404);

    return res.status(200).json({
        success: true,
        message: "Report deleted successfully",
        data: report
    });
});

// Favorite functionality
exports.toggleFavoriteReport = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    // First, find the current report to get its current isFavorite status
    const currentReport = await Report.findOne({ _id: req.params.id, user: userId });
    if (!currentReport) throw new ApiError('Report not found', 404);

    // Then update with the toggled value
    const report = await Report.findOneAndUpdate(
        { _id: req.params.id, user: userId },
        { $set: { isFavorite: !currentReport.isFavorite } },
        { new: true }
    );

    res.status(200).json({
        success: true,
        message: report.isFavorite ? 'Report added to favorites' : 'Report removed from favorites',
        data: report
    });
});

exports.getFavoriteReports = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const reportsQuery = Report.find({
        isFavorite: true,
        user: userId
    });

    const reports = await new QueryBuilder(
        reportsQuery,
        req.query
    )
        .paginate()
        .modelQuery;

    const meta = await new QueryBuilder(
        reportsQuery,
        req.query
    ).countTotal();

    res.status(200).json({
        success: true,
        message: 'Favorite reports retrieved successfully',
        meta,
        data: reports
    });
});
