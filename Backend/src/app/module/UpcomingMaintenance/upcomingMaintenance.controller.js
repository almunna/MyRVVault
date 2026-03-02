const { db } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { queryToArr } = require('../../../utils/firestoreHelper');

const ONE_DAY = 1000 * 60 * 60 * 24;
const MAX_DAYS = 7;
const MAX_MILES = 1;

exports.getUpcomingMaintenance = asyncHandler(async (req, res) => {
    const snap = await db.collection('maintenanceSchedules').get();
    const maintenanceSchedules = queryToArr(snap);

    const upcomingMaintenances = maintenanceSchedules
        .map(maintenance => ({
            ...maintenance,
            daysUntilMaintenance: getDaysUntilMaintenance(maintenance.maintenanceToBePerformed),
            milesUntilMaintenance: getMilesUntilMaintenance(maintenance.initialMilage, req.user?.rv?.currentMileage || 0),
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
    if (!date) return Infinity;
    const today = new Date();
    const diffTime = Math.abs(new Date(date) - today);
    return Math.ceil(diffTime / ONE_DAY);
}

function getMilesUntilMaintenance(initialMileage, currentMileage) {
    return Math.abs((currentMileage || 0) - (initialMileage || 0));
}
