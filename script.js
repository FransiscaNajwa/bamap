document.addEventListener('DOMContentLoaded', () => {
    const KD_MARKERS = Array.from({ length: (650 - 330) / 10 + 1 }, (_, i) => 330 + i * 10);
    const HOUR_WIDTH = 25;
    const KD_HEIGHT_UNIT = 40;
    const KD_MIN = Math.min(...KD_MARKERS);
    const PENDING_FORM_KEY = 'pendingShipForm';

    let shipSchedules = [];

async function fetchShipsFromDB() {
    try {
        console.log('Fetching all schedules from database...');
        const response = await fetch('get_all_data.php');
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data fetched from backend:', data);
        
        // Update shipSchedules dari backend
        if (data && data.shipSchedules) {
            shipSchedules = data.shipSchedules;
            console.log('Updated shipSchedules:', shipSchedules);
            localStorage.setItem('shipSchedules', JSON.stringify(shipSchedules));
        } else {
            console.error('No shipSchedules found in the response');
        }
        
        // Update maintenanceSchedules dari backend
        if (data && data.maintenanceSchedules) {
            maintenanceSchedules = data.maintenanceSchedules;
            console.log('Updated maintenanceSchedules:', maintenanceSchedules);
            localStorage.setItem('maintenanceSchedules', JSON.stringify(maintenanceSchedules));
        } else {
            console.warn('No maintenanceSchedules found in the response');
        }
        
        // Update restSchedules dari backend
        if (data && data.restSchedules) {
            restSchedules = data.restSchedules;
            console.log('Updated restSchedules:', restSchedules);
            localStorage.setItem('restSchedules', JSON.stringify(restSchedules));
        } else {
            console.warn('No restSchedules found in the response');
        }
        
        // Render semua schedule setelah data berhasil di-fetch
        renderShips();
        renderMaintenance();
        renderRestSchedules();
    } catch (error) {
        console.error('Error fetching schedules from database:', error);
    }
}
// fetchShipsFromDB akan dipanggil di initialize() setelah grid siap

async function fetchQCCNames() {
    try {
        console.log('Fetching QCC names from database...');
        const response = await fetch('get_qcc_names.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('QCC names fetched:', data);

        const qccContainer = document.getElementById('qcc-names-checkboxes');
        qccContainer.innerHTML = '';

        data.forEach(qcc => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `qcc-${qcc.id}`;
            checkbox.value = qcc.name;

            const label = document.createElement('label');
            label.htmlFor = `qcc-${qcc.id}`;
            label.textContent = qcc.name;

            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);

            qccContainer.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching QCC names:', error);
    }
}
// fetchQCCNames akan dipanggil di initialize()

    let editingShipIndex = null;
    let currentStartDate = getStartOfWeek(new Date());

    let maintenanceSchedules = [];
    let editingMaintenanceIndex = null;

    let restSchedules = [];
    let editingRestIndex = null;

    let draggableLineLeft = JSON.parse(localStorage.getItem('draggableLinePosition')) || 200; 

    const ccLineColors = {
        'CC01': '#d14c62ff', 
        'CC02': '#0000FF', 
        'CC03': '#17A2B8', 
        'CC04': '#b5a02aff'  
    };

    const grid = document.getElementById('grid');
    const yAxis = document.querySelector('.y-axis');
    const xAxis = document.querySelector('.x-axis');
    const hourAxis = document.getElementById('hour-axis');
    const modal = document.getElementById('ship-modal');
    const addShipBtn = document.getElementById('add-ship-btn');
    const closeModalBtn = modal.querySelector('.close-btn');
    const shipForm = document.getElementById('ship-form');
    const modalTitle = document.getElementById('modal-title');
    const formSubmitBtn = shipForm.querySelector('button[type="submit"]');
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    
    const weekDatePicker = document.getElementById('week-date-picker');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const berthLabelsContainer = document.querySelector('.berth-labels-container');
    const berthMapContainer = document.getElementById('berth-map-container');

    const addMaintenanceBtn = document.getElementById('add-maintenance-btn');
    const maintenanceModal = document.getElementById('maintenance-modal');
    const maintenanceCloseBtn = maintenanceModal.querySelector('.close-btn');
    const maintenanceForm = document.getElementById('maintenance-form');
    const maintenanceModalTitle = document.getElementById('maintenance-modal-title');
    const maintenanceSubmitBtn = maintenanceForm.querySelector('button[type="submit"]');

    const addRestBtn = document.getElementById('add-rest-btn');
    const restModal = document.getElementById('rest-modal');
    const restCloseBtn = restModal.querySelector('.close-btn');
    const restForm = document.getElementById('rest-form');
    const restModalTitle = document.getElementById('rest-modal-title');
    const restSubmitBtn = restForm.querySelector('button[type="submit"]');

    const deleteShipBtn = document.getElementById('delete-ship-btn');
    const deleteMaintenanceBtn = document.getElementById('delete-maintenance-btn');
    const deleteRestBtn = document.getElementById('delete-rest-btn');

    const berthDividerLine = document.getElementById('berth-divider-line');
    const currentTimeIndicator = document.getElementById('current-time-indicator');


    function renderShips() {
        grid.querySelectorAll('.ship-wrapper').forEach(el => el.remove());

        const weekStart = new Date(currentStartDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const statusColors = {
            'VESSEL ALONGSIDE': '#00c853',
            'VESSEL ON PLOTTING': '#ffff00',
            'VESSEL ON PLANNING': '#bfbfbf',
            'VESSEL DEPART': '#9c27b0'
        };

        const visibleShips = shipSchedules.filter(ship => {
            if (!ship.startTime || !ship.endTime) {
                return false;
            }
            const shipStart = new Date(ship.startTime);
            const shipEnd = new Date(ship.endTime);
            return shipStart < weekEnd && shipEnd > weekStart;
        });

        visibleShips.forEach(ship => {
            const shipWrapper = document.createElement('div');
            shipWrapper.className = 'ship-wrapper';
            const shipIndex = shipSchedules.findIndex(item => String(item.id) === String(ship.id));
            shipWrapper.addEventListener('dblclick', () => editShip(shipIndex >= 0 ? shipIndex : shipSchedules.indexOf(ship)));

            const companyKey = (ship.company || '').toString().trim().toUpperCase();
            const logoMap = {
                'SPIL': 'asset/SPIL.png',
                'TANTO': 'asset/TANTO.png',
                'MRTS': 'asset/MRTS.png',
                'PPNP': 'asset/PPNP.png',
                'SMDR': 'asset/SMDR.png',
                'CTP': 'asset/CTP.png'
            };
            const logoSrc = logoMap[companyKey] || '';

            const eta = (ship.etaTime && !isNaN(new Date(ship.etaTime))) ? new Date(ship.etaTime) : new Date(ship.startTime);
            const etb = new Date(ship.startTime);
            const etc = ship.etcTime ? new Date(ship.etcTime) : null;
            const etd = new Date(ship.endTime);

            const getHoursSinceWeekStart = (date) => (date.getTime() - weekStart.getTime()) / (1000 * 60 * 60);
            const startHours = Math.max(0, getHoursSinceWeekStart(eta));
            const endHours = Math.min(7 * 24, getHoursSinceWeekStart(etd));

            const left = startHours * HOUR_WIDTH;
            const width = Math.max((endHours - startHours) * HOUR_WIDTH, HOUR_WIDTH / 2);

            const kdUnitPx = KD_HEIGHT_UNIT / (KD_MARKERS[1] - KD_MARKERS[0]);
            const startKd = parseFloat(ship.minKd) || parseFloat(ship.nKd) || KD_MIN;
            const endKd = parseFloat(ship.nKd) || startKd + (KD_MARKERS[1] - KD_MARKERS[0]);
            const kdTop = Math.min(startKd, endKd);
            const kdBottom = Math.max(startKd, endKd);
            const top = (kdTop - KD_MIN) * kdUnitPx;
            const height = Math.max((kdBottom - kdTop) * kdUnitPx, KD_HEIGHT_UNIT / 2);

            shipWrapper.style.left = `${left}px`;
            shipWrapper.style.top = `${Math.max(0, top)}px`;
            shipWrapper.style.width = `${width}px`;
            shipWrapper.style.height = `${height}px`;

            const shipContent = document.createElement('div');
            shipContent.className = 'ship-content';

            const statusColor = statusColors[ship.status] || '#00c853';
            shipContent.style.borderColor = statusColor;

            const shipHeader = document.createElement('div');
            shipHeader.className = 'ship-header';
            shipHeader.style.backgroundColor = '#ffffff';

            const headerText = document.createElement('div');
            headerText.className = 'ship-header-text';
            headerText.innerHTML = `
                <span class="ship-main-title">${ship.shipName || '-'}</span>
                <span class="ship-sub-title">${ship.code || '-'} / ${ship.company || '-'}</span>
            `;

            shipHeader.appendChild(headerText);

            if (logoSrc) {
                const logo = document.createElement('img');
                logo.className = 'ship-logo';
                logo.src = logoSrc;
                logo.alt = `${companyKey} logo`;
                shipHeader.appendChild(logo);
            }

            const shipBody = document.createElement('div');
            shipBody.className = 'ship-body';
            const nextPort = ship.nextPort || ship.destPort || '-';
            const timeLine = `${formatDateTime(ship.etaTime)} / ${formatDateTime(ship.startTime)} / ${formatDateTime(ship.etcTime)} / ${formatDateTime(ship.endTime)}`;
            const qccList = (ship.qccName || '')
                .toString()
                .split(/[,\s]+/)
                .map(q => q.trim())
                .filter(Boolean);
            const qccHtml = qccList
                .map(q => {
                    const key = q.replace(/\s+/g, '').toUpperCase();
                    return `
                        <div class="ship-qcc-item">
                            <div class="ship-qcc-text">${key}</div>
                            <div class="ship-qcc-line ${key.toLowerCase()}"></div>
                        </div>
                    `;
                })
                .join('');

            shipBody.innerHTML = `
                ${ship.length || '-'}m / ${ship.draft || '-'} / ${ship.destPort || '-'} / ${nextPort}<br>
                ${ship.berthSide || '-'} / ${ship.minKd || '-'} / ${ship.nKd || '-'} / ${ship.mean || '-'}<br>
                ${timeLine}<br>
                D ${ship.dischargeValue || '-'} / L ${ship.loadValue || '-'}
                ${qccHtml ? `<br><div class="ship-qcc-list">${qccHtml}</div>` : ''}
            `;

            const shipFooter = document.createElement('div');
            shipFooter.className = 'ship-footer';
            shipFooter.innerHTML = `
                <span class="footer-left">${ship.status || 'VESSEL'}</span>
                <span class="footer-right">BSH: ${ship.bsh || '-'} / ${ship.berthSide || '-'}</span>
            `;

            shipContent.appendChild(shipHeader);
            shipContent.appendChild(shipBody);
            shipContent.appendChild(shipFooter);
            shipWrapper.appendChild(shipContent);

            grid.appendChild(shipWrapper);
        });
    }

    function renderMaintenance() {
        grid.querySelectorAll('.maintenance-block, .no-vessel-block').forEach(el => el.remove());
        
        const weekStart = new Date(currentStartDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const MAX_GRID_WIDTH = 7 * 24 * HOUR_WIDTH; 

        const visibleMaintenance = maintenanceSchedules.filter(item => {
            if (!item.startTime || !item.endTime) {
                console.warn('Invalid maintenance data:', item);
                return false;
            }
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);
            return startTime < weekEnd && endTime > weekStart;
        });

        visibleMaintenance.forEach((item, index) => {
            const itemIndex = maintenanceSchedules.indexOf(item);
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);
            const getHoursSinceWeekStart = (date) => (date.getTime() - weekStart.getTime()) / (1000 * 60 * 60);

            let rawLeft = getHoursSinceWeekStart(startTime) * HOUR_WIDTH;
            let rawWidth = ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)) * HOUR_WIDTH;
            
            let finalLeft = Math.max(0, rawLeft);
            let rightEdge = Math.min(MAX_GRID_WIDTH, rawLeft + rawWidth);
            let finalWidth = rightEdge - finalLeft;

            if (finalWidth <= 0) return;

            const kdUnitPx = KD_HEIGHT_UNIT / (KD_MARKERS[1] - KD_MARKERS[0]);
            const top = (item.startKd - KD_MIN) * kdUnitPx;
            const maintenanceLength = Math.max((item.endKd - item.startKd), 10); 
            const height = Math.max(maintenanceLength * kdUnitPx, KD_HEIGHT_UNIT / 2); 
            const finalTop = Math.max(top, 0);

            const block = document.createElement('div');
            block.className = (item.type === 'no-vessel') ? 'no-vessel-block' : 'maintenance-block';
            block.style.top = `${finalTop}px`;
            block.style.left = `${finalLeft}px`;
            block.style.width = `${finalWidth}px`;
            block.style.height = `${height}px`;
            
            if (item.type === 'no-vessel') {
                block.innerHTML = `<span>No Vessel<br>Free for Maintenance</span>`; 
                block.title = `Area Kosong: ${item.keterangan}`;
            } else {
                block.textContent = item.keterangan;
                block.title = `Maintenance: ${item.keterangan}`;
            }
            block.addEventListener('dblclick', () => editMaintenance(itemIndex));
            grid.appendChild(block);
        });
    }

    
    function renderRestSchedules() {
        grid.querySelectorAll('.rest-block').forEach(el => el.remove());

        const weekStart = new Date(currentStartDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const MAX_GRID_WIDTH = 7 * 24 * HOUR_WIDTH; // Limit Grid

        const visibleRestTimes = restSchedules.filter(item => {
             if (!item.startTime || !item.endTime) {
                console.warn('Invalid rest schedule data:', item);
                return false;
            }
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);
            return startTime < weekEnd && endTime > weekStart;
        });
        visibleRestTimes.forEach(item => {
            const itemIndex = restSchedules.indexOf(item);
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);
            const getHoursSinceWeekStart = (date) => (date.getTime() - weekStart.getTime()) / (1000 * 60 * 60);
            
            let rawLeft = getHoursSinceWeekStart(startTime) * HOUR_WIDTH;
            let rawWidth = ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)) * HOUR_WIDTH;

            let finalLeft = Math.max(0, rawLeft);
            let rightEdge = Math.min(MAX_GRID_WIDTH, rawLeft + rawWidth);
            let finalWidth = rightEdge - finalLeft;

            if (finalWidth <= 0) return;

            const block = document.createElement('div');
            block.className = 'rest-block';
            block.style.top = '0px';
            block.style.height = grid.style.height; 
            block.style.left = `${finalLeft}px`;
            block.style.width = `${finalWidth}px`;
            block.textContent = item.keterangan || 'BREAK';
            block.title = `${item.keterangan} (Double click untuk mengedit)`;
            block.addEventListener('dblclick', () => editRestTime(itemIndex));
            grid.appendChild(block);
        });
    }
 
    function createDraggableCCLines() {
        const ccNames = ['CC04', 'CC03', 'CC02', 'CC01'];
        let initialTopPosition = 50; 

        ccNames.forEach(name => {
            const line = document.createElement('div');
            line.className = 'draggable-cc-line';
            line.id = `cc-line-${name}`;
            line.style.top = `${initialTopPosition}px`;
            
            line.style.borderTopColor = ccLineColors[name];

            grid.appendChild(line);
            
            initialTopPosition += 30; 
        });
    }
 

    function saveCommLog() {
        const table = document.getElementById('comm-log-table');
        const rows = table.querySelectorAll('tbody tr');
        const data = [];

        rows.forEach(row => {
            const rowData = {
                shipName: row.querySelector('.ship-name').textContent,
                company: row.querySelector('.company-name').textContent,
                code: row.querySelector('.ship-code').textContent,
                length: row.querySelector('.ship-length').textContent,
                draft: row.querySelector('.ship-draft').textContent,
                destPort: row.querySelector('.dest-port').textContent,
                berthLocation: row.querySelector('.berth-location').textContent,
                nKd: row.querySelector('.n-kd').textContent,
                minKd: row.querySelector('.min-kd').textContent,
                loadValue: row.querySelector('.load-value').textContent,
                dischargeValue: row.querySelector('.discharge-value').textContent,
                etaTime: row.querySelector('.eta-time').textContent,
                startTime: row.querySelector('.start-time').textContent,
                etcTime: row.querySelector('.etc-time').textContent,
                endTime: row.querySelector('.end-time').textContent,
                status: row.querySelector('.status').textContent,
                berthSide: row.querySelector('.berth-side').textContent,
                bsh: row.querySelector('.bsh').textContent,
                qccName: row.querySelector('.qcc-name').textContent,
                mean: row.querySelector('.mean').textContent,
            };
            data.push(rowData);
        });

        // Tambahkan log untuk memeriksa data yang dikirim ke backend
        console.log('Data yang dikirim ke backend:', data[0]);

        // Pastikan semua field memiliki nilai default
        data[0] = {
            ...data[0],
            shipName: data[0].shipName || '',
            company: data[0].company || '',
            code: data[0].code || '',
            length: data[0].length || 0,
            draft: data[0].draft || 0,
            destPort: data[0].destPort || '',
            berthLocation: data[0].berthLocation || null,
            nKd: data[0].nKd || 0,
            minKd: data[0].minKd || 0,
            loadValue: data[0].loadValue || 0,
            dischargeValue: data[0].dischargeValue || 0,
            etaTime: data[0].etaTime || null,
            startTime: data[0].startTime || null,
            etcTime: data[0].etcTime || null,
            endTime: data[0].endTime || null,
            status: data[0].status || '',
            berthSide: data[0].berthSide || '',
            bsh: data[0].bsh || null,
            qccName: data[0].qccName || ''
        };

        fetch('save_ship.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data[0]) // Kirim data ke PHP
        })
        .then(res => res.json())
        .then(result => {
            console.log('Response from save_ship.php:', result);
            if (result.status === 'success') {
                alert('Data berhasil disimpan!');
                fetchShipsFromDB(); // Refresh the data
            } else {
                alert('Gagal menyimpan data: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error saat menyimpan data:', error);
            alert('Terjadi kesalahan saat menyimpan data.');
        });
    }

    function loadCommLog() {
        const data = JSON.parse(localStorage.getItem('communicationLogData'));
        if (!data) return;

        const table = document.getElementById('comm-log-table');
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach((row, index) => {
            if (!data[index]) return;

            const cells = row.querySelectorAll('td[contenteditable="true"]');
            if (cells.length === 6) {
                cells[0].textContent = data[index].dateTime;
                cells[1].textContent = data[index].petugas;
                cells[2].textContent = data[index].stakeholder;
                cells[3].textContent = data[index].pic;
                cells[4].textContent = data[index].remark;
                cells[5].textContent = data[index].commChannel;
            }
        });
    }

     function savePendingForm() {
         if (editingShipIndex === null) {
             const formData = new FormData(shipForm);
             const data = Object.fromEntries(formData.entries());
             sessionStorage.setItem(PENDING_FORM_KEY, JSON.stringify(data));
         }
    }
    function loadPendingForm() {
        const data = JSON.parse(sessionStorage.getItem(PENDING_FORM_KEY));
        if (data) {
            for (const key in data) {
                if (shipForm.elements[key]) {
                    shipForm.elements[key].value = data[key];
                }
            }
        }
    }
    function clearPendingForm() {
        sessionStorage.removeItem(PENDING_FORM_KEY);
        shipForm.reset();
    }

    function getStartOfWeek(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    function formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    function formatDateTime(date) {
        if (!date || isNaN(new Date(date))) return '-';
        const d = new Date(date);
        const day = d.getDate().toString();
        const hour = d.getHours().toString().padStart(2, '0');
        const minute = d.getMinutes().toString().padStart(2, '0');
        const timeString = hour + minute;
        return `${day} / ${timeString}`;
    }
    function formatForInput(date) {
        if (!date) return '';
        try {
            const d = new Date(date);
            if (isNaN(d)) return '';
            const pad = (num) => num.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch (e) {
            console.error("Error formatting date for input:", date, e);
            return '';
        }
    }
    function formatDateForPDF(d) {
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    }

    function formatDateForDateInput(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d)) return '';
        const pad = (num) => num.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }


    function initialize() {
        updateDisplay(); 
        setupEventListeners();
        loadCommLog();
    }// Buat grid terlebih dahulu
        setupEventListeners();
        loadCommLog();
        // Fetch data dari database SETELAH grid sudah siap
        fetchShipsFromDB();
        fetchQCCNamesid() {
        yAxis.innerHTML = ''; xAxis.innerHTML = ''; hourAxis.innerHTML = ''; berthLabelsContainer.innerHTML = '';
        grid.innerHTML = ''; 
        const gridContainer = grid.parentElement; 

        const oldSeparator = berthMapContainer.querySelector('.berth-separator');
        if (oldSeparator) oldSeparator.remove();

        const totalHours = 24 * 7; 
        const totalGridWidth = totalHours * HOUR_WIDTH; 
        const totalKdSteps = KD_MARKERS.length; 

        
        grid.style.position = 'relative'; 
        grid.style.height = `${(totalKdSteps) * KD_HEIGHT_UNIT}px`;
        grid.style.width = `${totalGridWidth}px`; 
    

        for (let row = 0; row < totalKdSteps; row++) {
            for (let col = 0; col < totalHours; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.style.position = 'absolute';
                cell.style.left = `${col * HOUR_WIDTH}px`;
                cell.style.top = `${row * KD_HEIGHT_UNIT}px`;
                cell.style.width = `${HOUR_WIDTH}px`;
                cell.style.height = `${KD_HEIGHT_UNIT}px`;
                cell.style.zIndex = '0';
                grid.appendChild(cell);
            }
        }

        const divider = document.createElement('div');
        divider.id = 'berth-divider-line';
        grid.appendChild(divider);

        const timeIndicator = document.createElement('div');
        timeIndicator.id = 'current-time-indicator';
        grid.appendChild(timeIndicator);

        // createDraggableCCLines();

        const kdUnitPx = KD_HEIGHT_UNIT; 
        KD_MARKERS.forEach(kd => {
            const label = document.createElement('div');
            label.className = 'kd-label';
            if (kd === 490) label.classList.add('bold');
            label.textContent = kd;
            label.style.height = `${kdUnitPx}px`;
            yAxis.appendChild(label);
        });

 
        const berths = [
            { name: 'BERTH 2', startKd: 330, endKd: 490, ccs: ['CC04', 'CC03'] },
            { name: 'BERTH 1', startKd: 490, endKd: 650, ccs: ['CC02', 'CC01'] }
        ];

      
        const ccColors = {
            'CC01': '#d14c62ff', 
            'CC02': '#0000FF', 
            'CC03': '#17A2B8', 
            'CC04': '#b5a02aff'  
        };
      

        berths.forEach(berth => {
            const berthLabelContainer = document.createElement('div');
            berthLabelContainer.className = 'berth-label-container';

            const innerLabelWrapper = document.createElement('div');
            innerLabelWrapper.className = 'berth-label'; 

        
            const kdStepHeight = KD_HEIGHT_UNIT / (KD_MARKERS[1] - KD_MARKERS[0]); 
            const top = (berth.startKd - KD_MIN) * kdStepHeight;
            const height = (berth.endKd - berth.startKd) * kdStepHeight;
            berthLabelContainer.style.top = `${top}px`;
            berthLabelContainer.style.height = `${height}px`;

        
            innerLabelWrapper.style.display = 'flex';
            innerLabelWrapper.style.flexDirection = 'row'; 
            innerLabelWrapper.style.width = `${height}px`; 
            innerLabelWrapper.style.justifyContent = 'space-evenly'; 
            innerLabelWrapper.style.alignItems = 'center'; 
            innerLabelWrapper.style.paddingLeft = '0';
            innerLabelWrapper.style.paddingRight = '0';

            
            const ccEl_Top = document.createElement('div');
            const ccTopName = berth.ccs[1]; 
            ccEl_Top.textContent = ccTopName; 
            ccEl_Top.style.fontSize = '0.9em';
       
            ccEl_Top.style.color = ccColors[ccTopName] || 'red'; 
            innerLabelWrapper.appendChild(ccEl_Top);


            const nameEl = document.createElement('div');
            nameEl.textContent = berth.name;
            nameEl.style.fontWeight = 'bold';
            nameEl.style.fontSize = '1.1em';
            innerLabelWrapper.appendChild(nameEl);

            const ccEl_Bottom = document.createElement('div');
            const ccBottomName = berth.ccs[0]; 
            ccEl_Bottom.textContent = ccBottomName; 
            ccEl_Bottom.style.fontSize = '0.9em';
            ccEl_Bottom.style.color = ccColors[ccBottomName] || 'red'; 
            innerLabelWrapper.appendChild(ccEl_Bottom);

            berthLabelContainer.appendChild(innerLabelWrapper);
            berthLabelsContainer.appendChild(berthLabelContainer);
        });


        gridContainer.style.width = `${totalGridWidth}px`; 
        xAxis.style.width = `${totalGridWidth}px`; 

        const currentDay = new Date(currentStartDate);
        for (let i = 0; i < 7; i++) {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'day-label';
            dayLabel.textContent = currentDay.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long' });
            dayLabel.style.width = `${24 * HOUR_WIDTH}px`;
            xAxis.appendChild(dayLabel);

            for (let h = 0; h < 24; h += 2) { 
                const hourLabel = document.createElement('div');
                hourLabel.className = 'hour-label';
                hourLabel.textContent = h.toString().padStart(2, '0');
                hourLabel.style.width = `${2 * HOUR_WIDTH}px`; 
                hourAxis.appendChild(hourLabel);
            }
            currentDay.setDate(currentDay.getDate() + 1);
        }

        updateBerthDividerPosition();
        const lineElement = document.getElementById('current-time-indicator');
        if (lineElement) {
             lineElement.style.left = `${draggableLineLeft}px`;
             makeLineDraggable(lineElement);
        } else {
            console.error("Element #current-time-indicator not found after grid creation");
        }
    }

    function updateBerthDividerPosition() {
        const divider = document.getElementById('berth-divider-line');
        if (divider) {
             const kdStepHeight = KD_HEIGHT_UNIT / (KD_MARKERS[1] - KD_MARKERS[0]); 
             const topPosition = (490 - KD_MIN) * kdStepHeight;
             divider.style.top = `${topPosition - 1}px`; 
        }
    }

    function updateCurrentTimeIndicator() {
         console.log("updateCurrentTimeIndicator called, but logic is disabled for manual dragging.");
    }

    function makeLineDraggable(line) {
        if (!line) {
            console.error("makeLineDraggable called with null element");
            return;
        }
        let isDragging = false;
        let initialX;
        let initialLeft;

        line.removeEventListener('mousedown', onMouseDown);

        function onMouseDown(e) {
             e.preventDefault();
             isDragging = true;
             initialX = e.clientX;
             initialLeft = line.offsetLeft;
             document.addEventListener('mousemove', onDrag);
             document.addEventListener('mouseup', onDragEnd);
             console.log("Draggable line: Mouse Down");
        }

        function onDrag(e) {
            if (!isDragging) return;
            e.preventDefault();

            const dx = e.clientX - initialX;
            let newLeft = initialLeft + dx;

            const gridWidth = grid.scrollWidth;
            newLeft = Math.max(0, Math.min(newLeft, gridWidth - line.offsetWidth));

            draggableLineLeft = newLeft; 
            line.style.left = `${newLeft}px`; 
        }

        function onDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', onDragEnd);
            localStorage.setItem('draggableLinePosition', JSON.stringify(draggableLineLeft));
            console.log("Draggable line: Mouse Up, Position saved:", draggableLineLeft);
        }

        line.addEventListener('mousedown', onMouseDown);

    }

    function updateDisplay() {
        weekDatePicker.value = formatDateForDateInput(currentStartDate);

        drawGrid(); 
        renderRestSchedules();
        renderMaintenance();
        renderShips();
    }

    function fillFormForEdit(ship) {
        const companySelect = document.getElementById('ship-company');
        const companyValue = ship.company || '';
        const hasCompanyOption = Array.from(companySelect.options).some(opt => opt.value === companyValue);
        if (companyValue && !hasCompanyOption) {
            const newOption = document.createElement('option');
            newOption.value = companyValue;
            newOption.textContent = companyValue;
            companySelect.appendChild(newOption);
        }
        companySelect.value = companyValue;
        document.getElementById('ship-name').value = ship.shipName;
        document.getElementById('ship-code').value = ship.code;
        document.getElementById('ship-length').value = ship.length;
        document.getElementById('ship-draft').value = ship.draft;
        document.getElementById('dest-port').value = ship.destPort || '';
        document.getElementById('berth-location').value = ship.berthLocation || ship.minKd || '';
        document.getElementById('n-kd').value = ship.nKd || '';
        document.getElementById('min-kd').value = ship.minKd || '';
        document.getElementById('load-value').value = ship.loadValue || 0;
        document.getElementById('discharge-value').value = ship.dischargeValue || 0;
        document.getElementById('eta-time').value = formatForInput(ship.etaTime);
        document.getElementById('start-time').value = formatForInput(ship.startTime);
        document.getElementById('etc-time').value = formatForInput(ship.etcTime);
        document.getElementById('end-time').value = formatForInput(ship.endTime);
        document.getElementById('ship-status').value = ship.status || 'VESSEL ALONGSIDE';
        document.getElementById('ship-berth-side').value = ship.berthSide || 'P';
        document.getElementById('ship-bsh').value = ship.bsh || '';
        document.querySelectorAll('#qcc-checkbox-group input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
});

const savedQCCs = ship.qccName || ''; 
if (savedQCCs) {
    const qccArray = savedQCCs.split(/\s*[,&]\s*|\s+&\s+/);
    qccArray.forEach(qccValue => {
        const checkbox = document.querySelector(`#qcc-checkbox-group input[value="${qccValue}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}
}
    function editShip(index) {
        editingShipIndex = index;
        fillFormForEdit(shipSchedules[index]);
        modalTitle.textContent = 'Edit Jadwal Kapal';
        formSubmitBtn.textContent = 'Update Jadwal';
        shipForm.classList.add('edit-mode');
        deleteShipBtn.onclick = () => {
            if (confirm('Anda yakin ingin menghapus jadwal kapal ini?')) {
                const shipId = shipSchedules[editingShipIndex].id; // Ambil ID asli DB
fetch(`delete_data.php?type=ship&id=${shipId}`)
.then(() => {
    fetchShipsFromDB(); // Refresh tampilan
    modal.style.display = 'none';
});
                updateDisplay();
                modal.style.display = 'none';
                shipForm.classList.remove('edit-mode');
            }
        };
        modal.style.display = 'block';
    }
    function editMaintenance(index) {
        editingMaintenanceIndex = index;
        const item = maintenanceSchedules[index];
        if (maintenanceForm.elements['maintenance-type']) {
            maintenanceForm.elements['maintenance-type'].value = item.type || 'maintenance'; 
        }
        maintenanceForm.elements['startKd'].value = item.startKd;
        maintenanceForm.elements['endKd'].value = item.endKd;
        maintenanceForm.elements['startTime'].value = formatForInput(item.startTime);
        maintenanceForm.elements['endTime'].value = formatForInput(item.endTime);
        maintenanceForm.elements['keterangan'].value = item.keterangan;
        maintenanceModalTitle.textContent = 'Edit Maintenance';
        maintenanceSubmitBtn.textContent = 'Update';
        maintenanceForm.classList.add('edit-mode');
        deleteMaintenanceBtn.onclick = () => {
            if (confirm('Anda yakin ingin menghapus data maintenance ini?')) {
                maintenanceSchedules.splice(editingMaintenanceIndex, 1);
                localStorage.setItem('maintenanceSchedules', JSON.stringify(maintenanceSchedules));
                updateDisplay();
                maintenanceModal.style.display = 'none';
                maintenanceForm.classList.remove('edit-mode');
            }
        };
        maintenanceModal.style.display = 'block';
    }
    function editRestTime(index) {
        editingRestIndex = index;
        const item = restSchedules[index];
        restForm.elements['startTime'].value = formatForInput(item.startTime);
        restForm.elements['endTime'].value = formatForInput(item.endTime);
        restForm.elements['keterangan'].value = item.keterangan;
        restModalTitle.textContent = 'Edit Waktu Istirahat';
        restSubmitBtn.textContent = 'Update';
        restForm.classList.add('edit-mode');
        deleteRestBtn.onclick = () => {
            if (confirm('Anda yakin ingin menghapus data istirahat ini?')) {
                const restId = restSchedules[editingRestIndex].id; // Ambil ID asli DB
                fetch(`delete_data.php?type=rest&id=${restId}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log('Respons dari backend:', data);
                        if (data.status === 'success') {
                            // Hapus data dari variabel lokal
                            restSchedules = restSchedules.filter(item => item.id !== restId);
                            console.log('Data berhasil dihapus dari variabel lokal:', restSchedules);

                            // Perbarui tampilan
                            updateDisplay();
                            restModal.style.display = 'none';
                        } else {
                            console.error('Gagal menghapus data:', data.message);
                            alert('Gagal menghapus data: ' + data.message);
                        }
                    })
                    .catch(error => console.error('Gagal menghapus data istirahat:', error));
                updateDisplay();
                restModal.style.display = 'none';
                restForm.classList.remove('edit-mode');
            }
        };
        restModal.style.display = 'block';
    }

    async function exportToPDF(type = 'weekly') {
        console.log(`[PDF Export] Starting export process for type: ${type}`);
        const { jsPDF } = window.jspdf;
        const pdfHeader = document.getElementById('pdf-header');
        const pelindoLogoInHeader = pdfHeader.querySelector('.pdf-logo');
        const mainHeader = document.querySelector('.main-header');
        const berthMapContainer = document.getElementById('berth-map-container');
        const legendsScrollContainer = document.querySelector('.legends-scroll-container');
        const currentTimeIndicatorPDF = document.getElementById('current-time-indicator'); 
        const berthDividerLinePDF = document.getElementById('berth-divider-line');
        const exportBtn = document.getElementById('export-pdf-btn');
        const pdfOptions = document.getElementById('pdf-options');
        const gridScroll = document.querySelector('.grid-scroll-container');
        const yAxisColumn = document.querySelector('.y-axis-column');
        const gridContainer = document.querySelector('.grid-container');
        const legendsWrapper = document.querySelector('.bottom-legends-wrapper');

        // --- VALIDASI LOGO ---
        if (!pelindoLogoInHeader) {
            console.error("[PDF Export] ERROR: Elemen logo Pelindo tidak ditemukan!");
            alert("Error: Elemen logo Pelindo tidak ditemukan.");
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
            return;
        }

        // --- UI UPDATE ---
        const originalBtnHTML = exportBtn.innerHTML;
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kompresi...'; // Feedback user
        pdfOptions.style.display = 'none';

        if (pelindoLogoInHeader) {
            pelindoLogoInHeader.crossOrigin = "anonymous";
        }

        mainHeader.classList.add('hide-for-pdf'); 
        
        // --- TEXT HACK (REST BLOCKS) ---
        const restBlocks = document.querySelectorAll('.rest-block');
        const originalRestBlockHTML = []; 
        restBlocks.forEach(block => {
            originalRestBlockHTML.push(block.innerHTML); 
            const text = block.textContent.trim();
            if (text) {
                const stackedText = text.split('').join('<br>'); 
                block.innerHTML = stackedText;
                block.classList.add('pdf-vertical-text-hack'); 
            }
        });

        // --- SIMPAN STATE ASLI ---
        const oldHeaderWidth = pdfHeader.style.width;
        const oldMapWidth = berthMapContainer.style.width;
        const oldLegendsWidth = legendsScrollContainer.style.width;
        const oldGridScrollOverflow = gridScroll.style.overflowX;
        const oldGridScrollLeft = gridScroll.scrollLeft;
        const oldLegendsScrollLeft = legendsScrollContainer.scrollLeft;
        const oldTimeIndicatorDisplay = currentTimeIndicatorPDF ? currentTimeIndicatorPDF.style.display : 'none';
        const oldDividerDisplay = berthDividerLinePDF ? berthDividerLinePDF.style.display : 'block';

        const oldYAxisPosition = yAxisColumn ? yAxisColumn.style.position : '';
        const oldYAxisLeft = yAxisColumn ? yAxisColumn.style.left : '';
        const oldYAxisZIndex = yAxisColumn ? yAxisColumn.style.zIndex : '';

        let targetScrollLeft = 0;

        try {
            let pdfFileName, pdfDateRangeStr;
            let captureWidth;
            let captureStartX = 0;

            const mapFullWidth = gridContainer.scrollWidth + (yAxisColumn ? yAxisColumn.offsetWidth : 0);
            const legendsFullWidth = legendsWrapper.scrollWidth;
            const fullWidth = Math.max(mapFullWidth, legendsFullWidth);

            const hourWidth = HOUR_WIDTH;
            const dayWidth = 24 * hourWidth;
            const yAxisWidth = yAxisColumn ? yAxisColumn.offsetWidth : 0;

            // --- LOGIKA DAILY VS WEEKLY ---
            if (type === 'daily') {
                let today = new Date(); today.setHours(0,0,0,0);
                let selectedDay = new Date(currentStartDate);
                let nextDay = new Date(selectedDay);
                nextDay.setDate(selectedDay.getDate() + 1);

                pdfDateRangeStr = `${formatDateForPDF(selectedDay)} to ${formatDateForPDF(nextDay)}`;
                pdfFileName = `Berth-Allocation-Harian-${selectedDay.toISOString().split('T')[0]}.pdf`;

                let dayDiff = 0; // Sesuaikan logic ini jika ingin pilih hari spesifik
                captureWidth = yAxisWidth + (2 * dayWidth); 
                targetScrollLeft = dayDiff * dayWidth; 
                captureStartX = targetScrollLeft; 

                gridScroll.style.overflowX = 'hidden';
                gridScroll.scrollLeft = targetScrollLeft;
                legendsScrollContainer.scrollLeft = 0;

            } else { 
                // WEEKLY
                let startDate = new Date(currentStartDate);
                let endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                pdfDateRangeStr = `${formatDate(startDate)} - ${formatDate(endDate)}`;

                pdfFileName = `Berth-Allocation-Mingguan-${startDate.toISOString().split('T')[0]}.pdf`;
                captureWidth = fullWidth;
                captureStartX = 0;
                targetScrollLeft = 0;
                
                gridScroll.style.overflowX = 'visible';
                gridScroll.scrollLeft = 0;
                legendsScrollContainer.scrollLeft = 0;
            }

            // --- SET LEBAR UNTUK CAPTURE ---
            pdfHeader.style.width = `${captureWidth}px`;
            berthMapContainer.style.width = `${captureWidth}px`;
            legendsScrollContainer.style.width = (type === 'daily' ? `${legendsFullWidth}px` : `${captureWidth}px`);
            
            const dateRangeEl = pdfHeader.querySelector('.pdf-date-range');
            if(dateRangeEl) dateRangeEl.textContent = pdfDateRangeStr;
            
            pdfHeader.style.display = 'flex'; 
            if(berthDividerLinePDF) berthDividerLinePDF.style.display = 'block';
            if(currentTimeIndicatorPDF) currentTimeIndicatorPDF.style.display = 'block'; 

            if (type === 'weekly' && yAxisColumn) {
                yAxisColumn.style.position = 'relative'; 
                yAxisColumn.style.left = 'auto';
                yAxisColumn.style.zIndex = '18';
            }

            await new Promise(resolve => setTimeout(resolve, 800)); // Delay agar rendering CSS selesai

            // --- KONFIGURASI HTML2CANVAS OPTIMAL (UKURAN KECIL) ---
            // Scale 1 (Default) cukup untuk PDF A4/A3, Scale 2 membuat file sangat besar.
            const scale = 1; 
            
            const commonOptions = {
                scale: scale,
                useCORS: true,
                logging: false, // Matikan log biar cepat
                backgroundColor: '#ffffff' // PENTING: JPEG butuh background putih
            };

            const optionsBerthMap = {
                ...commonOptions,
                width: captureWidth, 
                height: berthMapContainer.scrollHeight,
                x: 0, 
            };

            const optionsLegends = {
                ...commonOptions,
                width: (type === 'daily' ? legendsFullWidth : captureWidth),
                height: legendsScrollContainer.scrollHeight,
                x: 0, 
            };
            const optionsHeader = { 
                ...commonOptions, 
                width: captureWidth, 
                height: pdfHeader.offsetHeight, 
                x: 0 
            };

            // --- CAPTURE ---
            const canvasHeader = await html2canvas(pdfHeader, optionsHeader);
            const canvasMapCombined = await html2canvas(berthMapContainer, optionsBerthMap);
            const canvasLegends = await html2canvas(legendsScrollContainer, optionsLegends);

            const canvases = [canvasHeader, canvasMapCombined, canvasLegends];
            
            // Hitung Ukuran PDF
            // 96 DPI adalah standar web. 25.4 mm = 1 inch
            const pdfWidthMM = (canvasMapCombined.width / scale / 96) * 25.4; 
            const totalPdfHeightMM = canvases.reduce((sum, c) => sum + (c.height / scale / 96) * 25.4, 0);

            const doc = new jsPDF({
                orientation: pdfWidthMM > totalPdfHeightMM ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [pdfWidthMM, totalPdfHeightMM],
                compress: true // Aktifkan kompresi internal jsPDF
            });

            let yOffset = 0;
            for (const canvas of canvases) {
                // --- PENTING: UBAH KE JPEG UNTUK UKURAN KECIL ---
                // Format: 'image/jpeg', Quality: 0.75 (75%)
                const imgData = canvas.toDataURL('image/jpeg', 0.75); 
                
                const imgHeightMM = (canvas.height / scale / 96) * 25.4;
                const imgWidthMM = (canvas.width / scale / 96) * 25.4;
                
                // Parameter 'FAST' mempercepat kompresi dan mengurangi ukuran
                doc.addImage(imgData, 'JPEG', 0, yOffset, imgWidthMM, imgHeightMM, undefined, 'FAST');
                yOffset += imgHeightMM;
            }

            doc.save(pdfFileName);

        } catch (error) {
            console.error("[PDF Export] Error:", error);
            alert("Terjadi kesalahan saat membuat file PDF.");
        } finally {
            // --- CLEANUP (KEMBALIKAN TAMPILAN) ---
            mainHeader.classList.remove('hide-for-pdf');

            restBlocks.forEach((block, index) => {
                if (originalRestBlockHTML[index] !== undefined) {
                    block.innerHTML = originalRestBlockHTML[index]; 
                }
                block.classList.remove('pdf-vertical-text-hack'); 
            });

            pdfHeader.style.display = 'none'; 
            pdfHeader.style.width = oldHeaderWidth;
            berthMapContainer.style.width = oldMapWidth;
            legendsScrollContainer.style.width = oldLegendsWidth;
            gridScroll.style.overflowX = oldGridScrollOverflow;
            gridScroll.scrollLeft = oldGridScrollLeft;
            legendsScrollContainer.scrollLeft = oldLegendsScrollLeft;
            
            if(currentTimeIndicatorPDF) currentTimeIndicatorPDF.style.display = oldTimeIndicatorDisplay; 
            if(berthDividerLinePDF) berthDividerLinePDF.style.display = oldDividerDisplay; 

            if (yAxisColumn) {
                yAxisColumn.style.position = oldYAxisPosition;
                yAxisColumn.style.left = oldYAxisLeft;
                yAxisColumn.style.zIndex = oldYAxisZIndex;
            }

            exportBtn.disabled = false;
            exportBtn.innerHTML = originalBtnHTML;
        }
    }

    function setupEventListeners() {
        prevWeekBtn.addEventListener('click', () => { currentStartDate.setDate(currentStartDate.getDate() - 7); updateDisplay(); });
        nextWeekBtn.addEventListener('click', () => { currentStartDate.setDate(currentStartDate.getDate() + 7); updateDisplay(); });


        weekDatePicker.addEventListener('change', () => {
            const selectedDate = weekDatePicker.value;
            if (!selectedDate) {
                currentStartDate = getStartOfWeek(new Date()); 
            } else {
                const parts = selectedDate.split('-'); 
                currentStartDate = new Date(parts[0], parts[1] - 1, parts[2]);
            }
            updateDisplay(); 
        });

        addShipBtn.addEventListener('click', () => {
            editingShipIndex = null;
            shipForm.reset();
            loadPendingForm();
            modalTitle.textContent = 'Tambah Jadwal Kapal';
            formSubmitBtn.textContent = 'Submit';
            shipForm.classList.remove('edit-mode');
            deleteShipBtn.onclick = null;
            modal.style.display = 'block';
        });
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            shipForm.classList.remove('edit-mode');
        });

        const pdfDropdownBtn = document.getElementById('export-pdf-btn');
        const pdfOptionsContainer = document.getElementById('pdf-options');
        const pdfOptionBtns = document.querySelectorAll('.pdf-option-btn');

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
                shipForm.classList.remove('edit-mode');
            }
            if (event.target == maintenanceModal) {
                maintenanceModal.style.display = 'none';
                maintenanceForm.classList.remove('edit-mode');
            }
            if (event.target == restModal) {
                restModal.style.display = 'none';
                restForm.classList.remove('edit-mode');
            }

            if (pdfOptionsContainer.style.display === 'block' && !pdfDropdownBtn.contains(event.target)) {
                pdfOptionsContainer.style.display = 'none';
            }
        });

        shipForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const etaTime = shipForm.elements['etaTime'].value;
            const startTime = shipForm.elements['startTime'].value;
            const etcTime = shipForm.elements['etcTime'].value;
            const endTime = shipForm.elements['endTime'].value;
            if (!etaTime || !startTime || !etcTime || !endTime) {
                alert("Harap isi semua field waktu (ETA, ETB, ETC, ETD).");
                return;
            }
            if (new Date(startTime) < new Date(etaTime)) {
                alert("Waktu Sandar (ETB) tidak boleh sebelum Waktu Tiba (ETA).");
                return;
            }
            if (new Date(endTime) <= new Date(startTime)) {
                alert("Waktu Berangkat (ETD) harus setelah Waktu Sandar (ETB).");
                return;
            }
            const formData = new FormData(shipForm);
            const shipData = Object.fromEntries(formData.entries());
            const toIntOrNull = (val) => {
                const parsed = parseInt(val, 10);
                return Number.isNaN(parsed) ? null : parsed;
            };
            const toFloatOrNull = (val) => {
                const parsed = parseFloat(val);
                return Number.isNaN(parsed) ? null : parsed;
            };
            shipData.length = toFloatOrNull(shipData.length);
            shipData.draft = toFloatOrNull(shipData.draft);
            shipData.berthLocation = toIntOrNull(shipData.berthLocation);
            shipData.nKd = toIntOrNull(shipData.nKd);
            shipData.minKd = toIntOrNull(shipData.minKd);
            shipData.bsh = toIntOrNull(shipData.bsh);
            shipData.loadValue = toIntOrNull(shipData.loadValue) || 0;
            shipData.dischargeValue = toIntOrNull(shipData.dischargeValue) || 0;
        
        const qccCheckboxes = document.querySelectorAll('#qcc-checkbox-group input[type="checkbox"]:checked');
        const checkedQCCs = Array.from(qccCheckboxes).map(cb => cb.value);
        shipData.qccName = checkedQCCs.join(' & ');

            if (editingShipIndex !== null) {
                shipData.id = shipSchedules[editingShipIndex].id;
                fetch('update_ship.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shipData)
                })
                .then(res => res.json())
                .then(result => {
                    if (result.status === "success") {
                        fetchShipsFromDB();
                        modal.style.display = 'none';
                    } else {
                        alert('Gagal update data: ' + (result.message || 'unknown error'));
                    }
                })
                .catch(err => {
                    console.error('Error update data:', err);
                    alert('Terjadi kesalahan saat update data.');
                });
            } else {
                 fetch('save_ship.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shipData) // Kirim data ke PHP
                })
                .then(res => res.json())
                .then(result => {
                    if (result.status === "success") {
                        fetchShipsFromDB(); // Ambil data terbaru dari server
                        modal.style.display = 'none';
                    } else {
                        alert('Gagal menyimpan data: ' + (result.message || 'unknown error'));
                    }
                })
                .catch(err => {
                    console.error('Error saat menyimpan data:', err);
                    alert('Terjadi kesalahan saat menyimpan data.');
                });
            }
            modal.style.display = 'none';
            shipForm.classList.remove('edit-mode');
            clearPendingForm();
        });

        Array.from(shipForm.elements).forEach(input => {
            input.addEventListener('input', savePendingForm);
        });

        addMaintenanceBtn.addEventListener('click', () => {
            editingMaintenanceIndex = null;
            maintenanceForm.reset();
            maintenanceModalTitle.textContent = 'Tambah Maintenance';
            maintenanceSubmitBtn.textContent = 'Submit';
            maintenanceForm.classList.remove('edit-mode');
            deleteMaintenanceBtn.onclick = null;
            maintenanceModal.style.display = 'block';
        });
        maintenanceCloseBtn.addEventListener('click', () => {
            maintenanceModal.style.display = 'none';
            maintenanceForm.classList.remove('edit-mode');
        });
        maintenanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(maintenanceForm);
            const maintenanceData = Object.fromEntries(formData.entries());
            maintenanceData.startKd = parseInt(maintenanceData.startKd, 10);
            maintenanceData.endKd = parseInt(maintenanceData.endKd, 10);
            saveMaintenanceData(maintenanceData);
            console.log('Data yang dikirim ke save_maintenance.php:', maintenanceData);
        });

        async function saveMaintenanceData(maintenanceData) {
            try {
                const response = await fetch('save_maintenance.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(maintenanceData)
                });
                const result = await response.json();
                console.log('Response from save_maintenance.php:', result);
                if (result.status === "success") {
                    alert('Data maintenance berhasil disimpan!');
                    maintenanceModal.style.display = 'none'; // Close the modal
                    maintenanceForm.classList.remove('edit-mode'); // Reset the modal state
                    fetchShipsFromDB(); // Refresh data
                } else {
                    alert('Gagal menyimpan data maintenance: ' + (result.message || 'unknown error'));
                }
            } catch (error) {
                console.error('Error saat menyimpan data maintenance:', error);
                alert('Terjadi kesalahan saat menyimpan data maintenance.');
            }
        }

        addRestBtn.addEventListener('click', () => {
            editingRestIndex = null;
            restForm.reset();
            restModalTitle.textContent = 'Tambah Waktu Istirahat';
            restSubmitBtn.textContent = 'Submit';
            restForm.classList.remove('edit-mode');
            deleteRestBtn.onclick = null;
            restModal.style.display = 'block';
        });
        restCloseBtn.addEventListener('click', () => {
            restModal.style.display = 'none';
            restForm.classList.remove('edit-mode');
        });
        restForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const startTime = restForm.elements['startTime'].value;
            const endTime = restForm.elements['endTime'].value;
            if (new Date(endTime) <= new Date(startTime)) {
                alert("Waktu Selesai harus setelah Waktu Mulai.");
                return;
            }
            const formData = new FormData(restForm);
            const restData = Object.fromEntries(formData.entries());
            saveRestData(restData);
        });

        async function saveRestData(restData) {
            try {
                const response = await fetch('save_break.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(restData)
                });
                const result = await response.json();
                console.log('Response from save_break.php:', result);
                if (result.status === "success") {
                    alert('Data istirahat berhasil disimpan!');
                    restModal.style.display = 'none'; // Close the modal
                    restForm.classList.remove('edit-mode'); // Reset the modal state
                    fetchShipsFromDB(); // Refresh data
                } else {
                    alert('Gagal menyimpan data istirahat: ' + (result.message || 'unknown error'));
                }
            } catch (error) {
                console.error('Error saat menyimpan data istirahat:', error);
                alert('Terjadi kesalahan saat menyimpan data istirahat.');
            }
        }

        const commLogCells = document.querySelectorAll('#comm-log-table td[contenteditable="true"]');
        commLogCells.forEach(cell => {
            cell.addEventListener('input', saveCommLog);
        });

        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('Anda yakin ingin menghapus semua data jadwal kapal, maintenance, istirahat dan communication log?')) {
                    shipSchedules = [];
                    maintenanceSchedules = [];
                    restSchedules = [];

                    localStorage.removeItem('shipSchedules');
                    localStorage.removeItem('maintenanceSchedules');
                    localStorage.removeItem('restSchedules');
                    localStorage.removeItem('communicationLogData');
                    localStorage.removeItem('draggableLinePosition'); 

                    clearPendingForm();

                    document.querySelectorAll('#comm-log-table tbody tr').forEach(row => {
                        const cells = row.querySelectorAll('td[contenteditable="true"]');
                        cells.forEach((cell, index) => {
                            if (index === cells.length - 1) {
                               cell.textContent = 'WAG';
                            } else {
                                 cell.textContent = '';
                            }
                        });
                    });

                    draggableLineLeft = 200; 
                    updateDisplay();
                }
            });
        }

        pdfDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const isVisible = pdfOptionsContainer.style.display === 'block';
            pdfOptionsContainer.style.display = isVisible ? 'none' : 'block';
        });

        pdfOptionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = e.target.dataset.type; 
                exportToPDF(type); 
            });
        });

        let activeDraggableLine = null;

        
        grid.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('draggable-cc-line')) {
                activeDraggableLine = e.target;
                e.preventDefault(); 
            }
        });

    
        document.addEventListener('mousemove', (e) => {
            if (!activeDraggableLine) return; 

            e.preventDefault(); 
            
            const containerRect = grid.getBoundingClientRect();
            
            let newTop = e.clientY - containerRect.top;

            const minTop = 0;
            const maxTop = grid.clientHeight - activeDraggableLine.offsetHeight; 
            
            if (newTop < minTop) newTop = minTop;
            if (newTop > maxTop) newTop = maxTop;

            activeDraggableLine.style.top = `${newTop}px`;
        });
        document.addEventListener('mouseup', () => {
            activeDraggableLine = null; 
        });
      

    } 
    initialize();

    async function checkTables() {
        try {
            console.log('Checking database tables...');
            const response = await fetch('check_tables.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Tables in database:', data.tables);
        } catch (error) {
            console.error('Error checking tables:', error);
        }
    }
    // Call checkTables to verify database tables
    checkTables();
});
