// utils/maintenanceUtils.js
const { db, FieldValue } = require('../config/db');
const { queryToArr, docToObj } = require('./firestoreHelper');

const calculateMaintenanceStatus = (schedule, currentMileage, currentDate = new Date()) => {
    const { initialMilage, dateOfMaintenance, isCompleted } = schedule;

    if (isCompleted) {
        return { status: 'completed', isOverdue: false, nextMaintenanceDate: null, nextMaintenanceMileage: null };
    }

    const UPCOMING_MILEAGE_THRESHOLD = 500;
    const UPCOMING_DAYS_THRESHOLD = 30;

    let nextMaintenanceDate = dateOfMaintenance ? new Date(dateOfMaintenance) : null;
    let nextMaintenanceMileage = (initialMilage !== undefined && initialMilage !== null) ? initialMilage : null;

    let status = 'scheduled';
    let isOverdue = false;
    let daysUntilDue = null;
    let mileageUntilDue = null;

    if (nextMaintenanceDate && currentDate >= nextMaintenanceDate) {
        isOverdue = true;
        status = 'overdue';
        daysUntilDue = Math.ceil((currentDate - nextMaintenanceDate) / (1000 * 60 * 60 * 24)) * -1;
    } else if (nextMaintenanceMileage !== null && currentMileage >= nextMaintenanceMileage) {
        isOverdue = true;
        status = 'overdue';
        mileageUntilDue = currentMileage - nextMaintenanceMileage;
    } else {
        let isUpcoming = false;

        if (nextMaintenanceDate) {
            const timeDiff = nextMaintenanceDate - currentDate;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            daysUntilDue = daysDiff;
            if (daysDiff <= UPCOMING_DAYS_THRESHOLD) isUpcoming = true;
        }

        if (nextMaintenanceMileage !== null) {
            const mileageDiff = nextMaintenanceMileage - currentMileage;
            mileageUntilDue = mileageDiff;
            if (mileageDiff <= UPCOMING_MILEAGE_THRESHOLD) isUpcoming = true;
        }

        if (isUpcoming) status = 'upcoming';
    }

    return { nextMaintenanceDate, nextMaintenanceMileage, status, isOverdue, daysUntilDue, mileageUntilDue };
};


const updateRVMaintenanceStatus = async (rvId) => {
    try {
        const rvSnap = await db.collection('rvs').doc(rvId).get();
        if (!rvSnap.exists) throw new Error('RV not found');
        const rv = docToObj(rvSnap);

        const snap = await db.collection('maintenanceSchedules').where('rvId', '==', rvId).get();
        const maintenanceSchedules = queryToArr(snap);

        if (!maintenanceSchedules.length) {
            await db.collection('rvs').doc(rvId).update({
                isOverdueForMaintenance: false,
                overdueMaintenanceCount: 0,
                isUpcomingMaintenance: false,
                nextMaintenanceDate: null,
                nextMaintenanceMileage: null,
                lastMaintenanceCheck: new Date().toISOString(),
                updatedAt: FieldValue.serverTimestamp()
            });
            return { hasOverdue: false, count: 0 };
        }

        let hasOverdue = false;
        let hasUpcoming = false;
        let overdueCount = 0;
        let closestNextDate = null;
        let closestNextMileage = null;

        for (const schedule of maintenanceSchedules) {
            const statusInfo = calculateMaintenanceStatus(schedule, rv.currentMileage || 0);
            if (statusInfo.status === 'completed') continue;

            if (statusInfo.isOverdue) { hasOverdue = true; overdueCount++; }
            if (statusInfo.status === 'upcoming') hasUpcoming = true;

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

        await db.collection('rvs').doc(rvId).update({
            isOverdueForMaintenance: hasOverdue,
            overdueMaintenanceCount: overdueCount,
            isUpcomingMaintenance: hasUpcoming,
            nextMaintenanceDate: closestNextDate ? closestNextDate.toISOString() : null,
            nextMaintenanceMileage: closestNextMileage,
            lastMaintenanceCheck: new Date().toISOString(),
            updatedAt: FieldValue.serverTimestamp()
        });

        return { hasOverdue, overdueCount, isUpcomingMaintenance: hasUpcoming, nextMaintenanceDate: closestNextDate, nextMaintenanceMileage: closestNextMileage };
    } catch (error) {
        console.error('Error updating RV maintenance status:', error);
        throw error;
    }
};

module.exports = { updateRVMaintenanceStatus, calculateMaintenanceStatus };
