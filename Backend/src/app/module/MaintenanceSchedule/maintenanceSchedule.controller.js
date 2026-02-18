const MaintenanceSchedule = require('./MaintenanceSchedule');
const asyncHandler = require('../../../utils/asyncHandler');
const {ApiError } = require('../../../errors/errorHandler');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const { updateRVMaintenanceStatus: updateRVMaintenanceStatusUtil, calculateMaintenanceStatus } = require('../../../utils/maintenanceUtils');
const RV = require('../RV/RV');
const User = require('../User/User');
const QueryBuilder = require('../../../builder/queryBuilder');

exports.createMaintenanceSchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    
    let rvId = req.body?.rvId;
    if (!rvId && !selectedRvId) {
        throw new ApiError('No RV selected. Please select an RV first.', 400);
    }
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }

    const maintenanceSchedule = await MaintenanceSchedule.create({
        ...req.body,
        user: userId,
        rvId
    });

    if (!maintenanceSchedule) {
        throw new ApiError('Failed to create maintenance schedule', 500);
    }

    // Update RV maintenance status after creating schedule
    await updateRVMaintenanceStatusUtil(rvId);

    res.status(201).json({
        success: true,
        message: 'Maintenance schedule created successfully',
        data: maintenanceSchedule
    });
});


exports.getMaintenanceSchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    
    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) {
        throw new ApiError('No RV selected. Please select an RV first.', 400);
    }
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to view maintenance for this RV', 403);
    }
    
    // Update RV maintenance status when accessing maintenance schedules
    const rvStatus = await updateRVMaintenanceStatusUtil(rvId);
    
    const rv = await RV.findById(rvId).select('currentMileage');
    const currentMileage = rv?.currentMileage || 0;
    
    req.query.rvId = rvId;
    
    const baseQuery = { user: userId, rvId };
    
    const maintenanceQuery = new QueryBuilder(
        MaintenanceSchedule.find(baseQuery),
        req.query
    );
    
    const maintenanceSchedules = await maintenanceQuery
        .search(['component', 'maintenanceToBePerformed', 'notes'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;
    
    const total = await new QueryBuilder(
        MaintenanceSchedule.find(baseQuery),
        req.query
    ).countTotal();
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const totalPages = Math.ceil(total / limit);

    const meta = {
        page,
        limit,
        total,
        totalPages
    };

    if (!maintenanceSchedules || maintenanceSchedules.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No maintenance schedules found',
            data: [],
            meta,
            rvMaintenanceStatus: rvStatus // Include RV status
        });
    }

    const schedulesWithStatus = maintenanceSchedules.map(schedule => {
        const statusInfo = calculateMaintenanceStatus(schedule, currentMileage);
        return {
            ...schedule.toObject(),
            status: statusInfo.status,
            isOverdue: statusInfo.isOverdue,
            nextMaintenanceDate: statusInfo.nextMaintenanceDate,
            nextMaintenanceMileage: statusInfo.nextMaintenanceMileage,
            daysUntilDue: statusInfo.daysUntilDue,
            mileageUntilDue: statusInfo.mileageUntilDue
        };
    });

    res.status(200).json({
        success: true,
        message: 'Maintenance schedules retrieved successfully',
        data: schedulesWithStatus,
        meta,
        rvMaintenanceStatus: rvStatus // Include RV status
    });
});

// @desc    Get single maintenance schedule by ID
// @route   GET /api/v1/maintenance-schedule/:id
// @access  Private
exports.getMaintenanceScheduleById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    
    const maintenanceSchedule = await MaintenanceSchedule.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!maintenanceSchedule) {
        throw new ApiError('Maintenance schedule not found or access denied', 404);
    }

    // Update RV maintenance status for this schedule's RV
    await updateRVMaintenanceStatusUtil(maintenanceSchedule.rvId);

    // Get current mileage from RV for status calculation
    const rv = await RV.findById(maintenanceSchedule.rvId).select('currentMileage');
    const currentMileage = rv?.currentMileage || 0;

    // Calculate status
    const statusInfo = calculateMaintenanceStatus(maintenanceSchedule, currentMileage);
    const scheduleWithStatus = {
        ...maintenanceSchedule.toObject(),
        status: statusInfo.status,
        isOverdue: statusInfo.isOverdue,
        nextMaintenanceDate: statusInfo.nextMaintenanceDate,
        nextMaintenanceMileage: statusInfo.nextMaintenanceMileage,
        daysUntilDue: statusInfo.daysUntilDue,
        mileageUntilDue: statusInfo.mileageUntilDue
    };

    res.status(200).json({
        success: true,
        message: 'Maintenance schedule retrieved successfully',
        data: scheduleWithStatus
    });
});

exports.getMaintenanceByStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { status } = req.params;
    const selectedRvId = await getSelectedRvByUserId(userId);
    
    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) {
        throw new ApiError('No RV selected. Please select an RV first.', 400);
    }
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to view maintenance for this RV', 403);
    }

    // Update RV maintenance status
    const rvStatus = await updateRVMaintenanceStatusUtil(rvId);

    const rv = await RV.findById(rvId).select('currentMileage');
    const currentMileage = rv?.currentMileage || 0;

    const maintenanceSchedules = await MaintenanceSchedule.find({
        user: userId,
        rvId
    });

    if (!maintenanceSchedules || maintenanceSchedules.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No maintenance schedules found',
            data: [],
            rvMaintenanceStatus: rvStatus
        });
    }

    const schedulesWithStatus = maintenanceSchedules.map(schedule => {
        const statusInfo = calculateMaintenanceStatus(schedule, currentMileage);
        return {
            ...schedule.toObject(),
            status: statusInfo.status,
            isOverdue: statusInfo.isOverdue,
            nextMaintenanceDate: statusInfo.nextMaintenanceDate,
            nextMaintenanceMileage: statusInfo.nextMaintenanceMileage,
            daysUntilDue: statusInfo.daysUntilDue,
            mileageUntilDue: statusInfo.mileageUntilDue
        };
    });

    let filteredSchedules = schedulesWithStatus;
    if (status !== 'all') {
        filteredSchedules = schedulesWithStatus.filter(item => item.status === status);
    }

    filteredSchedules.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return (a.daysUntilDue || 9999) - (b.daysUntilDue || 9999);
    });

    const summary = {
        total: schedulesWithStatus.length,
        overdue: schedulesWithStatus.filter(item => item.status === 'overdue').length,
        upcoming: schedulesWithStatus.filter(item => item.status === 'upcoming').length,
        scheduled: schedulesWithStatus.filter(item => item.status === 'scheduled').length
    };

    res.status(200).json({
        success: true,
        message: `Maintenance schedules ${status !== 'all' ? `with status '${status}'` : ''} retrieved successfully`,
        data: filteredSchedules,
        summary,
        rvMaintenanceStatus: rvStatus // Include RV status
    });
});


exports.getMaintenanceDashboard = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    
    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) {
        throw new ApiError('No RV selected. Please select an RV first.', 400);
    }
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to view maintenance for this RV', 403);
    }

    // Update RV maintenance status when dashboard is accessed
    const rvStatus = await updateRVMaintenanceStatusUtil(rvId);

    const rv = await RV.findById(rvId).select('currentMileage');
    const currentMileage = rv?.currentMileage || 0;

    const maintenanceSchedules = await MaintenanceSchedule.find({
        user: userId,
        rvId
    });

    if (!maintenanceSchedules || maintenanceSchedules.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No maintenance schedules found',
            data: {
                overdue: [],
                upcoming: [],
                scheduled: [],
                completed: [],
                summary: {
                    total: 0,
                    overdue: 0,
                    upcoming: 0,
                    scheduled: 0,
                    completed: 0
                }
            },
            rvMaintenanceStatus: rvStatus // Include RV status
        });
    }

    const overdue = [];
    const upcoming = [];
    const scheduled = [];
    const completed = [];

    maintenanceSchedules.forEach(schedule => {
        const statusInfo = calculateMaintenanceStatus(schedule, currentMileage);
        const scheduleWithStatus = {
            ...schedule.toObject(),
            status: statusInfo.status,
            isOverdue: statusInfo.isOverdue,
            nextMaintenanceDate: statusInfo.nextMaintenanceDate,
            nextMaintenanceMileage: statusInfo.nextMaintenanceMileage,
            daysUntilDue: statusInfo.daysUntilDue,
            mileageUntilDue: statusInfo.mileageUntilDue
        };

        switch (statusInfo.status) {
            case 'overdue':
                overdue.push(scheduleWithStatus);
                break;
            case 'upcoming':
                upcoming.push(scheduleWithStatus);
                break;
            case 'scheduled':
                scheduled.push(scheduleWithStatus);
                break;
            case 'completed':
                completed.push(scheduleWithStatus);
                break;
        }
    });

    overdue.sort((a, b) => (a.daysUntilDue || -9999) - (b.daysUntilDue || -9999));
    upcoming.sort((a, b) => (a.daysUntilDue || 9999) - (b.daysUntilDue || 9999));
    scheduled.sort((a, b) => (a.daysUntilDue || 9999) - (b.daysUntilDue || 9999));
    // Sort completed by completion date, most recent first
    completed.sort((a, b) => {
        const dateA = a.completionDate ? new Date(a.completionDate) : new Date(0);
        const dateB = b.completionDate ? new Date(b.completionDate) : new Date(0);
        return dateB - dateA; // Descending order (newest first)
    });

    const summary = {
        total: maintenanceSchedules.length,
        overdue: overdue.length,
        upcoming: upcoming.length,
        scheduled: scheduled.length,
        completed: completed.length
    };

    res.status(200).json({
        success: true,
        message: 'Maintenance dashboard retrieved successfully',
        data: {
            overdue,
            upcoming,
            scheduled,
            completed,
            summary
        },
        rvMaintenanceStatus: rvStatus // Include RV status
    });
});

exports.updateMaintenanceSchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    
    const existingSchedule = await MaintenanceSchedule.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!existingSchedule) {
        throw new ApiError('Maintenance schedule not found or access denied', 404);
    }

    if (req.body.rvId && req.body.rvId !== existingSchedule.rvId.toString()) {
        const hasAccess = await checkRvOwnership(userId, req.body.rvId);
        if (!hasAccess) {
            throw new ApiError('You do not have permission to assign maintenance to this RV', 403);
        }
    }

    const maintenanceSchedule = await MaintenanceSchedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    // Update RV maintenance status after updating schedule
    // Update both old and new RV if rvId changed
    if (req.body.rvId && req.body.rvId !== existingSchedule.rvId.toString()) {
        await updateRVMaintenanceStatusUtil(existingSchedule.rvId); // Update old RV
        await updateRVMaintenanceStatusUtil(req.body.rvId); // Update new RV
    } else {
        await updateRVMaintenanceStatusUtil(maintenanceSchedule.rvId);
    }

    res.status(200).json({
        success: true,
        message: 'Maintenance schedule updated successfully',
        data: maintenanceSchedule
    });
});


exports.deleteMaintenanceSchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    
    const maintenanceSchedule = await MaintenanceSchedule.findOneAndDelete({
        _id: req.params.id,
        user: userId
    });

    if (!maintenanceSchedule) {
        throw new ApiError('Maintenance schedule not found or access denied', 404);
    }

    // Update RV maintenance status after deleting schedule
    await updateRVMaintenanceStatusUtil(maintenanceSchedule.rvId);

    res.status(200).json({
        success: true,
        message: 'Maintenance schedule deleted successfully',
        data: {}
    });
});

// @desc    Mark a specific maintenance schedule as completed
// @route   PUT /api/maintenance-schedule/update-rv-status/:rvId
// @access  Private
exports.updateRVMaintenanceStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { rvId } = req.params;
    const { maintenanceScheduleId, vendor, cost, date } = req.body;

    if (!maintenanceScheduleId) {
        throw new ApiError('maintenanceScheduleId is required in request body', 400);
    }

    const hasAccess = await checkRvOwnership(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to update status for this RV', 403);
    }

    // Find the specific maintenance schedule
    const maintenanceSchedule = await MaintenanceSchedule.findOne({
        _id: maintenanceScheduleId,
        user: userId,
        rvId
    });

    if (!maintenanceSchedule) {
        throw new ApiError('Maintenance schedule not found or access denied', 404);
    }

    // Update the specific maintenance schedule to mark it as completed
    maintenanceSchedule.isCompleted = true;
    maintenanceSchedule.completionDate = new Date();
    maintenanceSchedule.vendor = vendor;
    maintenanceSchedule.cost = cost;
    maintenanceSchedule.date = date;
    await maintenanceSchedule.save();

    // Now update the RV's overall maintenance status
    const rvStatus = await updateRVMaintenanceStatusUtil(rvId);

    res.status(200).json({
        success: true,
        message: 'Maintenance schedule marked as completed and RV status updated successfully',
        data: {
            maintenanceSchedule,
            rvStatus
        }
    });
});

// Helper function to check if user has access to the RV
async function checkRvOwnership(userId, rvId) {
    const user = await User.findById(userId).select('rvIds');
    if (!user || !user.rvIds.includes(rvId)) {
        return false;
    }
    return true;
}