const AirCondition = require('../Air-condition/Air-condition');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const User = require('../User/User')
const getSelectedRvByUserId = require('../../../utils/currentRv')
const QueryBuilder = require('../../../builder/queryBuilder')
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createAirCondition = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }

    const airCondition = await AirCondition.create({ ...req.body, user: userId, rvId });
    const images = req.files;
    if (!airCondition) throw new ApiError('AirCondition not created', 500);
    
    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        airCondition.images = imagePaths;
        await airCondition.save();
    }
    res.status(201).json({
        success: true,
        message: 'AirCondition created successfully',
        airCondition
    });
});


exports.getAirConditions = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    // Base query with user and RV filters
    const baseQuery = { user: userId, rvId };
    
    // Merge base query with request query parameters
    const mergedQuery = { ...req.query, ...baseQuery };
    
    // Initialize QueryBuilder with the base model query
    const airConditionQuery = new QueryBuilder(
        AirCondition.find(baseQuery),
        req.query
    );
    
    // Apply query builder methods for filtering, sorting, pagination, and field selection
    const airConditions = await airConditionQuery
        .search(['name', 'brand', 'model', 'description']) // Add searchable fields as needed
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;
    
    // Get pagination metadata
    const meta = await new QueryBuilder(
        AirCondition.find(baseQuery),
        req.query
    ).countTotal();
    
    if (!airConditions || airConditions.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No airConditions found',
            meta,
            data: airConditions
        });
    }
    
    return res.status(200).json({
        success: true,
        message: 'AirConditions retrieved successfully',
        meta,
        data: airConditions
    });
});


exports.getAirConditionById = asyncHandler(async (req, res) => {
    const airCondition = await AirCondition.findById(req.params.id);
    if (!airCondition) throw new ApiError('AirCondition not found', 404);
    return res.status(200).json({
        success: true,
        message: 'AirCondition retrieved successfully',
        data: airCondition
    });
});


// exports.updateAirCondition = asyncHandler(async (req, res) => {
//     const airCondition = await AirCondition.findById(req.params.id);
//     if (!airCondition) throw new ApiError('AirCondition not found', 404);

//     Object.keys(req.body).forEach(key => {
//         airCondition[key] = req.body[key];
//     });

//     await airCondition.save();


//     if (req.files && req.files.length > 0) {
//         const oldImages = airCondition.images;

//         // Delete old images from disk
//         oldImages.forEach(image => {
//             const path = image.split('/').pop();
//             try {
//                 fs.unlinkSync(`${uploadPath}/${path}`);
//             } catch (err) {
//                 if (err.code !== 'ENOENT') {
//                     console.error(err);
//                 }
//             }
//         });

//         // Set only new images
//         const newImages = req.files.map(image => image.location);
//         airCondition.images = newImages;
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'AirCondition updated successfully',
//         airCondition
//     });
// });


exports.updateAirCondition = asyncHandler(async (req, res) => {
    const airCondition = await AirCondition.findById(req.params.id);
    if (!airCondition) throw new ApiError('AirCondition not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        airCondition[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...airCondition.images];
        
        // Update with new images
        airCondition.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await airCondition.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await airCondition.save();
    }

    return res.status(200).json({
        success: true,
        message: 'AirCondition updated successfully',
        airCondition
    });
});



exports.deleteAirCondition = asyncHandler(async (req, res) => {
    const airCondition = await deleteDocumentWithFiles(AirCondition, req.params.id, "uploads");
    if (!airCondition) throw new ApiError("AirCondition not found", 404);

    return res.status(200).json({
        success: true,
        message: "AirCondition deleted successfully",
        airCondition,
    }); 
});
