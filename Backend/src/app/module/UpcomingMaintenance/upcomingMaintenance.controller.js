const MaintenanceSchedule = require('../MaintenanceSchedule/MaintenanceSchedule');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');


const ONE_DAY = 1000 * 60 * 60 * 24;
const ONE_MILE = 1;
const MAX_DAYS = 7;
const MAX_MILES = 1;

exports.getUpcomingMaintenance = asyncHandler(async (req, res) => {
    const maintenanceSchedules = await MaintenanceSchedule.find({});

    const upcomingMaintenances = maintenanceSchedules
        .map((maintenance) => ({
            ...maintenance._doc,
            daysUntilMaintenance: getDaysUntilMaintenance(maintenance.maintenanceToBePerformed),
            milesUntilMaintenance: getMilesUntilMaintenance(maintenance.initialMilage, req.user.rv.currentMileage),
        }))
        .filter(({ daysUntilMaintenance, milesUntilMaintenance }) => 
            daysUntilMaintenance <= MAX_DAYS || milesUntilMaintenance <= MAX_MILES
        );

    res.status(200).json({
        success: true,
        message: 'Upcoming maintenances retrieved successfully',
        upcomingMaintenances
    });
});

function getDaysUntilMaintenance(date) {
    const today = new Date();
    const diffTime = Math.abs(date - today);
    return Math.ceil(diffTime / ONE_DAY);
}

function getMilesUntilMaintenance(initialMileage, currentMileage) {
    return Math.abs(currentMileage - initialMileage);
}
