// Temporary script for debugging renderShips function
function renderShips() {
    grid.querySelectorAll('.ship-wrapper').forEach(el => el.remove());

    const weekStart = new Date(currentStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const MAX_GRID_WIDTH = 7 * 24 * HOUR_WIDTH;

    const visibleShips = shipSchedules.filter(ship => {
    const shipStartTime = new Date(ship.startTime);
    const shipEndTime = new Date(ship.endTime);
    return shipStartTime < weekEnd && shipEndTime > weekStart;
});

    visibleShips.forEach((ship) => {
        console.log('Rendering ship data:', ship);

        const shipIndex = shipSchedules.indexOf(ship);
        const eta = new Date(ship.etaTime);
        const etb = new Date(ship.startTime);
        const etc = ship.etcTime ? new Date(ship.etcTime) : null;
        const etd = new Date(ship.endTime);

        if (isNaN(eta) || isNaN(etb) || isNaN(etd)) return;

        const getHoursSinceWeekStart = (date) => (date.getTime() - weekStart.getTime()) / (1000 * 60 * 60);

        let rawLeft = getHoursSinceWeekStart(eta) * HOUR_WIDTH;
        let rawWidth = ((etd.getTime() - eta.getTime()) / (1000 * 60 * 60)) * HOUR_WIDTH;
        rawWidth = Math.max(rawWidth, HOUR_WIDTH / 2);

        let finalLeft = Math.max(0, rawLeft);
        let leftCropAmount = finalLeft - rawLeft;
        let rightEdge = Math.min(MAX_GRID_WIDTH, rawLeft + rawWidth);
        let finalWidth = rightEdge - finalLeft;
        if (finalWidth <= 0) return;

        const kdUnitPx = KD_HEIGHT_UNIT / (KD_MARKERS[1] - KD_MARKERS[0]);
        const berthStartKd = ship.berthStartKd ?? ship.berthLocation;
        const top = (berthStartKd - KD_MIN) * kdUnitPx;
        const calculatedHeight = ship.length * kdUnitPx;
        const height = Math.max(calculatedHeight, KD_HEIGHT_UNIT / 2);
        const finalTop = Math.max(top, 0);

        // Render logic continues...
    });
}