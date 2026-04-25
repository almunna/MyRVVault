const { db } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const { calculateMaintenanceStatus } = require('../../../utils/maintenanceUtils');
const { calculateHealthScore } = require('../../../utils/healthScore');

const APPLIANCE_COLLECTIONS = [
    'airConditioners', 'heaters', 'waterPumps', 'washers', 'waterHeaters',
    'dryers', 'toilets', 'dishwashers', 'exhaustFans', 'ventFans', 'cellingFans',
    'tvs', 'dvds', 'surroundSounds', 'wifiRouters', 'internetSatellite',
    'gpsSystems', 'outdoorRadios', 'tires'
];

// Matches what generatorLog.controller.js uses
const GENERATOR_INTERVALS = [
    { hours: 100, task: 'Oil Change',            priority: 'high'   },
    { hours: 200, task: 'Air Filter',            priority: 'medium' },
    { hours: 300, task: 'Spark Plug Replacement', priority: 'high'   },
];

const RELATED_COMPONENTS = {
    chassis:           ['tire', 'waterPump', 'exhaustFans'],
    tire:              ['chassis', 'waterPump'],
    airConditioning:   ['exhaustFans', 'ventFans', 'heater'],
    heater:            ['airConditioning', 'waterHeater', 'exhaustFans'],
    waterHeater:       ['waterPump', 'heater', 'toilet'],
    waterPump:         ['waterHeater', 'toilet', 'washer'],
    generator:         ['exhaustFans', 'ventFans', 'waterPump'],
    exhaustFans:       ['ventFans', 'airConditioning', 'heater'],
    ventFans:          ['exhaustFans', 'airConditioning', 'ceilingFans'],
    ceilingFans:       ['ventFans', 'exhaustFans'],
    washer:            ['waterPump', 'dryer', 'waterHeater'],
    dryer:             ['washer', 'exhaustFans'],
    toilet:            ['waterPump', 'waterHeater'],
    dishwasher:        ['waterPump', 'waterHeater', 'washer'],
    tv:                ['dvdPlayer', 'surroundSound', 'wifiRouter'],
    dvdPlayer:         ['tv', 'surroundSound'],
    surroundSound:     ['tv', 'dvdPlayer'],
    wifiRouter:        ['tv', 'satelliteInternet', 'internetSatellite'],
    satelliteInternet: ['wifiRouter', 'tv', 'outdoorRadio'],
    gps:               ['wifiRouter', 'satelliteInternet'],
    outdoorRadio:      ['surroundSound', 'tv'],
};

exports.getRelatedComponents = asyncHandler(async (req, res) => {
    const { component } = req.query;
    if (component) {
        const related = RELATED_COMPONENTS[component] || [];
        return res.status(200).json({ success: true, data: { component, related } });
    }
    res.status(200).json({ success: true, data: RELATED_COMPONENTS });
});

exports.getSmartSuggestions = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) throw new ApiError('No RV selected. Please select an RV first.', 400);
    if (!rvId) rvId = selectedRvId;

    const rvSnap = await db.collection('rvs').doc(rvId).get();
    if (!rvSnap.exists) throw new ApiError('RV not found', 404);
    const rv = docToObj(rvSnap);

    const suggestions = [];
    const currentMileage = rv.currentMileage || 0;
    const currentDate    = new Date();

    // ── 1. Maintenance schedules — mileage, time, and hour intervals ──────────
    const maintenanceSnap = await db.collection('maintenanceSchedules')
        .where('user',        '==', userId)
        .where('rvId',        '==', rvId)
        .where('isCompleted', '==', false)
        .get();
    const schedules = queryToArr(maintenanceSnap);
    const generatorHours = rv.generatorHours || 0;

    schedules.forEach(schedule => {
        const statusInfo = calculateMaintenanceStatus(schedule, currentMileage, currentDate);

        // Mileage & date-based
        if (statusInfo.status === 'overdue') {
            suggestions.push({
                type: 'maintenance',
                priority: 'high',
                title: `Overdue: ${schedule.component}`,
                message: schedule.maintenanceToBePerformed || `${schedule.component} maintenance is overdue`,
                detail: statusInfo.daysUntilDue != null
                    ? `${Math.abs(statusInfo.daysUntilDue)} days overdue`
                    : statusInfo.mileageUntilDue != null
                    ? `${Math.abs(statusInfo.mileageUntilDue).toLocaleString()} miles overdue`
                    : null,
                scheduleId: schedule.id,
                action: { label: 'View Maintenance', href: '/newMaintenance' }
            });
        } else if (statusInfo.status === 'upcoming') {
            const detail = statusInfo.daysUntilDue != null
                ? `Due in ${statusInfo.daysUntilDue} day${statusInfo.daysUntilDue !== 1 ? 's' : ''}`
                : statusInfo.mileageUntilDue != null
                ? `Due in ${statusInfo.mileageUntilDue.toLocaleString()} miles`
                : null;
            suggestions.push({
                type: 'maintenance',
                priority: 'medium',
                title: `Due Soon: ${schedule.component}`,
                message: schedule.maintenanceToBePerformed || `${schedule.component} maintenance is due soon`,
                detail,
                scheduleId: schedule.id,
                action: { label: 'View Maintenance', href: '/newMaintenance' }
            });
        }

        // Hour-based: maintenance linked to generator hours
        if (schedule.hoursAtMaintenance && generatorHours > 0) {
            const hoursUntil = schedule.hoursAtMaintenance - generatorHours;
            if (hoursUntil <= 0) {
                suggestions.push({
                    type: 'maintenance',
                    priority: 'high',
                    title: `Hour-Based Service Overdue: ${schedule.component}`,
                    message: schedule.maintenanceToBePerformed || `${schedule.component} was due at ${schedule.hoursAtMaintenance} hrs`,
                    detail: `Current: ${generatorHours} hrs — ${Math.abs(Math.round(hoursUntil))} hrs past due`,
                    scheduleId: schedule.id,
                    action: { label: 'View Maintenance', href: '/newMaintenance' }
                });
            } else if (hoursUntil <= 20) {
                suggestions.push({
                    type: 'maintenance',
                    priority: 'medium',
                    title: `Hour-Based Service Due Soon: ${schedule.component}`,
                    message: schedule.maintenanceToBePerformed || `${schedule.component} due at ${schedule.hoursAtMaintenance} hrs`,
                    detail: `Due in ${Math.round(hoursUntil)} hrs (current: ${generatorHours} hrs)`,
                    scheduleId: schedule.id,
                    action: { label: 'View Maintenance', href: '/newMaintenance' }
                });
            }
        }
    });

    // ── 2. Generator service reminders (hour intervals) ───────────────────────
    if (generatorHours > 0) {
        GENERATOR_INTERVALS.forEach(interval => {
            const remainder     = generatorHours % interval.hours;
            const hoursUntilDue = parseFloat((interval.hours - remainder).toFixed(1));
            if (hoursUntilDue <= 10) {
                suggestions.push({
                    type: 'generator',
                    priority: hoursUntilDue <= 0 ? 'high' : interval.priority,
                    title: `Generator: ${interval.task}`,
                    message: `${interval.task} due — every ${interval.hours} hrs`,
                    detail: hoursUntilDue <= 0
                        ? `Overdue by ${Math.abs(hoursUntilDue)} hrs (current: ${generatorHours} hrs)`
                        : `Due in ${hoursUntilDue} hrs (current: ${generatorHours} hrs)`,
                    hoursUntilDue,
                    action: { label: 'Log Generator Hours', href: '/generatorLog' }
                });
            }
        });
    }

    // ── 3. Insurance expiration ───────────────────────────────────────────────
    const insuranceSnap = await db.collection('insurance')
        .where('user',  '==', userId)
        .where('rvId',  '==', rvId)
        .get();
    queryToArr(insuranceSnap).forEach(ins => {
        if (!ins.renewalDate) return;
        const daysUntil = Math.ceil((new Date(ins.renewalDate) - currentDate) / 86400000);
        if (daysUntil < 0) {
            suggestions.push({
                type: 'insurance',
                priority: 'high',
                title: 'Insurance Expired',
                message: `${ins.companyName || 'Insurance'} expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`,
                detail: 'Driving without valid insurance is illegal',
                action: { label: 'View Insurance', href: '/insuranceInfo' }
            });
        } else if (daysUntil <= 30) {
            suggestions.push({
                type: 'insurance',
                priority: daysUntil <= 7 ? 'high' : 'medium',
                title: 'Insurance Expiring Soon',
                message: `${ins.companyName || 'Insurance'} expires in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
                action: { label: 'View Insurance', href: '/insuranceInfo' }
            });
        }
    });

    // ── 4. Open repair orders ─────────────────────────────────────────────────
    const repairSnap = await db.collection('repairOrders')
        .where('user',  '==', userId)
        .where('rvId',  '==', rvId)
        .get();
    const openRepairs = queryToArr(repairSnap).filter(r => r.status === 'pending' || r.status === 'in-progress');
    if (openRepairs.length > 0) {
        suggestions.push({
            type: 'repair',
            priority: 'medium',
            title: `${openRepairs.length} Open Repair Order${openRepairs.length > 1 ? 's' : ''}`,
            message: `${openRepairs.length} repair order${openRepairs.length > 1 ? 's are' : ' is'} pending or in progress`,
            count: openRepairs.length,
            action: { label: 'View Repairs', href: '/repairOrders' }
        });
    }

    // ── 5. All appliance scans — warranty, health, battery, detector age ───────
    await Promise.all(APPLIANCE_COLLECTIONS.map(async (col) => {
        try {
            const snap = await db.collection(col)
                .where('user',  '==', userId)
                .where('rvId',  '==', rvId)
                .get();

            queryToArr(snap).forEach(item => {
                const label    = item.name || col.replace(/([A-Z])/g, ' $1').trim();
                const nameLower = (item.name || '').toLowerCase();

                // Warranty expiry
                if (item.warrantyEndDate) {
                    const daysUntil = Math.ceil((new Date(item.warrantyEndDate) - currentDate) / 86400000);
                    if (daysUntil < 0) {
                        suggestions.push({
                            type: 'warranty',
                            priority: 'medium',
                            title: `Warranty Expired: ${label}`,
                            message: `${label} warranty expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`,
                            detail: item.warrantyProvider ? `Provider: ${item.warrantyProvider}` : null,
                            action: { label: 'View Components', href: '/havcApplication' }
                        });
                    } else if (daysUntil <= 30) {
                        suggestions.push({
                            type: 'warranty',
                            priority: 'medium',
                            title: `Warranty Expiring: ${label}`,
                            message: `Warranty expires in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
                            detail: item.warrantyProvider ? `Provider: ${item.warrantyProvider}` : null,
                            action: { label: 'View Components', href: '/havcApplication' }
                        });
                    }
                }

                // Tire age (replace every 5-6 years regardless of tread)
                if (col === 'tires' && item.installDate) {
                    const yearsOld = (currentDate - new Date(item.installDate)) / (1000 * 60 * 60 * 24 * 365);
                    if (yearsOld >= 5) {
                        suggestions.push({
                            type: 'component',
                            priority: yearsOld >= 6 ? 'high' : 'medium',
                            title: yearsOld >= 6 ? 'Tires Overdue for Replacement' : 'Tire Age Warning',
                            message: `${label} are ${Math.floor(yearsOld)} years old — RV tires should be replaced every 5-6 years regardless of tread depth`,
                            detail: `Installed: ${new Date(item.installDate).toLocaleDateString()}`,
                            action: { label: 'View Tires', href: '/components/tire' }
                        });
                    }
                }

                // Battery age warnings (3 yr warning, 5 yr critical)
                if ((nameLower.includes('battery') || nameLower.includes('batteries')) && item.installDate) {
                    const yearsOld = (currentDate - new Date(item.installDate)) / (1000 * 60 * 60 * 24 * 365);
                    if (yearsOld >= 3) {
                        suggestions.push({
                            type: 'component',
                            priority: yearsOld >= 5 ? 'high' : 'medium',
                            title: yearsOld >= 5 ? 'Battery Replacement Overdue' : 'Battery Age Warning',
                            message: `${label} is ${Math.floor(yearsOld)} years old — RV batteries typically last 3-5 years`,
                            detail: `Installed: ${new Date(item.installDate).toLocaleDateString()}`,
                            action: { label: 'View Components', href: '/havcApplication' }
                        });
                    }
                }

                // Smoke/CO detector age warnings (replace every 7-10 years per NFPA)
                if ((nameLower.includes('detector') || nameLower.includes('smoke') || nameLower.includes('carbon monoxide') || nameLower.includes(' co ')) && item.installDate) {
                    const yearsOld = (currentDate - new Date(item.installDate)) / (1000 * 60 * 60 * 24 * 365);
                    if (yearsOld >= 7) {
                        suggestions.push({
                            type: 'component',
                            priority: yearsOld >= 10 ? 'high' : 'medium',
                            title: yearsOld >= 10 ? 'Detector Replacement Overdue' : 'Smoke/CO Detector Age Warning',
                            message: `${label} is ${Math.floor(yearsOld)} years old — detectors should be replaced every 7-10 years`,
                            detail: 'NFPA safety standard',
                            action: { label: 'View Components', href: '/havcApplication' }
                        });
                    }
                }

                // Component health score
                const health = calculateHealthScore(item, currentMileage, currentDate);
                if (health.status === 'overdue') {
                    suggestions.push({
                        type: 'component_health',
                        priority: 'high',
                        title: `Needs Attention: ${label}`,
                        message: `Health score ${health.score}/100 — consider inspection or replacement`,
                        detail: health.factors?.find(f => f.deduction > 0)
                            ? `Top issue: ${health.factors.find(f => f.deduction > 0).name}`
                            : null,
                        healthScore: health.score,
                        action: { label: 'View Components', href: '/havcApplication' }
                    });
                } else if (health.status === 'needs_attention') {
                    suggestions.push({
                        type: 'component_health',
                        priority: 'medium',
                        title: `Check Recommended: ${label}`,
                        message: `Health score ${health.score}/100 — monitoring recommended`,
                        healthScore: health.score,
                        action: { label: 'View Components', href: '/havcApplication' }
                    });
                }
            });
        } catch { /* skip collections that error */ }
    }));

    // Sort: high → medium → low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    suggestions.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

    res.status(200).json({
        success: true,
        message: 'Smart suggestions retrieved successfully',
        data: suggestions,
        summary: {
            total:  suggestions.length,
            high:   suggestions.filter(s => s.priority === 'high').length,
            medium: suggestions.filter(s => s.priority === 'medium').length,
            low:    suggestions.filter(s => s.priority === 'low').length,
        }
    });
});
