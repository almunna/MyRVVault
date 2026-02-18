const WifiRouter = require('./WifiRouter');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const deleteFile = require('../../../utils/unlinkFile');
const uploadPath = path.join(__dirname, '../uploads');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createWifiRouter = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const wifiRouter = await WifiRouter.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!wifiRouter) throw new ApiError('WiFi router not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        wifiRouter.images = imagePaths;
        await wifiRouter.save();
    }

    res.status(201).json({
        success: true,
        message: 'WiFi router created successfully',
        wifiRouter
    });
});

exports.getWifiRouters = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };

    const wifiRoutersQuery = new QueryBuilder(
        WifiRouter.find(baseQuery),
        req.query
    )
    
    const wifiRouters = await wifiRoutersQuery
        .search(['name', 'brand', 'modelNumber'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        WifiRouter.find(baseQuery),
        req.query
    ).countTotal();

    if (!wifiRouters || wifiRouters.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No WiFi routers found',
            meta,
            data: wifiRouters
        });
    }

    return res.status(200).json({
        success: true,
        message: 'WiFi routers retrieved successfully',
        meta,
        data: wifiRouters
    });
});

exports.getWifiRouterById = asyncHandler(async (req, res) => {
    const wifiRouter = await WifiRouter.findById(req.params.id);
    if (!wifiRouter) throw new ApiError('WiFi router not found', 404);
    return res.status(200).json({
        success: true,
        message: 'WiFi router retrieved successfully',
        data: wifiRouter
    });
});

// exports.updateWifiRouter = asyncHandler(async (req, res) => {
//     const wifiRouter = await WifiRouter.findById(req.params.id);
//     if (!wifiRouter) throw new ApiError('WiFi router not found', 404);

//     // Update WiFi router fields from req.body
//     Object.keys(req.body).forEach(key => {
//         wifiRouter[key] = req.body[key];
//     });

//     await wifiRouter.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = wifiRouter.images;

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
//         wifiRouter.images = newImages;
//         await wifiRouter.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'WiFi router updated successfully',
//         wifiRouter
//     });
// });

exports.updateWifiRouter = asyncHandler(async (req, res) => {
    const wifiRouter = await WifiRouter.findById(req.params.id);
    if (!wifiRouter) throw new ApiError('WiFi router not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        wifiRouter[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...wifiRouter.images];
        
        // Update with new images
        wifiRouter.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await wifiRouter.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await wifiRouter.save();
    }

    return res.status(200).json({
        success: true,
        message: 'WiFi router updated successfully',
        wifiRouter
    });
});


exports.deleteWifiRouter = asyncHandler(async (req, res) => {
    const wifiRouter = await deleteDocumentWithFiles(WifiRouter, req.params.id, "uploads");
    if (!wifiRouter) throw new ApiError("WiFi router not found", 404);

    return res.status(200).json({
        success: true,
        message: "WiFi router deleted successfully (with images)",
        wifiRouter,
    });
});