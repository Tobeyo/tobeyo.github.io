/* ===== AutoSwap — Car Sharing Tracker ===== */

(function () {
    'use strict';

    // ===== CONSTANTS =====
    const DRIVERS = { TOBIAS: 'Tobias', DANIEL: 'Daniel' };
    const STORAGE_KEYS = {
        currentDriver: 'autoswap_currentDriver',
        swapHistory: 'autoswap_swapHistory',
        dayAssignments: 'autoswap_dayAssignments',
        lastSwapDate: 'autoswap_lastSwapDate'
    };

    const MONTH_NAMES = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    // ===== STATE =====
    let currentDriver = load(STORAGE_KEYS.currentDriver) || DRIVERS.TOBIAS;
    let swapHistory = load(STORAGE_KEYS.swapHistory) || [];
    // dayAssignments: { "2026-02-16": { driver: "Tobias", time: "14:00" }, ... }
    let dayAssignments = load(STORAGE_KEYS.dayAssignments) || {};
    let lastSwapDate = load(STORAGE_KEYS.lastSwapDate) || todayStr();
    let calYear, calMonth;
    let modalSelectedDriver = null;
    let modalCurrentDate = null;

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
    const calendarGrid = $('calendarGrid');

    const historyList = $('historyList');
    const headerTime = $('headerTime');

    // Modal
    const modalOverlay = $('modalOverlay');
    const dayModal = $('dayModal');
    const modalClose = $('modalClose');
    const modalDate = $('modalDate');
    const modalBtnTobias = $('modalBtnTobias');
    const modalBtnDaniel = $('modalBtnDaniel');
    const modalSwapTime = $('modalSwapTime');
    const modalSaveBtn = $('modalSaveBtn');
    const modalClearBtn = $('modalClearBtn');

    // ===== HELPERS =====
    function save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { /* quota exceeded */ }
    }

    function load(key) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : null;
        } catch (e) { return null; }
    }

    function todayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function formatDateLong(dateStr) {
        const d = parseDate(dateStr);
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

    function parseDate(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    function makeDateStr(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function daysBetween(dateA, dateB) {
        const a = parseDate(dateA);
        const b = parseDate(dateB);
        return Math.round((b - a) / (1000 * 60 * 60 * 24));
    }

    function otherDriver(driver) {
        return driver === DRIVERS.TOBIAS ? DRIVERS.DANIEL : DRIVERS.TOBIAS;
    }

    function getDriverForDate(dateStr) {
        // Priority: explicit day assignment > current driver for today > null
        if (dayAssignments[dateStr]) {
            return dayAssignments[dateStr].driver;
        }
        if (dateStr === todayStr()) {
            return currentDriver;
        }
        return null;
    }

    function getWeekdayName(dateStr) {
        const names = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        return names[parseDate(dateStr).getDay()];
    }

    // ===== INIT =====
    function init() {
        const now = new Date();
        calYear = now.getFullYear();
        calMonth = now.getMonth();

        // Ensure today has an assignment
        if (!dayAssignments[todayStr()]) {
            dayAssignments[todayStr()] = { driver: currentDriver, time: '' };
            save(STORAGE_KEYS.dayAssignments, dayAssignments);
        }

        updateDriverDisplay();
        updateStats();
        renderCalendar();
        renderHistory();
        createParticles();
        startClock();

        // Event listeners
        swapBtn.addEventListener('click', doSwap);
        calPrev.addEventListener('click', () => {
            calMonth--;
            if (calMonth < 0) { calMonth = 11; calYear--; }
            renderCalendar();
        });
        calNext.addEventListener('click', () => {
            calMonth++;
            if (calMonth > 11) { calMonth = 0; calYear++; }
            renderCalendar();
        });

        // Modal
        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        modalBtnTobias.addEventListener('click', () => selectModalDriver(DRIVERS.TOBIAS));
        modalBtnDaniel.addEventListener('click', () => selectModalDriver(DRIVERS.DANIEL));
        modalSaveBtn.addEventListener('click', saveModal);
        modalClearBtn.addEventListener('click', clearModalEntry);

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    // ===== DRIVER DISPLAY =====
    function updateDriverDisplay() {
        const isTobias = currentDriver === DRIVERS.TOBIAS;
        driverInitial.textContent = isTobias ? 'T' : 'D';
        driverName.textContent = currentDriver;

        driverAvatar.className = 'driver-avatar' + (isTobias ? '' : ' daniel');
        driverName.className = 'driver-name ' + (isTobias ? 'tobias' : 'daniel');

        const days = daysBetween(lastSwapDate, todayStr());
        if (days === 0) {
            driverSince.textContent = 'seit heute';
        } else if (days === 1) {
            driverSince.textContent = 'seit gestern';
        } else {
            driverSince.textContent = `seit ${days} Tagen (${formatDateLong(lastSwapDate)})`;
        }
    }

    // ===== SWAP =====
    function doSwap() {
        swapAnimation.classList.add('active');
        swapBtn.disabled = true;

        if (navigator.vibrate) navigator.vibrate(100);

        setTimeout(() => {
            const previousDriver = currentDriver;
            currentDriver = otherDriver(currentDriver);
            lastSwapDate = todayStr();

            save(STORAGE_KEYS.currentDriver, currentDriver);
            save(STORAGE_KEYS.lastSwapDate, lastSwapDate);

            // Update today's assignment
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            dayAssignments[todayStr()] = { driver: currentDriver, time: timeStr };
            save(STORAGE_KEYS.dayAssignments, dayAssignments);

            // Log to history
            const entry = {
                id: Date.now(),
                from: previousDriver,
                to: currentDriver,
                timestamp: new Date().toISOString(),
                date: todayStr(),
                time: timeStr
            };
            swapHistory.unshift(entry);
            if (swapHistory.length > 50) swapHistory.pop();
            save(STORAGE_KEYS.swapHistory, swapHistory);

            // Update UI
            updateDriverDisplay();
            updateStats();
            renderCalendar();
            renderHistory();

            swapAnimation.classList.remove('active');
            swapBtn.disabled = false;
        }, 800);
    }

    // ===== STATS =====
    function updateStats() {
        const today = todayStr();
        const todayDate = new Date();

        // Week stats (Monday to Sunday)
        const weekStart = getMonday(todayDate);
        let weekT = 0, weekD = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const ds = makeDateStr(d.getFullYear(), d.getMonth(), d.getDate());
            if (ds > today) break;
            const driver = getDriverForDate(ds);
            if (driver === DRIVERS.TOBIAS) weekT++;
            else if (driver === DRIVERS.DANIEL) weekD++;
        }
        statWeekTobias.textContent = weekT;
        statWeekDaniel.textContent = weekD;

        // Month stats
        let monthT = 0, monthD = 0;
        for (let day = 1; day <= todayDate.getDate(); day++) {
            const ds = makeDateStr(todayDate.getFullYear(), todayDate.getMonth(), day);
            const driver = getDriverForDate(ds);
            if (driver === DRIVERS.TOBIAS) monthT++;
            else if (driver === DRIVERS.DANIEL) monthD++;
        }
        statMonthTobias.textContent = monthT;
        statMonthDaniel.textContent = monthD;
    }

    function getMonday(d) {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.getFullYear(), d.getMonth(), diff);
    }

    // ===== CALENDAR =====
    function renderCalendar() {
        calTitle.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;

        const firstDay = new Date(calYear, calMonth, 1);
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

        // Monday = 0, Sunday = 6
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        const todayS = todayStr();

        let html = '';

        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
            html += '<div class="cal-day empty"></div>';
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = makeDateStr(calYear, calMonth, day);
            const assignment = dayAssignments[dateStr];
            const driver = assignment ? assignment.driver : null;
            const time = assignment ? assignment.time : '';
            const classes = ['cal-day'];

            if (dateStr === todayS) classes.push('today');

            if (driver === DRIVERS.TOBIAS) classes.push('tobias-day');
            else if (driver === DRIVERS.DANIEL) classes.push('daniel-day');

            // Check if a swap happened this day (from history)
            const hadSwap = swapHistory.some(s => s.date === dateStr);
            if (hadSwap) classes.push('swap-marker');

            // Driver short name
            let driverLabel = '';
            if (driver) {
                driverLabel = `<span class="cal-day-driver">${driver === DRIVERS.TOBIAS ? 'Tobi' : 'Dani'}</span>`;
            }

            // Time label
            let timeLabel = '';
            if (time) {
                timeLabel = `<span class="cal-day-time">🕐 ${time}</span>`;
            }

            html += `<div class="${classes.join(' ')}" data-date="${dateStr}">
                <span class="cal-day-number">${day}</span>
                ${driverLabel}
                ${timeLabel}
            </div>`;
        }

        // Fill remaining cells to complete the grid row
        const totalCells = startDay + daysInMonth;
        const remainder = totalCells % 7;
        if (remainder > 0) {
            for (let i = 0; i < (7 - remainder); i++) {
                html += '<div class="cal-day empty"></div>';
            }
        }

        calendarGrid.innerHTML = html;

        // Click listeners on day cells
        calendarGrid.querySelectorAll('.cal-day:not(.empty)').forEach(el => {
            el.addEventListener('click', () => {
                openModal(el.dataset.date);
            });
        });
    }

    // ===== MODAL =====
    function openModal(dateStr) {
        modalCurrentDate = dateStr;
        modalDate.textContent = formatDateLong(dateStr);

        const assignment = dayAssignments[dateStr];

        // Reset selection
        modalBtnTobias.classList.remove('selected');
        modalBtnDaniel.classList.remove('selected');
        modalSelectedDriver = null;
        modalSwapTime.value = '';

        if (assignment) {
            selectModalDriver(assignment.driver);
            modalSwapTime.value = assignment.time || '';
        }

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        modalCurrentDate = null;
        modalSelectedDriver = null;
    }

    function selectModalDriver(driver) {
        modalSelectedDriver = driver;
        modalBtnTobias.classList.toggle('selected', driver === DRIVERS.TOBIAS);
        modalBtnDaniel.classList.toggle('selected', driver === DRIVERS.DANIEL);
    }

    function saveModal() {
        if (!modalCurrentDate || !modalSelectedDriver) return;

        const time = modalSwapTime.value || '';

        dayAssignments[modalCurrentDate] = {
            driver: modalSelectedDriver,
            time: time
        };
        save(STORAGE_KEYS.dayAssignments, dayAssignments);

        // If this is today, also update currentDriver
        if (modalCurrentDate === todayStr()) {
            const prevDriver = currentDriver;
            currentDriver = modalSelectedDriver;
            lastSwapDate = todayStr();
            save(STORAGE_KEYS.currentDriver, currentDriver);
            save(STORAGE_KEYS.lastSwapDate, lastSwapDate);

            // Log swap if driver changed
            if (prevDriver !== currentDriver) {
                const entry = {
                    id: Date.now(),
                    from: prevDriver,
                    to: currentDriver,
                    timestamp: new Date().toISOString(),
                    date: todayStr(),
                    time: time
                };
                swapHistory.unshift(entry);
                if (swapHistory.length > 50) swapHistory.pop();
                save(STORAGE_KEYS.swapHistory, swapHistory);
            }

            updateDriverDisplay();
        }

        updateStats();
        renderCalendar();
        renderHistory();
        closeModal();
    }

    function clearModalEntry() {
        if (!modalCurrentDate) return;

        delete dayAssignments[modalCurrentDate];
        save(STORAGE_KEYS.dayAssignments, dayAssignments);

        updateStats();
        renderCalendar();
        closeModal();
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
            const timeInfo = entry.time ? ` um ${entry.time} Uhr` : '';

            html += `
                <div class="history-item" data-id="${entry.id}">
                    <span class="history-swap-icon">🔄</span>
                    <div class="history-info">
                        <div class="history-text">
                            <span class="${fromClass}">${entry.from}</span> → <span class="${toClass}">${entry.to}</span>${timeInfo}
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
