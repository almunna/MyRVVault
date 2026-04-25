/**
 * Calculates a health score (0-100) for an RV component.
 * Factors: age, mileage since install, generator hours, warranty status.
 */
function calculateHealthScore(component, currentMileage = 0, currentDate = new Date()) {
    let score = 100;
    const factors = [];

    // ── Age factor: each year deducts 5 pts, max 40 pts ─────────────────────
    const installDate = component.installDate || component.dateOfPurchase;
    if (installDate) {
        const yearsOld = (currentDate - new Date(installDate)) / (1000 * 60 * 60 * 24 * 365);
        const ageDeduction = Math.min(yearsOld * 5, 40);
        score -= ageDeduction;
        factors.push({
            name: 'Age',
            deduction: Math.round(ageDeduction),
            value: `${Math.floor(yearsOld)} yr${Math.floor(yearsOld) !== 1 ? 's' : ''} old`
        });
    }

    // ── Mileage factor: per 100k miles deducts up to 30 pts ──────────────────
    if (component.installMileage != null && currentMileage > 0) {
        const milesSinceInstall = Math.max(0, currentMileage - Number(component.installMileage));
        const mileDeduction = Math.min((milesSinceInstall / 100000) * 20, 30);
        score -= mileDeduction;
        factors.push({
            name: 'Mileage',
            deduction: Math.round(mileDeduction),
            value: `${milesSinceInstall.toLocaleString()} mi since install`
        });
    }

    // ── Generator hours factor: per 500 hrs deducts up to 20 pts ─────────────
    if (component.installHours != null && component.currentHours != null) {
        const hoursSinceInstall = Math.max(0, Number(component.currentHours) - Number(component.installHours));
        const hoursDeduction = Math.min((hoursSinceInstall / 500) * 10, 20);
        score -= hoursDeduction;
        factors.push({
            name: 'Hours',
            deduction: Math.round(hoursDeduction),
            value: `${hoursSinceInstall.toFixed(0)} hrs since install`
        });
    }

    // ── Warranty factor ────────────────────────────────────────────────────────
    if (component.warrantyEndDate) {
        const warrantyEnd = new Date(component.warrantyEndDate);
        if (currentDate > warrantyEnd) {
            score -= 10;
            factors.push({ name: 'Warranty', deduction: 10, value: 'Expired' });
        } else {
            const daysLeft = Math.ceil((warrantyEnd - currentDate) / (1000 * 60 * 60 * 24));
            factors.push({ name: 'Warranty', deduction: 0, value: `${daysLeft}d remaining` });
        }
    }

    // ── Replacement resets age/mileage penalty ────────────────────────────────
    // If component was recently replaced, reduce any age penalty by the time since replacement
    if (component.lastReplacedDate) {
        const replacedAt = new Date(component.lastReplacedDate);
        const yearsSinceReplaced = (currentDate - replacedAt) / (1000 * 60 * 60 * 24 * 365);
        // Restore up to 30 pts based on how recently it was replaced
        const bonus = Math.max(0, 30 - yearsSinceReplaced * 10);
        score = Math.min(100, score + bonus);
        if (bonus > 0) {
            factors.push({ name: 'Recently Replaced', deduction: -Math.round(bonus), value: `${Math.floor(yearsSinceReplaced * 12)} months ago` });
        }
    }

    const finalScore = Math.max(0, Math.round(score));

    let status, color, label;
    if (finalScore >= 70) {
        status = 'good';
        color = '#52c41a';
        label = 'Good';
    } else if (finalScore >= 40) {
        status = 'needs_attention';
        color = '#faad14';
        label = 'Needs Attention';
    } else {
        status = 'overdue';
        color = '#ff4d4f';
        label = 'Overdue';
    }

    return { score: finalScore, status, color, label, factors };
}

module.exports = { calculateHealthScore };
