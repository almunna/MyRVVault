const InsuranceCompany = require('./InsuranceCompany');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createInsuranceCompany = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;

    if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }

    const insuranceCompany = await InsuranceCompany.create({
        rvId,
        ...req.body,
        user: userId,
    });

    if (!insuranceCompany) throw new ApiError('Insurance company not created', 500);

    if (req.files && req.files.length > 0) {
        const imagePaths = req.files.map(image => image.location);
        insuranceCompany.images = imagePaths;
        await insuranceCompany.save();
    }

    return res.status(201).json({
        success: true,
        message: 'Insurance company created successfully',
        insuranceCompany
    });
});

exports.updateInsuranceCompany = asyncHandler(async (req, res) => {
    const insuranceCompany = await InsuranceCompany.findById(req.params.id);
    if (!insuranceCompany) throw new ApiError('Insurance company not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        insuranceCompany[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...insuranceCompany.images];

        // Update with new images
        insuranceCompany.images = req.files.map(file => file.location);

        // Save the document (only once)
        await insuranceCompany.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await insuranceCompany.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Insurance company updated successfully',
        insuranceCompany
    });
});

exports.getInsuranceCompanies = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;

    if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if (!rvId) rvId = selectedRvId;

    const baseQuery = { user: userId, rvId };

    const insuranceQuery = new QueryBuilder(
        InsuranceCompany.find(baseQuery),
        { ...req.query, sort: req.query.sort || 'insuranceCompany' }
    )
        .search(['name', 'policyNumber', 'insuranceCompany'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const insuranceCompanies = await insuranceQuery.modelQuery;

    const meta = await new QueryBuilder(
        InsuranceCompany.find(baseQuery),
        req.query
    ).countTotal();

    if (!insuranceCompanies || insuranceCompanies.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No insurance companies found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Insurance companies retrieved successfully',
        meta,
        data: insuranceCompanies
    });
});

exports.getInsuranceCompanyById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const insuranceCompany = await InsuranceCompany.findOne({ _id: req.params.id, user: userId });

    if (!insuranceCompany) return res.status(200).json({
        success: true,
        message: 'Insurance company not found',
        data: insuranceCompany
    });

    return res.status(200).json({
        success: true,
        message: 'Insurance company retrieved successfully',
        data: insuranceCompany
    });
});

exports.deleteInsuranceCompany = asyncHandler(async (req, res) => {
    const insuranceCompany = await deleteDocumentWithFiles(InsuranceCompany, req.params.id, "uploads");
    if (!insuranceCompany) throw new ApiError("Insurance company not found", 404);

    return res.status(200).json({
        success: true,
        message: "Insurance company deleted successfully",
        insuranceCompany,
    });
});