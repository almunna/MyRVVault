// utils/rvMaintenanceUpdater.js
const MaintenanceSchedule = require('../app/module/MaintenanceSchedule/MaintenanceSchedule');
const RV = require('../app/module/RV/RV');

// Use the same calculateMaintenanceStatus function from your controller
const calculateMaintenanceStatus = (schedule, currentMileage, currentDate = new Date()) => {
  const {
    initialMilage,
    dateOfMaintenance,
    isCompleted
  } = schedule;

  if (isCompleted) {
      return {
          status: 'completed',
          isOverdue: false,
          nextMaintenanceDate: null,
          nextMaintenanceMileage: null
      };
  }

  const UPCOMING_MILEAGE_THRESHOLD = 500;
  const UPCOMING_DAYS_THRESHOLD = 30;

  let nextMaintenanceDate = dateOfMaintenance ? new Date(dateOfMaintenance) : null;
  let nextMaintenanceMileage = (initialMilage !== undefined && initialMilage !== null) ? initialMilage : null;
  
  let status = 'scheduled';
  let isOverdue = false;

  // Check Overdue
  if (nextMaintenanceDate && currentDate >= nextMaintenanceDate) {
    isOverdue = true;
    status = 'overdue';
  } else if (nextMaintenanceMileage !== null && currentMileage >= nextMaintenanceMileage) {
    isOverdue = true;
    status = 'overdue';
  } 
  // Check Upcoming (only if not overdue)
  else {
    let isUpcoming = false;

    if (nextMaintenanceDate) {
        const timeDiff = nextMaintenanceDate - currentDate;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        if (daysDiff <= UPCOMING_DAYS_THRESHOLD) {
            isUpcoming = true;
        }
    }

    if (nextMaintenanceMileage !== null) {
        const mileageDiff = nextMaintenanceMileage - currentMileage;
        if (mileageDiff <= UPCOMING_MILEAGE_THRESHOLD) {
            isUpcoming = true;
        }
    }

    if (isUpcoming) {
        status = 'upcoming';
    }
  }

  return {
    nextMaintenanceDate,
    nextMaintenanceMileage,
    status,
    isOverdue
  };
};

// Function to update RV maintenance status
const updateRVMaintenanceStatus = async (rvId) => {
  try {
    // Get the RV with current mileage
    const rv = await RV.findById(rvId);
    if (!rv) {
      throw new Error('RV not found');
    }

    // Get all maintenance schedules for this RV
    const maintenanceSchedules = await MaintenanceSchedule.find({ rvId });
    
    if (!maintenanceSchedules || maintenanceSchedules.length === 0) {
      // No maintenance schedules - reset status
      await RV.findByIdAndUpdate(rvId, {
        isOverdueForMaintenance: false,
        overdueMaintenanceCount: 0,
        isUpcomingMaintenance: false,
        nextMaintenanceDate: null,
        nextMaintenanceMileage: null,
        lastMaintenanceCheck: new Date()
      });
      return { hasOverdue: false, count: 0 };
    }

    let hasOverdue = false;
    let hasUpcoming = false;
    let overdueCount = 0;
    let closestNextDate = null;
    let closestNextMileage = null;

    // Check each maintenance schedule
    for (const schedule of maintenanceSchedules) {
      const statusInfo = calculateMaintenanceStatus(schedule, rv.currentMileage || 0);
      
      if (statusInfo.status === 'completed') {
          continue;
      }

      if (statusInfo.isOverdue) {
        hasOverdue = true;
        overdueCount++;
      }
      
      if (statusInfo.status === 'upcoming') {
          hasUpcoming = true;
      }

      // Find the closest upcoming maintenance
      if (statusInfo.nextMaintenanceDate) {
        if (!closestNextDate || statusInfo.nextMaintenanceDate < closestNextDate) {
          closestNextDate = statusInfo.nextMaintenanceDate;
        }
      }

      if (statusInfo.nextMaintenanceMileage) {
        if (!closestNextMileage || statusInfo.nextMaintenanceMileage < closestNextMileage) {
          closestNextMileage = statusInfo.nextMaintenanceMileage;
        }
      }
    }

    // Update the RV with the calculated status
    await RV.findByIdAndUpdate(rvId, {
      isOverdueForMaintenance: hasOverdue,
      overdueMaintenanceCount: overdueCount,
      isUpcomingMaintenance: hasUpcoming,
      nextMaintenanceDate: closestNextDate,
      nextMaintenanceMileage: closestNextMileage,
      lastMaintenanceCheck: new Date()
    });

    return {
      hasOverdue,
      overdueCount,
      isUpcomingMaintenance: hasUpcoming,
      nextMaintenanceDate: closestNextDate,
      nextMaintenanceMileage: closestNextMileage
    };

  } catch (error) {
    console.error('Error updating RV maintenance status:', error);
    throw error;
  }
};

module.exports = {
  updateRVMaintenanceStatus,
  calculateMaintenanceStatus
};