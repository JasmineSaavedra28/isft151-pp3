        function formatDataValue(value) {
            if (value === null || value === undefined || value === '') return '—';
            if (typeof value === 'boolean') return value ? 'Sí' : 'No';
            if (typeof value === 'object') return JSON.stringify(value);
            if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return value.split('-').reverse().join('/');
            }
            if (value === 'enabled') return 'Habilitado';
            if (value === 'disabled') return 'Deshabilitado';
            return String(value);
        }

        function createDataTable(rows) {
            const wrap = document.createElement('div');
            wrap.className = 'report-table-wrap';
            const table = document.createElement('table');
            table.className = 'report-table';
            const columns = Array.from(new Set(rows.flatMap(function (row) {
                return Object.keys(row || {}).filter(function (key) {
                    if (key.toLowerCase() === 'userid' || key.toLowerCase().includes('id')) return false;
                    return typeof row[key] !== 'object' || row[key] === null;
                });
            })));
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            columns.forEach(function (column) {
                const cell = document.createElement('th');
                cell.textContent = dataLabels[column] || column.replace(/([A-Z])/g, ' $1').replace(/^./, function (letter) {
                    return letter.toUpperCase();
                });
                headerRow.appendChild(cell);
            });
            thead.appendChild(headerRow);
            const tbody = document.createElement('tbody');
            rows.forEach(function (row) {
                const tableRow = document.createElement('tr');
                columns.forEach(function (column) {
                    const cell = document.createElement('td');
                    cell.textContent = formatDataValue(row[column]);
                    tableRow.appendChild(cell);
                });
                tbody.appendChild(tableRow);
            });
            table.append(thead, tbody);
            wrap.appendChild(table);
            return wrap;
        }

        function createElement(tagName, options = {}) {
            const element = document.createElement(tagName);
            if (options.id) element.id = options.id;
            if (options.className) element.className = options.className;
            if (options.textContent !== undefined && options.textContent !== null) element.textContent = options.textContent;
            if (options.style) element.style.cssText = options.style;
            return element;
        }

        
        function createInstitutionFooter() {
            const footer = createElement('footer', { className: 'site-footer' });
            const text = createElement('div', { className: 'site-footer-text' });
            text.appendChild(createElement('p', {
                className: 'site-footer-title',
                textContent: 'MiRegistro · Proyecto académico'
            }));
            text.appendChild(createElement('p', {
                className: 'site-footer-subject',
                textContent: 'Prácticas Profesionalizantes III · ISFT N° 151'
            }));
            const authors = createElement('p', { className: 'site-footer-authors' });
            ['Jazmín Saavedra', 'Pablo Curtti', 'Carlos Guariglia'].forEach(function (name) {
                authors.appendChild(createElement('span', { textContent: name }));
            });
            text.appendChild(authors);
            const legalLinks = createElement('nav', { className: 'site-footer-legal' });
            [['Términos y condiciones', 'terminos.html'], ['Política de privacidad', 'privacidad.html']].forEach(function (item) {
                const link = createElement('a', { textContent: item[0] });
                link.href = item[1];
                legalLinks.appendChild(link);
            });
            text.appendChild(legalLinks);
            footer.appendChild(text);
            return footer;
        }


        function createWelcomeScreen() {
            const section = createElement('section', { id: 'welcomeScreen', className: 'welcome-screen' });
            const hero = createElement('div', { className: 'welcome-hero' });
            hero.appendChild(createElement('div', { className: 'welcome-eyebrow', textContent: 'MiRegistro · Gestión escolar' }));
            hero.appendChild(createElement('h2', { textContent: 'Tu escuela, más organizada.' }));
            hero.appendChild(createElement('p', { textContent: 'Un espacio simple para organizar alumnos, cursos y asistencias. Todo lo importante de la gestión escolar, en un mismo lugar.' }));
            const visual = createElement('div', { className: 'welcome-visual', 'aria-hidden': 'true' });
            const visualTop = createElement('div', { className: 'welcome-visual-top' });
            visualTop.append(createElement('span', { className: 'material-symbol', textContent: 'fact_check' }), createElement('strong', { textContent: 'Asistencia de hoy' }), createElement('span', { className: 'welcome-visual-live', textContent: 'EN ORDEN' }));
            const visualStats = createElement('div', { className: 'welcome-visual-stats' });
            [['check_circle','Presentes','28'],['schedule','Tardanzas','2'],['cancel','Ausentes','1']].forEach(function(item){
                const stat = createElement('div', { className: 'welcome-visual-stat' });
                stat.append(createElement('span', { className: 'material-symbol', textContent: item[0] }), createElement('small', { textContent: item[1] }), createElement('b', { textContent: item[2] })); visualStats.appendChild(stat);
            });
            const visualRows = createElement('div', { className: 'welcome-visual-rows' });
            [['3° A','31 estudiantes','check_circle'],['4° B','29 estudiantes','check_circle'],['5° A','En seguimiento','schedule']].forEach(function(item){ const line=createElement('div',{className:'welcome-visual-row'}); line.append(createElement('strong',{textContent:item[0]}),createElement('span',{textContent:item[1]}),createElement('span',{className:'material-symbol',textContent:item[2]})); visualRows.appendChild(line); });
            visual.append(visualTop, visualStats, visualRows); hero.appendChild(visual);
            const actions = createElement('div', { className: 'welcome-actions' });
            const login = createButton('welcomeLoginButton', 'Iniciar sesión');
            login.classList.add('welcome-login');
            login.addEventListener('click', function () {
                const button = document.getElementById('btnLogin');
                if (button) button.click();
            });
            const explore = createButton('welcomeExploreButton', 'Explorar funciones');
            explore.classList.add('welcome-explore');
            explore.addEventListener('click', function () {
                const preview = document.querySelector('.welcome-preview');
                if (preview) preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const firstTab = document.querySelector('.welcome-feature-tab');
                if (firstTab) firstTab.focus();
            });
            actions.append(login, explore);
            hero.appendChild(actions);

            const preview = createElement('div', { className: 'welcome-preview' });
            preview.appendChild(createElement('h3', { textContent: 'Conocé lo que podés hacer' }));
            preview.appendChild(createElement('p', { textContent: 'Seleccioná una herramienta para descubrir cómo te ayuda.' }));
            const tabs = createElement('div', { className: 'welcome-feature-tabs', role: 'group' });
            const detail = createElement('div', { className: 'welcome-feature-detail', 'aria-live': 'polite' });
            const features = [
                { icon: 'groups', label: 'Alumnos', title: 'Información organizada', description: 'Consultá y administrá los datos de estudiantes de tu institución.' },
                { icon: 'fact_check', label: 'Asistencias', title: 'Asistencia más simple', description: 'Registrá presentes, ausentes y tardanzas por curso y fecha.' },
                { icon: 'analytics', label: 'Reportes', title: 'Seguimiento claro', description: 'Revisá la información y consultá reportes para acompañar las trayectorias.' }
            ];
            function selectFeature(index) {
                const feature = features[index];
                tabs.querySelectorAll('button').forEach(function (button, i) {
                    button.setAttribute('aria-pressed', String(i === index));
                });
                while (detail.firstChild) detail.removeChild(detail.firstChild);
                detail.append(
                    createElement('span', { className: 'material-symbol', textContent: feature.icon }),
                    createElement('div')
                );
                detail.lastChild.append(
                    createElement('strong', { textContent: feature.title }),
                    createElement('span', { textContent: feature.description })
                );
            }
            features.forEach(function (feature, index) {
                const tab = createElement('button', { className: 'welcome-feature-tab', type: 'button' });
                tab.setAttribute('aria-pressed', 'false');
                tab.append(
                    createElement('span', { className: 'material-symbol', textContent: feature.icon }),
                    createElement('span', { textContent: feature.label })
                );
                tab.addEventListener('click', function () { selectFeature(index); });
                tabs.appendChild(tab);
            });
            preview.append(tabs, detail);
            preview.appendChild(createElement('p', { className: 'welcome-note', textContent: 'La información de tu institución estará disponible al iniciar sesión.' }));
            section.append(hero, preview);
            selectFeature(0);
            return section;
        }

        function createButton(id, text, isDanger = false) {
            return createElement('button', {
                id,
                className: isDanger ? 'danger' : '',
                textContent: text
            });
        }

        const navigationSections = [
            'dashboardOverview',
            'accountPage',
            'adminContainer',
            'studentManagementContainer',
            'courseManagementContainer',
            'calendarManagementContainer',
            'teacherAttendanceContainer',
            'attendanceReportCard'
        ];

        function showSection(targetId) {
            const target = document.getElementById(targetId);
            const actionContainer = document.getElementById('actionContainer');
            if (!target || !actionContainer || actionContainer.style.display === 'none') return;

            navigationSections.forEach(function (sectionId) {
                const section = document.getElementById(sectionId);
                if (section) section.style.display = sectionId === targetId ? 'block' : 'none';
            });
            document.querySelectorAll('.mobile-quick-nav button').forEach(function (button) {
                button.removeAttribute('aria-current');
            });
            document.querySelectorAll('.mobile-quick-nav button[data-target-id]').forEach(function (button) {
                const isActive = button.dataset.targetId === targetId;
                if (isActive) button.setAttribute('aria-current', 'page');
                else button.removeAttribute('aria-current');
            });
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function closeMobileMenu() {
            const shell = document.querySelector('.dashboard-shell');
            const toggle = document.querySelector('.mobile-menu-toggle');
            if (!shell || !toggle) return;
            shell.classList.remove('mobile-menu-open');
            document.body.classList.remove('mobile-menu-open');
            toggle.setAttribute('aria-expanded', 'false');
            const mobileMenuButton = document.querySelector('.mobile-menu-button');
            if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
        }

        function closeMobileAccountPanel() {
            const panel = document.querySelector('.mobile-account-panel');
            const button = document.querySelector('.mobile-account-button');
            if (!panel || !button) return;
            panel.hidden = true;
            button.setAttribute('aria-expanded', 'false');
        }

        function createNavItem(targetId, icon, text) {
            const button = createElement('button', { textContent: text });
            button.setAttribute('aria-label', text);
            button.title = text;
            button.dataset.targetId = targetId;
            const iconElement = createElement('span', { className: 'material-symbol nav-icon', textContent: icon });
            iconElement.setAttribute('aria-hidden', 'true');
            button.prepend(iconElement);
            button.addEventListener('click', function () {
                showSection(targetId);
                closeMobileMenu();
            });
            return button;
        }

        function createQuickNavItem(targetId, icon, text, extraClass = '') {
            const button = createElement('button', { className: `quick-nav-button ${extraClass}`.trim() });
            if (targetId) button.dataset.targetId = targetId;
            button.setAttribute('aria-label', text);
            button.title = text;
            button.append(
                createElement('span', { className: 'material-symbol quick-nav-icon', textContent: icon }),
                createElement('span', { className: 'quick-nav-label', textContent: text })
            );
            button.firstChild.setAttribute('aria-hidden', 'true');
            if (targetId) {
                button.addEventListener('click', function () {
                    if (button.disabled) return;
                    showSection(button.dataset.targetId);
                    closeMobileMenu();
                    closeMobileAccountPanel();
                });
            }
            return button;
        }

        function updateNavigation(role) {
            const allowedSections = role === 'Administrador'
                ? null
                : role === 'Docente'
                    ? new Set(['actionContainer', 'teacherAttendanceContainer', 'attendanceReportCard'])
                    : new Set();
            document.querySelectorAll('.sidebar-nav button[data-target-id]').forEach(function (button) {
                button.style.display = !allowedSections || allowedSections.has(button.dataset.targetId)
                    ? 'flex'
                    : 'none';
            });

            const quickNav = document.querySelector('.mobile-quick-nav');
            if (!quickNav) return;
            const quickHome = quickNav.querySelector('[data-quick-key="home"]');
            const quickStudents = quickNav.querySelector('[data-quick-key="students"]');
            const quickAttendance = quickNav.querySelector('[data-quick-key="attendance"]');
            const quickReports = quickNav.querySelector('[data-quick-key="reports"]');
            const quickAccount = quickNav.querySelector('.mobile-account-button');

            if (quickAttendance) {
                quickAttendance.dataset.targetId = role === 'Docente'
                    ? 'teacherAttendanceContainer'
                    : 'courseManagementContainer';
                quickAttendance.querySelector('.quick-nav-label').textContent = role === 'Docente' ? 'Asistencias' : 'Cursos';
                quickAttendance.setAttribute('aria-label', role === 'Docente' ? 'Asistencias' : 'Cursos');
            }
            [quickHome, quickStudents, quickAttendance, quickReports].forEach(function (button) {
                if (!button) return;
                const targetId = button.dataset.targetId;
                const permitted = Boolean(role) && (!allowedSections || allowedSections.has(targetId));
                button.disabled = !permitted;
                button.setAttribute('aria-disabled', String(!permitted));
                button.title = permitted ? button.getAttribute('aria-label') : 'Iniciá sesión para acceder';
            });
            if (quickReports) quickReports.style.display = 'grid';
            if (quickAccount) {
                quickAccount.disabled = false;
                quickAccount.removeAttribute('aria-current');
            }
            updateMobileAccountButton();
        }

        function updateMobileAccountButton() {
            const button = document.querySelector('.mobile-account-button');
            if (!button) return;
            const actionButton = document.querySelector('.mobile-account-action');
            const status = document.querySelector('.mobile-account-status');
            const signedIn = Boolean(authSessionToken);
            // Cuenta permanece siempre visible; el panel cambia según la sesión.
            button.style.display = 'grid';
            const quickNav = button.closest('.mobile-quick-nav');
            if (quickNav) quickNav.classList.remove('logged-out');
            button.setAttribute('aria-label', 'Cuenta');
            button.title = 'Cuenta';
            if (actionButton) {
                actionButton.textContent = signedIn ? 'Cerrar sesión' : 'Iniciar sesión';
                actionButton.classList.toggle('danger', signedIn);
            }
            if (status) {
                status.textContent = signedIn
                    ? (document.getElementById('userStatus')?.textContent || 'Sesión iniciada')
                    : 'No iniciaste sesión';
            }
            const details = document.querySelector('.mobile-account-details');
            if (details) {
                details.textContent = signedIn
                    ? 'Tu cuenta está activa en este dispositivo.'
                    : 'Iniciá sesión para acceder a las funciones de tu institución.';
            }
        }

        function createCard(id, title, buttonDefinitions, style = '') {
            const card = createElement('div', { id, className: 'card', style });
            card.appendChild(createElement('h3', { textContent: title }));
            const actions = createElement('div', { className: 'card-actions' });
            buttonDefinitions.forEach(function (definition) {
                actions.appendChild(createButton(definition[0], definition[1], definition[2]));
            });
            card.appendChild(actions);
            return card;
        }

