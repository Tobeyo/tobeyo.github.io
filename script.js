/* ===== AutoSwap — Car Sharing Tracker ===== */

(function () {
    'use strict';

    // ===== CONSTANTS =====
    const DRIVERS = { TOBIAS: 'Tobias', DANIEL: 'Daniel' };
    const STORAGE_KEYS = {
        currentDriver: 'autoswap_currentDriver',
        swapHistory: 'autoswap_swapHistory',
        plannedSwaps: 'autoswap_plannedSwaps',
        lastSwapDate: 'autoswap_lastSwapDate'
    };

    const MONTH_NAMES = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    const DAY_NAMES_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    // ===== STATE =====
    let currentDriver = load(STORAGE_KEYS.currentDriver) || DRIVERS.TOBIAS;
    let swapHistory = load(STORAGE_KEYS.swapHistory) || [];
    let plannedSwaps = load(STORAGE_KEYS.plannedSwaps) || [];
    let lastSwapDate = load(STORAGE_KEYS.lastSwapDate) || todayStr();
    let calYear, calMonth;

    // ===== DOM REFS =====
    const $ = (id) => document.getElementById(id);
    const driverAvatar = $('driverAvatar');
    const driverInitial = $('driverInitial');
    const driverName = $('driverName');
    const driverSince = $('driverSince');
    const avatarRing = $('avatarRing');
    const swapBtn = $('swapBtn');
    const swapAnimation = $('swapAnimation');
    const heroCard = $('heroCard');

    const statWeekTobias = $('statWeekTobias');
    const statWeekDaniel = $('statWeekDaniel');
    const statMonthTobias = $('statMonthTobias');
    const statMonthDaniel = $('statMonthDaniel');

    const calTitle = $('calTitle');
    const calPrev = $('calPrev');
    const calNext = $('calNext');
    const calendarDays = $('calendarDays');

    const nextSwapDate = $('nextSwapDate');
    const nextSwapDetail = $('nextSwapDetail');
    const planSwapDate = $('planSwapDate');
    const planSwapBtn = $('planSwapBtn');

    const historyList = $('historyList');
    const headerTime = $('headerTime');

    // ===== HELPERS =====
    function save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { /* quota exceeded, ignore */ }
    }

    function load(key) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : null;
        } catch (e) { return null; }
    }

    function todayStr() {
        return new Date().toISOString().slice(0, 10);
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return `${d.getDate()}. ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }

    function formatDateTime(isoStr) {
        const d = new Date(isoStr);
        const day = d.getDate();
        const month = MONTH_NAMES[d.getMonth()];
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${day}. ${month}, ${h}:${m}`;
    }

    function daysBetween(dateA, dateB) {
        const a = new Date(dateA + 'T00:00:00');
        const b = new Date(dateB + 'T00:00:00');
        return Math.round((b - a) / (1000 * 60 * 60 * 24));
    }

    function otherDriver(driver) {
        return driver === DRIVERS.TOBIAS ? DRIVERS.DANIEL : DRIVERS.TOBIAS;
    }

    // ===== INIT =====
    function init() {
        const now = new Date();
        calYear = now.getFullYear();
        calMonth = now.getMonth();

        updateDriverDisplay();
        updateStats();
        renderCalendar();
        updateNextSwap();
        renderHistory();
        createParticles();
        startClock();

        // Set min date for planner
        planSwapDate.min = todayStr();

        // Event listeners
        swapBtn.addEventListener('click', doSwap);
        calPrev.addEventListener('click', () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); });
        calNext.addEventListener('click', () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); });
        planSwapBtn.addEventListener('click', planSwap);
    }

    // ===== DRIVER DISPLAY =====
    function updateDriverDisplay() {
        const isTobias = currentDriver === DRIVERS.TOBIAS;
        driverInitial.textContent = isTobias ? 'T' : 'D';
        driverName.textContent = currentDriver;

        // Color classes
        driverAvatar.className = 'driver-avatar' + (isTobias ? '' : ' daniel');
        driverName.className = 'driver-name ' + (isTobias ? 'tobias' : 'daniel');

        // Update "since" text
        const days = daysBetween(lastSwapDate, todayStr());
        if (days === 0) {
            driverSince.textContent = 'seit heute';
        } else if (days === 1) {
            driverSince.textContent = 'seit gestern';
        } else {
            driverSince.textContent = `seit ${days} Tagen (${formatDate(lastSwapDate)})`;
        }

        // Update ring animation color
        const color = isTobias ? '56, 189, 248' : '167, 139, 250';
        avatarRing.style.setProperty('--ring-rgb', color);
    }

    // ===== SWAP =====
    function doSwap() {
        // Animate
        swapAnimation.classList.add('active');
        swapBtn.disabled = true;
        heroCard.style.transition = 'opacity 0.3s';
        
        // Vibration feedback if supported
        if (navigator.vibrate) navigator.vibrate(100);

        setTimeout(() => {
            // Toggle driver
            const previousDriver = currentDriver;
            currentDriver = otherDriver(currentDriver);
            lastSwapDate = todayStr();

            // Save
            save(STORAGE_KEYS.currentDriver, currentDriver);
            save(STORAGE_KEYS.lastSwapDate, lastSwapDate);

            // Log to history
            const entry = {
                id: Date.now(),
                from: previousDriver,
                to: currentDriver,
                timestamp: new Date().toISOString(),
                date: todayStr()
            };
            swapHistory.unshift(entry);
            if (swapHistory.length > 50) swapHistory.pop();
            save(STORAGE_KEYS.swapHistory, swapHistory);

            // Remove planned swap if it's today
            plannedSwaps = plannedSwaps.filter(s => s.date !== todayStr());
            save(STORAGE_KEYS.plannedSwaps, plannedSwaps);

            // Update UI
            updateDriverDisplay();
            updateStats();
            renderCalendar();
            updateNextSwap();
            renderHistory();

            swapAnimation.classList.remove('active');
            swapBtn.disabled = false;
        }, 800);
    }

    // ===== STATS =====
    function updateStats() {
        const today = new Date();
        const todayS = todayStr();

        // Get all swap dates from history to build a day-by-day assignment
        const dayMap = buildDayMap();

        // Week stats (Monday to Sunday)
        const weekStart = getMonday(today);
        let weekT = 0, weekD = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const ds = d.toISOString().slice(0, 10);
            if (ds > todayS) break;
            const driver = dayMap[ds] || currentDriver;
            if (driver === DRIVERS.TOBIAS) weekT++;
            else weekD++;
        }
        statWeekTobias.textContent = weekT;
        statWeekDaniel.textContent = weekD;

        // Month stats
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        let monthT = 0, monthD = 0;
        for (let d = new Date(monthStart); d <= today; d.setDate(d.getDate() + 1)) {
            const ds = d.toISOString().slice(0, 10);
            const driver = dayMap[ds] || currentDriver;
            if (driver === DRIVERS.TOBIAS) monthT++;
            else monthD++;
        }
        statMonthTobias.textContent = monthT;
        statMonthDaniel.textContent = monthD;
    }

    function getMonday(d) {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.getFullYear(), d.getMonth(), diff);
    }

    function buildDayMap() {
        // Build a map of date -> driver by replaying swap history
        // History is sorted newest-first, so we reverse to replay chronologically
        const sorted = [...swapHistory].reverse();
        const map = {};
        const today = todayStr();
        
        if (sorted.length === 0) {
            // No history — current driver has it for all days since lastSwapDate
            let d = new Date(lastSwapDate + 'T00:00:00');
            const end = new Date(today + 'T00:00:00');
            while (d <= end) {
                map[d.toISOString().slice(0, 10)] = currentDriver;
                d.setDate(d.getDate() + 1);
            }
            return map;
        }

        // Fill from each swap entry
        for (let i = 0; i < sorted.length; i++) {
            const swap = sorted[i];
            const startDate = swap.date;
            const endDate = i < sorted.length - 1 ? sorted[i + 1].date : today;

            let d = new Date(startDate + 'T00:00:00');
            const end = new Date(endDate + 'T00:00:00');
            while (d <= end) {
                map[d.toISOString().slice(0, 10)] = swap.to;
                d.setDate(d.getDate() + 1);
            }
        }

        // Also fill today with current driver
        map[today] = currentDriver;

        return map;
    }

    // ===== CALENDAR =====
    function renderCalendar() {
        calTitle.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;

        const firstDay = new Date(calYear, calMonth, 1);
        const lastDay = new Date(calYear, calMonth + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Get the day of week for the first day (0=Sun, we want Mon=0)
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        const dayMap = buildDayMap();
        const todayS = todayStr();
        const plannedDates = new Set(plannedSwaps.map(s => s.date));

        let html = '';

        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
            html += '<div class="cal-day empty"></div>';
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const classes = ['cal-day'];

            if (dateStr === todayS) classes.push('today');
            
            // Color by driver
            const driver = dayMap[dateStr];
            if (driver === DRIVERS.TOBIAS) classes.push('tobias-day');
            else if (driver === DRIVERS.DANIEL) classes.push('daniel-day');

            // Swap marker
            if (plannedDates.has(dateStr)) classes.push('swap-marker');

            // Check if a swap happened on this day
            const hadSwap = swapHistory.some(s => s.date === dateStr);
            if (hadSwap) classes.push('swap-marker');

            html += `<div class="${classes.join(' ')}" data-date="${dateStr}" title="${dateStr}">${day}</div>`;
        }

        calendarDays.innerHTML = html;

        // Add click listeners to day cells
        calendarDays.querySelectorAll('.cal-day:not(.empty)').forEach(el => {
            el.addEventListener('click', () => {
                const date = el.dataset.date;
                if (date >= todayStr()) {
                    planSwapDate.value = date;
                }
            });
        });
    }

    // ===== NEXT SWAP =====
    function updateNextSwap() {
        // Filter future planned swaps
        const today = todayStr();
        const future = plannedSwaps
            .filter(s => s.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date));

        if (future.length > 0) {
            const next = future[0];
            const days = daysBetween(today, next.date);
            nextSwapDate.textContent = formatDate(next.date);

            if (days === 0) {
                nextSwapDetail.textContent = 'Heute! 🚗💨';
            } else if (days === 1) {
                nextSwapDetail.textContent = 'Morgen';
            } else {
                nextSwapDetail.textContent = `In ${days} Tagen`;
            }
        } else {
            nextSwapDate.textContent = 'Keiner geplant';
            nextSwapDetail.textContent = 'Wähle ein Datum unten aus';
        }
    }

    function planSwap() {
        const date = planSwapDate.value;
        if (!date) return;

        const today = todayStr();
        if (date < today) return;

        // Don't add duplicate
        if (plannedSwaps.some(s => s.date === date)) {
            // Remove it instead (toggle)
            plannedSwaps = plannedSwaps.filter(s => s.date !== date);
        } else {
            plannedSwaps.push({
                date: date,
                createdAt: new Date().toISOString()
            });
        }

        save(STORAGE_KEYS.plannedSwaps, plannedSwaps);
        updateNextSwap();
        renderCalendar();
        planSwapDate.value = '';
    }

    // ===== HISTORY =====
    function renderHistory() {
        if (swapHistory.length === 0) {
            historyList.innerHTML = '<div class="history-empty">Noch keine Tausche — drück den Swap-Button! 🚗</div>';
            return;
        }

        let html = '';
        const visible = swapHistory.slice(0, 15);

        visible.forEach(entry => {
            const fromClass = entry.from === DRIVERS.TOBIAS ? 'name-tobias' : 'name-daniel';
            const toClass = entry.to === DRIVERS.TOBIAS ? 'name-tobias' : 'name-daniel';

            html += `
                <div class="history-item" data-id="${entry.id}">
                    <span class="history-swap-icon">🔄</span>
                    <div class="history-info">
                        <div class="history-text">
                            <span class="${fromClass}">${entry.from}</span> → <span class="${toClass}">${entry.to}</span>
                        </div>
                        <div class="history-time">${formatDateTime(entry.timestamp)}</div>
                    </div>
                    <button class="history-delete" title="Löschen" data-id="${entry.id}">✕</button>
                </div>
            `;
        });

        historyList.innerHTML = html;

        // Delete listeners
        historyList.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                swapHistory = swapHistory.filter(s => s.id !== id);
                save(STORAGE_KEYS.swapHistory, swapHistory);
                renderHistory();
                updateStats();
                renderCalendar();
            });
        });
    }

    // ===== PARTICLES =====
    function createParticles() {
        const container = $('bgParticles');
        const colors = ['#38bdf8', '#a78bfa', '#818cf8', '#34d399'];

        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            const size = Math.random() * 6 + 2;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDelay = Math.random() * 20 + 's';
            p.style.animationDuration = (15 + Math.random() * 20) + 's';
            container.appendChild(p);
        }
    }

    // ===== CLOCK =====
    function startClock() {
        function tick() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            headerTime.textContent = `${h}:${m}:${s}`;
        }
        tick();
        setInterval(tick, 1000);
    }

    // ===== GO =====
    document.addEventListener('DOMContentLoaded', init);
})();
