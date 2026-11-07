const host = 'http://localhost:3000';
        let currentUserId = null;
        let authSessionToken = null;

        function notify(message, type = 'success', title = 'Información') {
            const region = document.getElementById('notificationRegion');
            if (!region) return;
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            const heading = document.createElement('strong');
            heading.textContent = title;
            notification.append(heading, document.createTextNode(message));
            region.appendChild(notification);
            window.setTimeout(function () {
                notification.remove();
            }, 5000);
        }

        window.alert = function (message) {
            notify(String(message).replace(/^Error:\s*/, ''), 'error', 'No se pudo completar');
        };

        class RPCWebAPIException extends Error {
            constructor(type, detail) {
                super(detail);
                this.name = 'RPCWebAPIException';
                this.type = type;
                this.detail = detail;
            }
        }

        async function computeSHA256(plainText) {
            const encoder = new TextEncoder();
            const data = encoder.encode(plainText);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hashBuffer))
                .map(function (byte) { return byte.toString(16).padStart(2, '0'); })
                .join('');
        }

        function normalizeHolidayDate(value) {
            const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
            if (!match) {
                throw new RPCWebAPIException(
                    'BadRequest',
                    `El feriado "${value}" debe tener el formato DD-MM-AAAA`
                );
            }
            return `${match[3]}-${match[2]}-${match[1]}`;
        }

        function getHeaders() {
            return {
                'Content-Type': 'application/json',
                'x-user-id': currentUserId,
                'Authorization': `Bearer ${authSessionToken}`,
                'x-api-version': '1.0'
            };
        }
        async function rpcFetch(path, body = {}) {
            const response = await fetch(host + path, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(body)
            });

            if (response.status === 200) return response.json();
                if (response.status === 400) throw new RPCWebAPIException('BadRequest', 'Error en los datos enviados');
                if (response.status === 401 || response.status === 403) {
                authSessionToken = null;
                throw new RPCWebAPIException('AuthError', 'No autorizado o sesión expirada');
            }
            if (response.status === 422) {
                const err = await response.json().catch(function () { return {}; });
                throw new RPCWebAPIException('DomainError', err.detail ? err.detail[0] : 'Error de validación');
            }
            throw new RPCWebAPIException('ServerError', 'Error interno del servidor');
        }

        function showFormModal(title, fields, submitText = 'Aceptar') {
            return new Promise(function (resolve) {
                const modal = document.getElementById('formModal');
                document.getElementById('modalTitle').textContent = title;
                const modalBody = document.getElementById('modalBody');
                while (modalBody.firstChild) {
                    modalBody.removeChild(modalBody.firstChild);
                }

                const inputs = {};

                fields.forEach(function (f) {
                    const group = document.createElement('div');
                    group.className = 'form-group';

                    const label = document.createElement('label');
                    label.textContent = f.label;
                    group.appendChild(label);

                    let input;
                    let searchInput;
                    if (f.type === 'select') {
                        input = document.createElement('select');
                        f.options.forEach(function (opt) {
                            const option = document.createElement('option');
                            option.value = opt.value;
                            option.textContent = opt.text;
                            input.appendChild(option);
                        });
                        searchInput = document.createElement('input');
                        searchInput.type = 'search';
                        searchInput.placeholder = 'Buscar en la lista...';
                        searchInput.setAttribute('aria-label', `Buscar ${f.label}`);
                        const searchContainer = document.createElement('div');
                        searchContainer.className = 'search-select';
                        searchContainer.appendChild(searchInput);
                        searchContainer.appendChild(input);
                        group.appendChild(searchContainer);
                    } else {
                        input = document.createElement('input');
                        input.type = f.type || 'text';
                        if (f.placeholder) input.placeholder = f.placeholder;
                        group.appendChild(input);
                    }
                    if (f.value !== undefined) input.value = f.value;
                    if (f.readOnly) input.readOnly = true;

                    inputs[f.name] = input;
                    if (searchInput) {
                        const updateSearchText = function () {
                            const selectedOption = input.options[input.selectedIndex];
                            searchInput.value = selectedOption ? selectedOption.textContent : '';
                        };
                        searchInput.addEventListener('input', function () {
                            const query = searchInput.value.trim().toLocaleLowerCase();
                            Array.from(input.options).forEach(function (option) {
                                option.hidden = query !== '' && !option.textContent.toLocaleLowerCase().includes(query);
                            });
                            const visibleOption = Array.from(input.options).find(function (option) {
                                return !option.hidden;
                            });
                            if (visibleOption) input.value = visibleOption.value;
                        });
                        input.addEventListener('change', updateSearchText);
                    }
                    modalBody.appendChild(group);
                });

                const btnSubmit = document.getElementById('btnSubmitModal');
                const btnCancel = document.getElementById('btnCancelModal');
                const originalSubmitText = btnSubmit.textContent;
                btnSubmit.textContent = submitText;

                const cleanup = function () {
                    btnSubmit.onclick = null;
                    btnCancel.onclick = null;
                    btnSubmit.textContent = originalSubmitText;
                    modal.close();
                };

                btnSubmit.onclick = function () {
                    const result = {};
                    fields.forEach(function (f) {
                        result[f.name] = f.type === 'checkbox' ? inputs[f.name].checked : inputs[f.name].value;
                    });
                    cleanup();
                    resolve(result);
                };

                btnCancel.onclick = function () {
                    cleanup();
                    resolve(null);
                };

                modal.showModal();
            });
        }

        function showAttendanceModal(courseId, courseName, date, students, attendanceDates) {
            return new Promise(function (resolve) {
                const modal = document.getElementById('formModal');
                const modalBody = document.getElementById('modalBody');
                document.getElementById('modalTitle').textContent = 'Tomar asistencia';
                modal.classList.add('attendance-modal');
                while (modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);

                let currentDate = date;
                let currentStudents = students;
                let rows = new Map();
                let isLoadingDate = false;
                const persistedDates = new Set(attendanceDates);
                const availableDates = new Set(attendanceDates);
                const toolbar = createElement('div', { className: 'attendance-toolbar' });
                const context = createElement('div', { className: 'attendance-context' });
                context.appendChild(createElement('strong', { textContent: courseName }));
                const dateSelector = document.createElement('select');
                dateSelector.setAttribute('aria-label', 'Fecha de la clase');
                function refreshDateOptions() {
                    while (dateSelector.firstChild) dateSelector.removeChild(dateSelector.firstChild);
                    Array.from(availableDates).sort().forEach(function (availableDate) {
                        const option = createElement('option', {
                            textContent: availableDate.split('-').reverse().join('/'),
                        });
                        option.value = availableDate;
                        dateSelector.appendChild(option);
                    });
                    dateSelector.value = currentDate;
                }
                if (!availableDates.has(currentDate)) availableDates.add(currentDate);
                refreshDateOptions();
                context.appendChild(dateSelector);
                const studentCount = createElement('span');
                context.appendChild(studentCount);
                toolbar.appendChild(context);

                const summary = createElement('div', { className: 'attendance-summary' });
                const summaryValues = {
                    present: createElement('strong', { textContent: '0' }),
                    absent: createElement('strong', { textContent: '0' }),
                    late: createElement('strong', { textContent: '0' }),
                    early: createElement('strong', { textContent: '0' })
                };
                [['present', 'Presentes'], ['absent', 'Ausentes'], ['late', 'Tardes'], ['early', 'Retiros']].forEach(function (item) {
                    const summaryItem = createElement('div', { className: 'summary-item' });
                    summaryItem.appendChild(createElement('span', { textContent: item[1] }));
                    summaryItem.appendChild(summaryValues[item[0]]);
                    summary.appendChild(summaryItem);
                });
                toolbar.appendChild(summary);

                const actions = createElement('div', { className: 'attendance-actions' });
                const markPresentButton = createButton('', 'Marcar todos presentes');
                const resetButton = createButton('', 'Restablecer estados');
                const deleteButton = createButton('', 'Borrar asistencia', true);
                actions.append(markPresentButton, resetButton, deleteButton);
                modalBody.append(toolbar, actions);

                const header = createElement('div', { className: 'attendance-row header-row' });
                ['Estudiante', 'Presente', 'Ausente', 'Tarde', 'Retiro'].forEach(function (label) {
                    header.appendChild(createElement('div', { textContent: label }));
                });
                modalBody.appendChild(header);

                function updateSummary() {
                    const totals = { present: 0, absent: 0, late: 0, early: 0 };
                    rows.forEach(function (row) {
                        const selectedStatus = Object.keys(row.statusRadios).find(function (key) {
                            return row.statusRadios[key].checked;
                        });
                        totals[selectedStatus]++;
                        if (row.early.checked) totals.early++;
                    });
                    Object.keys(totals).forEach(function (key) {
                        summaryValues[key].textContent = totals[key];
                    });
                }

                function readRecords() {
                    return currentStudents.map(function (student) {
                        const row = rows.get(student.studentId);
                        const status = Object.keys(row.statusRadios).find(function (key) {
                            return row.statusRadios[key].checked;
                        });
                        return { studentId: student.studentId, status, earlyDeparture: row.early.checked };
                    });
                }

                function renderStudents() {
                    while (header.nextSibling) header.nextSibling.remove();
                    rows = new Map();
                    currentStudents.forEach(function (student) {
                    const row = createElement('div', { className: 'attendance-row' });
                    const identity = createElement('div', { className: 'attendance-student' });
                    identity.appendChild(createElement('strong', { textContent: `${student.surname}, ${student.name}` }));
                    identity.appendChild(createElement('span', { textContent: `DNI ${student.dni || '—'}` }));
                    row.appendChild(identity);

                    const statusOptions = createElement('div', { className: 'status-options' });
                    const statusRadios = {};
                    [['present', 'P'], ['absent', 'A'], ['late', 'T']].forEach(function (option) {
                        const label = createElement('label', { className: 'status-option' });
                        const input = document.createElement('input');
                        input.type = 'radio';
                        input.name = `attendance-${student.studentId}`;
                        input.value = option[0];
                        input.checked = (student.attendanceStatus || 'absent') === option[0];
                        input.addEventListener('change', updateSummary);
                        const marker = createElement('span', { textContent: option[1] });
                        statusRadios[option[0]] = input;
                        label.append(input, marker);
                        statusOptions.appendChild(label);
                    });
                    row.appendChild(statusOptions);

                    const earlyLabel = createElement('label', { className: 'status-option early-option' });
                    const early = document.createElement('input');
                    early.type = 'checkbox';
                    early.checked = Boolean(student.earlyDeparture);
                    early.setAttribute('aria-label', `Retiro anticipado de ${student.name} ${student.surname}`);
                    early.addEventListener('change', updateSummary);
                    earlyLabel.append(early, createElement('span', { textContent: 'R' }));
                    statusOptions.appendChild(earlyLabel);
                    modalBody.appendChild(row);
                    rows.set(student.studentId, { statusRadios, early });
                    });
                    studentCount.textContent = `Clase del ${currentDate.split('-').reverse().join('/')} · ${currentStudents.length} estudiantes`;
                    updateSummary();
                }

                markPresentButton.onclick = function () {
                    rows.forEach(function (row) {
                        row.statusRadios.present.checked = true;
                        row.statusRadios.present.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                };
                resetButton.onclick = function () {
                    rows.forEach(function (row) {
                        row.statusRadios.absent.checked = true;
                        row.early.checked = false;
                    });
                    updateSummary();
                };

                const btnSubmit = document.getElementById('btnSubmitModal');
                const btnCancel = document.getElementById('btnCancelModal');
                const cleanup = function () {
                    btnSubmit.onclick = null;
                    btnCancel.onclick = null;
                    dateSelector.onchange = null;
                    modal.classList.remove('attendance-modal');
                    modal.close();
                };
                async function loadRosterDate(nextDate) {
                    const roster = await rpcFetch('/getAttendanceRoster', { courseId, date: nextDate });
                    currentDate = nextDate;
                    currentStudents = roster.students;
                    renderStudents();
                }
                async function loadDate(nextDate) {
                    await rpcFetch('/saveAttendance', {
                        courseId,
                        date: currentDate,
                        records: readRecords()
                    });
                    persistedDates.add(currentDate);
                    availableDates.add(currentDate);
                    await loadRosterDate(nextDate);
                }
                btnSubmit.onclick = function () {
                    const records = readRecords();
                    cleanup();
                    resolve({ date: currentDate, records });
                };
                btnCancel.onclick = function () {
                    cleanup();
                    resolve(null);
                };
                dateSelector.onchange = async function () {
                    if (isLoadingDate || !dateSelector.value || dateSelector.value === currentDate) return;
                    isLoadingDate = true;
                    const nextDate = dateSelector.value;
                    try {
                        await loadDate(nextDate);
                    } catch (e) {
                        dateSelector.value = currentDate;
                        notify(e.detail || 'No se pudo cargar la fecha seleccionada.', 'error', 'No se pudo completar');
                    } finally {
                        isLoadingDate = false;
                    }
                };
                deleteButton.onclick = async function () {
                    if (!persistedDates.has(currentDate) || !window.confirm(`¿Borrar la asistencia del ${currentDate.split('-').reverse().join('/')}?`)) return;
                    isLoadingDate = true;
                    try {
                        await rpcFetch('/deleteAttendance', { courseId, date: currentDate });
                        persistedDates.delete(currentDate);
                        availableDates.delete(currentDate);
                        const nextDate = Array.from(availableDates).sort()[0];
                        if (!nextDate) {
                            cleanup();
                            resolve(null);
                            return;
                        }
                        await loadRosterDate(nextDate);
                        refreshDateOptions();
                    } catch (e) {
                        notify(e.detail || 'No se pudo borrar la asistencia.', 'error', 'No se pudo completar');
                    } finally {
                        isLoadingDate = false;
                    }
                };
                renderStudents();
                modal.showModal();
            });
        }

        const dataLabels = {
            userId: 'Usuario', username: 'Nombre de usuario', role: 'Rol', status: 'Estado',
            studentId: 'Alumno', name: 'Nombre', surname: 'Apellido', dni: 'DNI',
            courseId: 'Curso', professorId: 'Docente', startDate: 'Inicio', endDate: 'Fin',
            academicYear: 'Ciclo lectivo', holidays: 'Feriados', academicCalendarId: 'Calendario',
            success: 'Resultado', message: 'Mensaje', present: 'Presentes', absent: 'Ausentes', late: 'Tardes'
        };

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
            footer.appendChild(text);
            return footer;
        }


        function createWelcomeScreen() {
            const section = createElement('section', { id: 'welcomeScreen', className: 'welcome-screen' });
            const hero = createElement('div', { className: 'welcome-hero' });
            hero.appendChild(createElement('div', { className: 'welcome-eyebrow', textContent: 'MiRegistro · Gestión escolar' }));
            hero.appendChild(createElement('h2', { textContent: 'Tu escuela, más organizada.' }));
            hero.appendChild(createElement('p', { textContent: 'Un espacio simple para organizar alumnos, cursos y asistencias. Todo lo importante de la gestión escolar, en un mismo lugar.' }));
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
            button.setAttribute('aria-label', 'Cuenta');
            button.title = 'Cuenta';
            if (actionButton) {
                actionButton.textContent = signedIn ? 'Cerrar sesión' : 'Iniciar sesión';
                actionButton.classList.toggle('danger', signedIn);
            }
            if (status) {
                status.textContent = document.getElementById('userStatus')?.textContent || 'Desconectado';
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

        class Menu extends HTMLElement {
            constructor() {
                super();

                const sidebar = createElement('aside', { className: 'sidebar' });
                sidebar.setAttribute('aria-label', 'Navegación principal');
                const brand = createElement('div', { className: 'brand' });
                const brandMark = createElement('div', { className: 'brand-mark' });
                brandMark.setAttribute('aria-label', 'MiRegistro');
                brandMark.appendChild(createElement('span', { className: 'material-symbol', textContent: 'library_add_check' }));
                brand.appendChild(brandMark);
                const brandText = createElement('div', { className: 'brand-text' });
                brandText.appendChild(createElement('strong', { textContent: 'MiRegistro' }));
                brandText.appendChild(createElement('span', { textContent: 'Gestión escolar simple y organizada' }));
                brand.appendChild(brandText);
                const collapseToggle = createElement('button', {
                    className: 'sidebar-collapse-toggle material-symbol',
                    textContent: 'chevron_left'
                });
                collapseToggle.setAttribute('aria-label', 'Contraer menú');
                collapseToggle.title = 'Contraer menú';
                brand.appendChild(collapseToggle);
                sidebar.appendChild(brand);
                sidebar.appendChild(createElement('div', { className: 'sidebar-label', textContent: 'Navegación' }));
                const sidebarNav = createElement('nav', { className: 'sidebar-nav' });
                sidebarNav.appendChild(createNavItem('actionContainer', 'home', 'Resumen'));
                sidebarNav.appendChild(createNavItem('adminContainer', 'manage_accounts', 'Usuarios'));
                sidebarNav.appendChild(createNavItem('studentManagementContainer', 'groups', 'Estudiantes'));
                sidebarNav.appendChild(createNavItem('courseManagementContainer', 'school', 'Cursos'));
                sidebarNav.appendChild(createNavItem('calendarManagementContainer', 'calendar_month', 'Calendario'));
                sidebarNav.appendChild(createNavItem('teacherAttendanceContainer', 'fact_check', 'Asistencias'));
                sidebarNav.appendChild(createNavItem('attendanceReportCard', 'analytics', 'Reportes'));
                sidebar.appendChild(sidebarNav);
                sidebar.appendChild(createElement('div', {
                    className: 'sidebar-footer',
                    textContent: 'Organizá la información de tu institución desde un solo lugar.'
                }));

                const formModal = createElement('dialog', { id: 'formModal' });
                formModal.appendChild(createElement('h3', { id: 'modalTitle', textContent: 'Título' }));
                formModal.appendChild(createElement('div', { id: 'modalBody' }));
                const dialogActions = createElement('div', { className: 'dialog-actions' });
                dialogActions.appendChild(createButton('btnCancelModal', 'Cancelar'));
                dialogActions.lastChild.classList.add('cancel');
                dialogActions.appendChild(createButton('btnSubmitModal', 'Aceptar'));
                formModal.appendChild(dialogActions);

                const notificationRegion = createElement('div', { id: 'notificationRegion', className: 'notification-region' });
                const header = createElement('div', { className: 'header' });
                const heading = createElement('div', { className: 'header-heading' });
                const menuToggle = createElement('button', {
                    className: 'mobile-menu-toggle material-symbol',
                    textContent: 'menu'
                });
                menuToggle.setAttribute('aria-label', 'Abrir menú');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.title = 'Abrir menú';
                const headerBrandMark = createElement('span', { className: 'material-symbol header-brand-mark', textContent: 'library_add_check' });
                headerBrandMark.setAttribute('aria-hidden', 'true');
                const headingText = createElement('div', { className: 'header-brand-text' });
                headingText.appendChild(createElement('h1', { textContent: 'MiRegistro' }));
                headingText.appendChild(createElement('p', { textContent: 'Gestión escolar simple y organizada' }));
                heading.append(menuToggle, headerBrandMark, headingText);
                header.appendChild(heading);
                const headerActions = createElement('div', { className: 'header-actions' });
                headerActions.appendChild(createElement('span', {
                    id: 'userStatus',
                    textContent: 'Desconectado',
                    className: 'user-status'
                }));
                headerActions.appendChild(createButton('btnLogin', 'Iniciar Sesión'));
                headerActions.appendChild(createButton('btnLogout', 'Cerrar Sesión', true));
                headerActions.lastChild.style.display = 'none';
                header.appendChild(headerActions);

                const actionContainer = createElement('div', {
                    id: 'actionContainer',
                    style: 'display: none;'
                });
                const overviewCard = createElement('section', {
                    id: 'dashboardOverview',
                    className: 'card section-overview'
                });
                overviewCard.appendChild(createElement('span', {
                    className: 'section-kicker',
                    textContent: 'Panel principal'
                }));
                overviewCard.appendChild(createElement('h2', {
                    textContent: 'Todo listo para comenzar'
                }));
                overviewCard.appendChild(createElement('p', {
                    textContent: 'Elegí una sección del menú para administrar la información de tu institución.'
                }));
                actionContainer.appendChild(overviewCard);
                actionContainer.appendChild(createCard('adminContainer', 'Administración', [
                    ['btnNewUser', 'Agregar Usuario / Rol'],
                    ['btnModifyUser', 'Modificar Usuario'],
                    ['btnDisableUser', 'Habilitar / Deshabilitar Usuario'],
                    ['btnDeleteUser', 'Eliminar Usuario', true],
                    ['btnUpdateUserRole', 'Modificar Rol'],
                    ['btnListUsers', 'Listar Usuarios']
                ], 'display: none;'));
                actionContainer.appendChild(createCard('studentManagementContainer', 'Gestión de Estudiantes', [
                    ['btnNewStudent', 'Registrar Estudiante'],
                    ['btnModifyStudent', 'Modificar Estudiante'],
                    ['btnDeleteStudent', 'Eliminar Estudiante', true],
                    ['btnListStudents', 'Listar Estudiantes']
                ], 'display: none;'));
                actionContainer.appendChild(createCard('courseManagementContainer', 'Cursos e inscripciones', [
                    ['btnNewCourse', 'Crear Curso'],
                    ['btnModifyCourse', 'Modificar Curso'],
                    ['btnListCourses', 'Listar Cursos'],
                    ['btnEnrollStudent', 'Inscribir Estudiante'],
                    ['btnRemoveEnrollment', 'Desinscribir Estudiante', true],
                    ['btnListCourseStudents', 'Ver Alumnos del Curso'],
                    ['btnAttendanceReport', 'Ver Asistencias']
                ], 'display: none;'));
                actionContainer.appendChild(createCard('calendarManagementContainer', 'Calendario académico', [
                    ['btnNewCalendar', 'Configurar Calendario'],
                    ['btnListCalendars', 'Listar Calendarios']
                ], 'display: none;'));
                actionContainer.appendChild(createCard('teacherAttendanceContainer', 'Mis cursos y asistencia', [
                    ['btnTeacherListCourses', 'Ver Mis Cursos'],
                    ['btnTakeAttendance', 'Tomar Asistencia'],
                    ['btnTeacherAttendanceReport', 'Ver Asistencias']
                ], 'display: none;'));
                const reportCard = createElement('div', { id: 'attendanceReportCard', className: 'card', style: 'display: none;' });
                reportCard.appendChild(createElement('h3', { id: 'attendanceReportTitle', textContent: 'Reporte de asistencia' }));
                reportCard.appendChild(createElement('div', { id: 'attendanceReportTable', className: 'report-table-wrap' }));
                actionContainer.appendChild(reportCard);
                const resultCard = createElement('div', { id: 'resultCard', className: 'card', style: 'display: none;' });
                resultCard.appendChild(createElement('h3', { id: 'resultTitle', textContent: 'Resultado' }));
                resultCard.appendChild(createElement('div', { id: 'resultContent' }));
                actionContainer.appendChild(resultCard);
                const mainContent = createElement('main', { className: 'main-content' });
                mainContent.append(notificationRegion, formModal, header, createWelcomeScreen(), actionContainer, createInstitutionFooter());
                const shell = createElement('div', { className: 'dashboard-shell' });
                const backdrop = createElement('button', { className: 'sidebar-backdrop' });
                backdrop.setAttribute('aria-label', 'Cerrar menú');
                const quickNav = createElement('nav', { className: 'mobile-quick-nav' });
                quickNav.setAttribute('aria-label', 'Navegación principal');
                const quickHome = createQuickNavItem('dashboardOverview', 'home', 'Inicio');
                quickHome.dataset.quickKey = 'home';
                const quickStudents = createQuickNavItem('studentManagementContainer', 'groups', 'Alumnos');
                quickStudents.dataset.quickKey = 'students';
                const quickAttendance = createQuickNavItem('courseManagementContainer', 'fact_check', 'Cursos');
                quickAttendance.dataset.quickKey = 'attendance';
                quickAttendance.classList.add('quick-attendance');
                const quickReports = createQuickNavItem('attendanceReportCard', 'analytics', 'Reportes');
                quickReports.dataset.quickKey = 'reports';
                const accountButton = createQuickNavItem(null, 'account_circle', 'Cuenta', 'mobile-account-button');
                accountButton.setAttribute('aria-expanded', 'false');
                const accountPanel = createElement('section', { className: 'mobile-account-panel' });
                accountPanel.hidden = true;
                const accountStatus = createElement('p', { className: 'mobile-account-status', textContent: 'Desconectado' });
                const accountAction = createButton('mobileAccountAction', 'Iniciar sesión');
                accountAction.classList.add('mobile-account-action');
                accountAction.addEventListener('click', function () {
                    closeMobileAccountPanel();
                    const sessionButton = document.getElementById(authSessionToken ? 'btnLogout' : 'btnLogin');
                    if (sessionButton) sessionButton.click();
                });
                accountPanel.append(accountStatus, accountAction);
                accountButton.addEventListener('click', function () {
                    const opening = accountPanel.hidden;
                    accountButton.removeAttribute('aria-current');
                    closeMobileMenu();
                    accountPanel.hidden = !opening;
                    accountButton.setAttribute('aria-expanded', String(opening));
                });
                quickNav.append(quickHome, quickStudents, quickAttendance, quickReports, accountButton);
                shell.append(sidebar, backdrop, mainContent, quickNav, accountPanel);
                collapseToggle.addEventListener('click', function () {
                    const isCollapsed = shell.classList.toggle('sidebar-collapsed');
                    collapseToggle.textContent = isCollapsed ? 'chevron_right' : 'chevron_left';
                    collapseToggle.setAttribute('aria-label', isCollapsed ? 'Expandir menú' : 'Contraer menú');
                    collapseToggle.title = isCollapsed ? 'Expandir menú' : 'Contraer menú';
                });
                menuToggle.addEventListener('click', function () {
                    const isOpen = shell.classList.toggle('mobile-menu-open');
                    document.body.classList.toggle('mobile-menu-open', isOpen);
                    menuToggle.setAttribute('aria-expanded', String(isOpen));
                    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
                    menuToggle.title = isOpen ? 'Cerrar menú' : 'Abrir menú';
                });
                backdrop.addEventListener('click', closeMobileMenu);
                document.addEventListener('click', function (event) {
                    if (!accountPanel.contains(event.target) && event.target !== accountButton) {
                        closeMobileAccountPanel();
                    }
                });
                document.addEventListener('keydown', function (event) {
                    if (event.key === 'Escape') {
                        closeMobileMenu();
                        closeMobileAccountPanel();
                    }
                });
                this.appendChild(shell);
            }

            printResult(data) {
                const resultCard = document.getElementById('resultCard');
                const resultTitle = document.getElementById('resultTitle');
                const resultContent = document.getElementById('resultContent');
                while (resultContent.firstChild) resultContent.removeChild(resultContent.firstChild);

                const collectionKey = Object.keys(data).find(function (key) {
                    return Array.isArray(data[key]);
                });
                if (collectionKey && data[collectionKey].length > 0) {
                    resultTitle.textContent = collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1);
                    resultContent.appendChild(createDataTable(data[collectionKey]));
                } else if (collectionKey) {
                    resultTitle.textContent = collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1);
                    resultContent.appendChild(createElement('div', {
                        className: 'empty-state',
                        textContent: 'No hay registros para mostrar.'
                    }));
                } else {
                    resultTitle.textContent = data.message || 'Resultado';
                    const fields = Object.entries(data).filter(function (entry) {
                        return entry[0] !== 'message';
                    });
                    if (fields.length === 0) {
                        resultContent.appendChild(createElement('div', {
                            className: 'empty-state',
                            textContent: 'Operación completada correctamente.'
                        }));
                    } else {
                        resultContent.appendChild(createDataTable([Object.fromEntries(fields)]));
                    }
                }
                resultCard.style.display = 'block';
            }

            clearAttendanceReport() {
                const reportCard = document.getElementById('attendanceReportCard');
                const tableContainer = document.getElementById('attendanceReportTable');
                const reportTitle = document.getElementById('attendanceReportTitle');
                while (tableContainer.firstChild) {
                    tableContainer.removeChild(tableContainer.firstChild);
                }
                reportTitle.textContent = 'Reporte de asistencia';
                reportCard.style.display = 'none';
            }

            printAttendanceReport(report, dateRange = {}) {
                const reportCard = document.getElementById('attendanceReportCard');
                const tableContainer = document.getElementById('attendanceReportTable');
                const reportTitle = document.getElementById('attendanceReportTitle');
                while (tableContainer.firstChild) {
                    tableContainer.removeChild(tableContainer.firstChild);
                }
                reportTitle.textContent = `Reporte de asistencia - ${report.course.name}`;

                const filters = createElement('div', { className: 'attendance-report-filters' });
                // Periodos académicos (cuatrimestrales) calculados a partir de las fechas reales del curso.
                const periodOptions = this.buildAttendancePeriods(report.sessions.map(function (session) { return session.date; }));
                const selectedPeriodKey = dateRange.period || '';
                if (selectedPeriodKey && !dateRange.startDate && !dateRange.endDate) {
                    const selectedPeriod = periodOptions.find(function (period) { return period.key === selectedPeriodKey; });
                    if (selectedPeriod) {
                        dateRange = Object.assign({}, dateRange, { startDate: selectedPeriod.start, endDate: selectedPeriod.end });
                    }
                }
                const startLabel = createElement('label', { textContent: 'Desde' });
                const startInput = document.createElement('input');
                startInput.type = 'date';
                startInput.setAttribute('aria-label', 'Fecha desde');
                startInput.value = dateRange.startDate || '';
                startLabel.appendChild(startInput);
                const endLabel = createElement('label', { textContent: 'Hasta' });
                const endInput = document.createElement('input');
                endInput.type = 'date';
                endInput.setAttribute('aria-label', 'Fecha hasta');
                endInput.value = dateRange.endDate || '';
                endLabel.appendChild(endInput);
                const clearFilters = createButton('clearAttendanceReportFilters', 'Limpiar');
                clearFilters.classList.add('filter-clear');
                const studentSearchLabel = createElement('label', {
                    className: 'student-search',
                    textContent: 'Buscar estudiante'
                });
                const studentSearch = document.createElement('input');
                studentSearch.type = 'search';
                studentSearch.placeholder = 'Nombre o apellido';
                studentSearch.setAttribute('aria-label', 'Buscar estudiante');
                studentSearch.value = dateRange.studentQuery || '';
                studentSearchLabel.appendChild(studentSearch);
                const filterCount = createElement('span', { className: 'attendance-report-count' });
                const filterToggle = createElement('button', { className: 'attendance-report-filter-toggle' });
                filterToggle.setAttribute('aria-controls', 'attendanceReportFilters');
                filterToggle.append(
                    createElement('span', { className: 'material-symbol', textContent: 'filter_list' }),
                    createElement('span', { textContent: 'Filtros' })
                );
                filterToggle.firstChild.setAttribute('aria-hidden', 'true');
                const filterHeader = createElement('div', { className: 'attendance-report-filter-header' });
                filterHeader.append(filterToggle, filterCount);
                filters.id = 'attendanceReportFilters';
                const periodsRow = createElement('div', { className: 'attendance-report-periods', textContent: 'Período:' });
                const allChip = document.createElement('button');
                allChip.type = 'button';
                allChip.className = 'period-chip' + (selectedPeriodKey ? '' : ' active');
                allChip.textContent = 'Todo el ciclo';
                allChip.addEventListener('click', function () {
                    this.printAttendanceReport(report, {
                        studentQuery: studentSearch.value,
                        filtersOpen: true,
                        page: 1
                    });
                }.bind(this));
                periodsRow.appendChild(allChip);
                periodOptions.forEach(function (period) {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'period-chip' + (period.key === selectedPeriodKey ? ' active' : '');
                    chip.textContent = `${period.label} (${period.classCount})`;
                    chip.title = `Del ${period.start.split('-').reverse().join('/')} al ${period.end.split('-').reverse().join('/')}`;
                    chip.addEventListener('click', function () {
                        this.printAttendanceReport(report, {
                            period: period.key,
                            startDate: period.start,
                            endDate: period.end,
                            studentQuery: studentSearch.value,
                            filtersOpen: true,
                            page: 1
                        });
                    }.bind(this));
                    periodsRow.appendChild(chip);
                });
                filters.append(periodsRow, startLabel, endLabel, studentSearchLabel, clearFilters);
                const filtersOpen = dateRange.filtersOpen !== undefined
                    ? dateRange.filtersOpen
                    : false;
                filters.classList.toggle('collapsed', !filtersOpen);
                filterToggle.setAttribute('aria-expanded', String(filtersOpen));
                tableContainer.append(filterHeader, filters);
                filterToggle.addEventListener('click', function () {
                    const isOpen = filters.classList.toggle('collapsed') === false;
                    filterToggle.setAttribute('aria-expanded', String(isOpen));
                });

                const filteredSessions = report.sessions.filter(function (session) {
                    return (!startInput.value || session.date >= startInput.value)
                        && (!endInput.value || session.date <= endInput.value);
                });
                filterCount.textContent = `${filteredSessions.length} ${filteredSessions.length === 1 ? 'clase' : 'clases'} en el período`;
                const renderFilteredReport = function (page = 1) {
                    this.printAttendanceReport(report, {
                        startDate: startInput.value,
                        endDate: endInput.value,
                        studentQuery: studentSearch.value,
                        filtersOpen: !filters.classList.contains('collapsed'),
                        page
                    });
                }.bind(this);
                startInput.addEventListener('change', renderFilteredReport);
                endInput.addEventListener('change', renderFilteredReport);
                studentSearch.addEventListener('change', renderFilteredReport);
                clearFilters.addEventListener('click', function () {
                    this.printAttendanceReport(report, {
                        filtersOpen: !filters.classList.contains('collapsed')
                    });
                }.bind(this));

                const query = studentSearch.value.trim().toLocaleLowerCase('es');
                const filteredStudents = report.students.filter(function (student) {
                    return `${student.surname} ${student.name}`.toLocaleLowerCase('es').includes(query);
                });
                const classCount = `${filteredSessions.length} ${filteredSessions.length === 1 ? 'clase' : 'clases'}`;
                const studentCount = `${filteredStudents.length} ${filteredStudents.length === 1 ? 'estudiante' : 'estudiantes'}`;
                const startDateLabel = startInput.value ? startInput.value.split('-').reverse().join('/') : 'Inicio';
                const endDateLabel = endInput.value ? endInput.value.split('-').reverse().join('/') : 'Fin';
                const activePeriod = periodOptions.find(function (period) { return period.key === selectedPeriodKey; });
                const periodLabel = activePeriod
                    ? activePeriod.label
                    : (startInput.value || endInput.value ? `${startDateLabel} – ${endDateLabel}` : 'Todo el período');
                filterCount.textContent = `${periodLabel} · ${classCount} · ${studentCount}`;

                if (filteredSessions.length === 0) {
                    tableContainer.appendChild(createElement('div', {
                        className: 'empty-state',
                        textContent: 'No hay clases registradas en ese período.'
                    }));
                    reportCard.style.display = 'block';
                    return;
                }
                if (filteredStudents.length === 0) {
                    tableContainer.appendChild(createElement('div', {
                        className: 'empty-state',
                        textContent: 'No hay estudiantes que coincidan con la búsqueda.'
                    }));
                    reportCard.style.display = 'block';
                    return;
                }

                const studentMetrics = new Map();
                filteredStudents.forEach(function (student) {
                    const records = filteredSessions
                        .map(function (session) { return student.attendanceByDate[session.date]; })
                        .filter(Boolean);
                    const present = records.filter(function (record) { return record.status === 'present'; }).length;
                    const late = records.filter(function (record) { return record.status === 'late'; }).length;
                    studentMetrics.set(student.studentId, {
                        present,
                        late,
                        absent: records.filter(function (record) { return record.status === 'absent'; }).length,
                        earlyDepartures: records.filter(function (record) { return record.earlyDeparture; }).length,
                        attendancePercentage: records.length
                            ? Number((((present + late) / records.length) * 100).toFixed(2))
                            : 0
                    });
                });

                const pageSize = 10;
                const pageCount = Math.ceil(filteredStudents.length / pageSize);
                const currentPage = Math.min(Math.max(1, Number(dateRange.page) || 1), pageCount);
                const pageStart = (currentPage - 1) * pageSize;
                const pageStudents = filteredStudents.slice(pageStart, pageStart + pageSize);
                const pagination = createElement('div', { className: 'attendance-report-pagination' });
                const previousPage = createButton('previousAttendancePage', 'Anterior');
                previousPage.disabled = currentPage === 1;
                const pageLabel = createElement('span', {
                    textContent: `${currentPage} de ${pageCount}`
                });
                const nextPage = createButton('nextAttendancePage', 'Siguiente');
                nextPage.disabled = currentPage === pageCount;
                previousPage.addEventListener('click', function () {
                    renderFilteredReport(currentPage - 1);
                });
                nextPage.addEventListener('click', function () {
                    renderFilteredReport(currentPage + 1);
                });
                pagination.append(previousPage, pageLabel, nextPage);
                if (pageCount > 1) tableContainer.appendChild(pagination);

                const table = document.createElement('table');
                table.className = 'report-table report-desktop compact';
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                const reportHeaders = ['Estudiante'].concat(
                    filteredSessions.map(function (session) {
                        // Formato compacto "05/08" para que entren muchas columnas sin que se deforme.
                        return session.date.slice(8, 10) + '/' + session.date.slice(5, 7);
                    }),
                    ['P', 'T', 'A', 'R', '%']
                );
                reportHeaders.forEach(function (header) {
                    const cell = document.createElement('th');
                    cell.textContent = header;
                    if (header === 'P' || header === 'T' || header === 'A' || header === 'R' || header === '%') {
                        cell.title = { P: 'Presentes', T: 'Tardes', A: 'Ausentes', R: 'Retiros', '%': 'Asistencia %' }[header];
                    }
                    headerRow.appendChild(cell);
                });
                thead.appendChild(headerRow);
                const tbody = document.createElement('tbody');
                pageStudents.forEach(function (student) {
                    const metrics = studentMetrics.get(student.studentId);
                    const row = document.createElement('tr');
                    const nameCell = document.createElement('td');
                    nameCell.textContent = `${student.surname}, ${student.name}`;
                    row.appendChild(nameCell);
                    filteredSessions.forEach(function (session) {
                        const cell = document.createElement('td');
                        const record = student.attendanceByDate[session.date];
                        if (!record) {
                            cell.textContent = '-';
                            cell.className = 'report-empty';
                        } else {
                            const status = { present: 'P', late: 'T', absent: 'A' }[record.status] || '-';
                            cell.textContent = record.earlyDeparture ? `${status}*` : status;
                            cell.className = { present: 'status-present', late: 'status-late', absent: 'status-absent' }[record.status] || '';
                        }
                        row.appendChild(cell);
                    });
                    [
                        metrics.present,
                        metrics.late,
                        metrics.absent,
                        metrics.earlyDepartures,
                        `${metrics.attendancePercentage}%`
                    ].forEach(function (value) {
                        const cell = document.createElement('td');
                        cell.textContent = value;
                        row.appendChild(cell);
                    });
                    tbody.appendChild(row);
                });
                table.append(thead, tbody);
                const tableScroll = createElement('div', { className: 'report-scroll' });
                tableScroll.appendChild(table);
                tableContainer.appendChild(tableScroll);
                tableContainer.appendChild(createElement('p', {
                    className: 'attendance-report-legend',
                    textContent: 'Leyenda: P = presente · T = tarde · A = ausente · * = retiro anticipado. Encabezados de fecha en formato día/mes.'
                }));

                // Vista alternativa para celular: una tarjeta por estudiante con chips por clase.
                const mobileCards = createElement('div', { className: 'attendance-mobile-cards' });
                pageStudents.forEach(function (student) {
                    const metrics = studentMetrics.get(student.studentId);
                    const card = createElement('div', { className: 'student-card' });
                    const cardHeader = createElement('div', { className: 'student-card-header' });
                    cardHeader.append(
                        createElement('span', { className: 'student-card-name', textContent: `${student.surname}, ${student.name}` }),
                        createElement('span', { className: 'student-card-percent', textContent: `${metrics.attendancePercentage}%` })
                    );
                    card.appendChild(cardHeader);
                    const chips = createElement('div', { className: 'student-card-sessions' });
                    filteredSessions.forEach(function (session) {
                        const chip = createElement('span', { className: 'session-chip' });
                        const dateLabel = session.date.slice(8, 10) + '/' + session.date.slice(5, 7);
                        const record = student.attendanceByDate[session.date];
                        if (!record) {
                            chip.classList.add('empty');
                            chip.textContent = `${dateLabel} -`;
                        } else {
                            const status = { present: 'P', late: 'T', absent: 'A' }[record.status] || '-';
                            chip.textContent = `${dateLabel} ${status}${record.earlyDeparture ? '*' : ''}`;
                            chip.classList.add({ present: 'status-present', late: 'status-late', absent: 'status-absent' }[record.status] || '');
                        }
                        chips.appendChild(chip);
                    });
                    card.appendChild(chips);
                    mobileCards.appendChild(card);
                });
                tableContainer.appendChild(mobileCards);
                reportCard.style.display = 'block';

            }

            buildAttendancePeriods(dates) {
                // Agrupa las clases en períodos cuatrimestrales argentinos:
                // 1.º = marzo–julio, 2.º = agosto–febrero del mismo año lectivo.
                const PERIOD_NAMES = { first: '1.º cuatrimestre', second: '2.º cuatrimestre' };
                const buckets = new Map();
                dates.slice().sort().forEach(function (date) {
                    const year = Number(date.slice(0, 4));
                    const month = Number(date.slice(5, 7));
                    // Año lectivo argentino: enero–febrero pertenecen al 2.º cuatrimestre del año anterior.
                    const schoolYear = month >= 3 ? year : year - 1;
                    const which = month >= 3 && month <= 7 ? 'first' : 'second';
                    const key = `${schoolYear}-${which}`;
                    const bucket = buckets.get(key) || { key, year: schoolYear, which, dates: [] };
                    bucket.dates.push(date);
                    buckets.set(key, bucket);
                });
                return Array.from(buckets.values())
                    .sort(function (a, b) {
                        return a.year - b.year || (a.which === 'first' ? -1 : 1);
                    })
                    .map(function (bucket) {
                        const sorted = bucket.dates.slice().sort();
                        return {
                            key: bucket.key,
                            label: `${PERIOD_NAMES[bucket.which]} ${bucket.year}`,
                            start: sorted[0],
                            end: sorted[sorted.length - 1],
                            classCount: sorted.length
                        };
                    });
            }

            connectedCallback() {
                const menu = this;
                updateNavigation(null);
                document.getElementById('btnLogin').onclick = async function () {
                    const data = await showFormModal('Iniciar Sesión', [
                        { name: 'user', label: 'Usuario', type: 'text' },
                        { name: 'pass', label: 'Contraseña', type: 'password' }
                    ]);

                    if (!data || !data.user || !data.pass) return;

                    currentUserId = data.user;
                    authSessionToken = await computeSHA256(data.pass);

                    try {
                        const res = await rpcFetch('/login');
                        document.getElementById('userStatus').textContent = `Usuario: ${currentUserId} (${res.role})`;
                        document.getElementById('btnLogin').style.display = 'none';
                        document.getElementById('btnLogout').style.display = 'inline-block';
                        document.getElementById('welcomeScreen').style.display = 'none';
                        document.getElementById('actionContainer').style.display = 'block';
                        document.getElementById('adminContainer').style.display = res.role === 'Administrador' ? 'block' : 'none';
                        document.getElementById('studentManagementContainer').style.display = res.role === 'Administrador' ? 'block' : 'none';
                        document.getElementById('courseManagementContainer').style.display = res.role === 'Administrador' ? 'block' : 'none';
                        document.getElementById('calendarManagementContainer').style.display = res.role === 'Administrador' ? 'block' : 'none';
                        document.getElementById('teacherAttendanceContainer').style.display = res.role === 'Docente' ? 'block' : 'none';
                        updateNavigation(res.role);
                        showSection('dashboardOverview');
                        menu.clearAttendanceReport();
                        menu.printResult({ success: true, message: 'Ingreso exitoso', role: res.role });
                    } catch (e) {
                        alert(`Error: ${e.detail}`);
                        currentUserId = null;
                        authSessionToken = null;
                        document.getElementById('btnLogin').style.display = 'inline-flex';
                        document.getElementById('btnLogout').style.display = 'none';
                        updateNavigation(null);
                    }
                };

                document.getElementById('btnLogout').onclick = async function () {
                    try { await rpcFetch('/logout'); } catch(e){}
                    currentUserId = null;
                    authSessionToken = null;
                    document.getElementById('userStatus').textContent = 'Desconectado';
                    document.getElementById('btnLogin').style.display = 'inline-block';
                    document.getElementById('btnLogout').style.display = 'none';
                    document.getElementById('actionContainer').style.display = 'none';
                    document.getElementById('welcomeScreen').style.display = 'grid';
                    document.getElementById('adminContainer').style.display = 'none';
                    document.getElementById('studentManagementContainer').style.display = 'none';
                    document.getElementById('courseManagementContainer').style.display = 'none';
                    document.getElementById('calendarManagementContainer').style.display = 'none';
                    document.getElementById('teacherAttendanceContainer').style.display = 'none';
                    updateNavigation(null);
                    menu.clearAttendanceReport();
                    menu.printResult({ message: 'Sesión cerrada' });
                };

                document.getElementById('btnNewUser').onclick = async function () {
                    const data = await showFormModal('Agregar Usuario / Rol', [
                        { name: 'username', label: 'Usuario' },
                        { name: 'password', label: 'Contraseña', type: 'password' },
                        { name: 'role', label: 'Rol', type: 'select', options: [
                            { value: 'Administrador', text: 'Administrador' },
                            { value: 'Preceptor', text: 'Preceptor' },
                            { value: 'Docente', text: 'Docente' }
                        ] }
                    ]);
                    if (!data) return;
                    data.password = await computeSHA256(data.password);
                    try {
                        const res = await rpcFetch('/registerUser', data);
                        menu.printResult({ message: 'Usuario creado correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnModifyUser').onclick = async function () {
                    try {
                        const users = await rpcFetch('/listUsers');
                        const options = users.map(function (user) { return { value: user.userId, text: `${user.username} (${user.role})` }; });
                        if (options.length === 0) {
                            alert('No hay usuarios registrados.');
                            return;
                        }
                        const selected = await showFormModal('Seleccionar Usuario', [
                            { name: 'userId', label: 'Usuario', type: 'select', options }
                        ]);
                        if (!selected) return;
                        const user = users.find(function (item) { return item.userId === selected.userId; });
                        const data = await showFormModal('Modificar Nombre de Usuario', [
                            { name: 'userId', label: 'Usuario', type: 'select', options: [{ value: user.userId, text: user.username }], value: user.userId },
                            { name: 'username', label: 'Nuevo nombre de usuario', value: user.username }
                        ]);
                        if (!data) return;
                        const res = await rpcFetch('/modifyUser', data);
                        menu.printResult({ message: 'Usuario modificado correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnDisableUser').onclick = async function () {
                    try {
                        const users = await rpcFetch('/listUsers');
                        const options = users.map(function (user) {
                            const status = user.status === 'enabled' ? 'Habilitado' : 'Deshabilitado';
                            return { value: user.userId, text: `${user.username} (${user.role} · ${status})` };
                        });
                        if (options.length === 0) {
                            alert('No hay usuarios registrados.');
                            return;
                        }
                        const data = await showFormModal('Habilitar o deshabilitar usuario', [
                            { name: 'userId', label: 'Usuario', type: 'select', options }
                        ]);
                        if (!data) return;
                        const res = await rpcFetch('/disableUser', data);
                        menu.printResult({
                            message: res.status === 'enabled'
                                ? 'Usuario habilitado correctamente'
                                : 'Usuario deshabilitado correctamente',
                            ...res
                        });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnDeleteUser').onclick = async function () {
                    try {
                        const users = await rpcFetch('/listUsers');
                        const options = users.map(function (user) { return { value: user.userId, text: `${user.username} (${user.role})` }; });
                        if (options.length === 0) {
                            alert('No hay usuarios registrados.');
                            return;
                        }
                        const data = await showFormModal('Eliminar Usuario', [
                            { name: 'userId', label: 'Usuario', type: 'select', options }
                        ]);
                        if (!data) return;
                        const confirmation = await showFormModal('Confirmar eliminación', [
                            { name: 'confirm', label: 'Escribí ELIMINAR para confirmar', type: 'text' }
                        ]);
                        if (!confirmation || confirmation.confirm !== 'ELIMINAR') return;
                        const res = await rpcFetch('/deleteUser', data);
                        menu.printResult({ message: 'Usuario eliminado correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnUpdateUserRole').onclick = async function () {
                    try {
                        const users = await rpcFetch('/listUsers');
                        const options = users.map(function (user) { return { value: user.userId, text: `${user.username} (${user.role})` }; });
                        const data = await showFormModal('Modificar Rol', [
                            { name: 'userId', label: 'Usuario', type: 'select', options },
                            { name: 'newRole', label: 'Nuevo rol', type: 'select', options: [
                                { value: 'Administrador', text: 'Administrador' },
                                { value: 'Preceptor', text: 'Preceptor' },
                                { value: 'Docente', text: 'Docente' }
                            ] }
                        ]);
                        if (!data) return;
                        const res = await rpcFetch('/updateUserRole', data);
                        menu.printResult({ message: 'Rol actualizado correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnListUsers').onclick = async function () {
                    try {
                        const users = await rpcFetch('/listUsers');
                        menu.printResult({ usuarios: users });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnListStudents').onclick = async function () {
                    try {
                        const students = await rpcFetch('/listStudents');
                        menu.printResult({ estudiantes: students });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnModifyStudent').onclick = async function () {
                    try {
                        const students = await rpcFetch('/listStudents');
                        if (students.length === 0) {
                            alert('No hay estudiantes registrados.');
                            return;
                        }
                        const selected = await showFormModal('Seleccionar estudiante', [
                            { name: 'studentId', label: 'Estudiante', type: 'select', options: students.map(function (student) { return { value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` }; }) }
                        ]);
                        if (!selected) return;
                        const student = students.find(function (item) { return item.studentId === selected.studentId; });
                        const data = await showFormModal('Modificar Estudiante', [
                            { name: 'studentId', label: 'Estudiante', type: 'select', options: [{ value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` }], value: student.studentId },
                            { name: 'name', label: 'Nuevo nombre', value: student.name },
                            { name: 'surname', label: 'Nuevo apellido', value: student.surname },
                            { name: 'dni', label: 'Nuevo DNI', type: 'number', value: student.dni }
                        ]);
                        if (!data) return;
                        const confirmation = await showFormModal('Confirmar modificación', [
                            { name: 'name', label: 'Nombre resultante', value: data.name, readOnly: true },
                            { name: 'surname', label: 'Apellido resultante', value: data.surname, readOnly: true },
                            { name: 'dni', label: 'DNI resultante', value: data.dni, readOnly: true }
                        ], 'Confirmar cambios');
                        if (!confirmation) return;
                        const res = await rpcFetch('/modifyStudent', data);
                        menu.printResult({ message: 'Estudiante modificado correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnDeleteStudent').onclick = async function () {
                    try {
                        const students = await rpcFetch('/listStudents');
                        if (students.length === 0) {
                            alert('No hay estudiantes registrados.');
                            return;
                        }
                        const data = await showFormModal('Eliminar Estudiante', [
                            { name: 'studentId', label: 'Estudiante', type: 'select', options: students.map(function (student) { return { value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` }; }) }
                        ]);
                        if (!data) return;
                        const confirmation = await showFormModal('Confirmar baja', [
                            { name: 'confirm', label: 'Escribí BAJA para confirmar', type: 'text' }
                        ]);
                        if (!confirmation || confirmation.confirm !== 'BAJA') return;
                        const res = await rpcFetch('/deleteStudent', data);
                        menu.printResult({ message: 'Estudiante eliminado correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnListCourses').onclick = async function () {
                    try {
                        const courses = await rpcFetch('/listCourses');
                        menu.printResult({ cursos: courses });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnNewCourse').onclick = async function () {
                    try {
                        const users = await rpcFetch('/listUsers');
                        const professors = users.filter(function (user) { return user.role === 'Docente' && user.status === 'enabled'; });
                        if (professors.length === 0) {
                            alert('Debe existir al menos un docente habilitado.');
                            return;
                        }
                        const data = await showFormModal('Crear Curso o Comisión', [
                            { name: 'name', label: 'Nombre (Ej: Matemática 2 - Comisión A)' },
                            { name: 'professorId', label: 'Docente', type: 'select', options: professors.map(function (user) { return { value: user.userId, text: user.username }; }) },
                            { name: 'startDate', label: 'Fecha de inicio', type: 'date' },
                            { name: 'endDate', label: 'Fecha de fin', type: 'date' }
                        ]);
                        if (!data) return;
                        const res = await rpcFetch('/newCourse', data);
                        menu.printResult({ message: 'Curso creado correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnModifyCourse').onclick = async function () {
                    try {
                        const [courses, users] = await Promise.all([
                            rpcFetch('/listCourses'),
                            rpcFetch('/listUsers')
                        ]);
                        const professors = users.filter(function (user) { return user.role === 'Docente' && user.status === 'enabled'; });
                        if (courses.length === 0 || professors.length === 0) {
                            alert('Debe existir al menos un curso y un docente habilitado.');
                            return;
                        }
                        const selected = await showFormModal('Seleccionar Curso', [
                            { name: 'courseId', label: 'Curso', type: 'select', options: courses.map(function (course) { return { value: course.courseId, text: course.name }; }) }
                        ]);
                        if (!selected) return;
                        const course = courses.find(function (item) { return item.courseId === selected.courseId; });
                        const data = await showFormModal('Modificar Curso', [
                            { name: 'courseId', label: 'Curso', type: 'select', options: [{ value: course.courseId, text: course.name }], value: course.courseId },
                            { name: 'name', label: 'Nombre del curso', value: course.name },
                            { name: 'professorId', label: 'Docente', type: 'select', options: professors.map(function (user) { return { value: user.userId, text: user.username }; }), value: course.professorId },
                            { name: 'startDate', label: 'Fecha de inicio', type: 'date', value: course.startDate },
                            { name: 'endDate', label: 'Fecha de fin', type: 'date', value: course.endDate }
                        ]);
                        if (!data) return;
                        const res = await rpcFetch('/modifyCourse', data);
                        menu.printResult({ message: 'Curso modificado correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                async function getCourseAndStudentOptions() {
                    const [courses, students] = await Promise.all([
                        rpcFetch('/listCourses'),
                        rpcFetch('/listStudents')
                    ]);
                    return {
                        courses,
                        students,
                        courseOptions: courses.map(function (course) { return { value: course.courseId, text: `${course.name} (${formatDataValue(course.startDate)} a ${formatDataValue(course.endDate)})` }; }),
                        studentOptions: students.map(function (student) { return { value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` }; })
                    };
                }

                document.getElementById('btnEnrollStudent').onclick = async function () {
                    try {
                        const { courseOptions, studentOptions } = await getCourseAndStudentOptions();
                        if (courseOptions.length === 0 || studentOptions.length === 0) {
                            alert('Debe existir al menos un curso y un estudiante.');
                            return;
                        }
                        const data = await showFormModal('Inscribir Estudiante en Curso', [
                            { name: 'courseId', label: 'Curso', type: 'select', options: courseOptions },
                            { name: 'studentId', label: 'Estudiante', type: 'select', options: studentOptions }
                        ]);
                        if (!data) return;
                        const res = await rpcFetch('/enrollStudent', data);
                        menu.printResult({ message: 'Estudiante inscrito correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnRemoveEnrollment').onclick = async function () {
                    try {
                        const { courseOptions } = await getCourseAndStudentOptions();
                        const courseSelection = await showFormModal('Seleccionar curso', [
                            { name: 'courseId', label: 'Curso', type: 'select', options: courseOptions }
                        ]);
                        if (!courseSelection) return;
                        const enrolled = await rpcFetch('/getStudentsFromCourse', courseSelection);
                        const studentOptions = enrolled.students.map(function (student) {
                            return { value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` };
                        });
                        if (studentOptions.length === 0) {
                            alert('No hay estudiantes inscriptos en este curso.');
                            return;
                        }
                        const data = await showFormModal('Desinscribir Estudiante', [
                            { name: 'courseId', label: 'Curso', type: 'select', options: courseOptions, value: courseSelection.courseId },
                            { name: 'studentId', label: 'Estudiante', type: 'select', options: studentOptions }
                        ]);
                        if (!data) return;
                        const res = await rpcFetch('/removeStudentFromCourse', data);
                        menu.printResult({ message: 'Estudiante desinscrito correctamente', ...res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnListCourseStudents').onclick = async function () {
                    try {
                        const { courseOptions } = await getCourseAndStudentOptions();
                        const data = await showFormModal('Consultar Alumnos del Curso', [
                            { name: 'courseId', label: 'Curso', type: 'select', options: courseOptions }
                        ]);
                        if (!data) return;
                        const result = await rpcFetch('/getStudentsFromCourse', data);
                        menu.printResult({ alumnos: result.students });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnNewCalendar').onclick = async function () {
                    const data = await showFormModal('Configurar Calendario Académico', [
                        { name: 'academicYear', label: 'Ciclo lectivo', type: 'number' },
                        { name: 'startDate', label: 'Fecha de inicio', type: 'date' },
                        { name: 'endDate', label: 'Fecha de fin', type: 'date' },
                        { name: 'holidays', label: 'Feriados (DD-MM-AAAA separados por coma)', placeholder: '25-05-2026, 09-07-2026' }
                    ]);
                    if (!data) return;
                    data.academicYear = Number(data.academicYear);
                    try {
                        data.holidays = data.holidays.split(',')
                            .map(function (date) { return date.trim(); })
                            .filter(Boolean)
                            .map(normalizeHolidayDate);
                        const res = await rpcFetch('/newAcademicCalendar', data);
                        menu.printResult({ message: 'Calendario configurado correctamente', calendario: res });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnListCalendars').onclick = async function () {
                    try {
                        const calendars = await rpcFetch('/listAcademicCalendars');
                        menu.printResult({ calendarios: calendars });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnTeacherListCourses').onclick = async function () {
                    try {
                        const courses = await rpcFetch('/listCourses');
                        menu.printResult({ misCursos: courses });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnTakeAttendance').onclick = async function () {
                    try {
                        const courses = await rpcFetch('/listCourses');
                        if (courses.length === 0) {
                            alert('No tiene cursos asignados.');
                            return;
                        }
                        const selection = await showFormModal('Seleccionar Clase', [
                            { name: 'courseId', label: 'Curso', type: 'select', options: courses.map(function (course) { return { value: course.courseId, text: course.name }; }) },
                            { name: 'date', label: 'Fecha de la clase', type: 'date' }
                        ]);
                        if (!selection) return;

                        const roster = await rpcFetch('/getAttendanceRoster', selection);
                        if (roster.students.length === 0) {
                            alert('El curso no tiene estudiantes inscriptos.');
                            return;
                        }
                        const course = courses.find(function (item) { return item.courseId === selection.courseId; });
                        const attendanceReport = await rpcFetch('/getAttendanceReport', {
                            courseId: selection.courseId
                        });
                        const attendance = await showAttendanceModal(
                            selection.courseId,
                            course.name,
                            selection.date,
                            roster.students,
                            attendanceReport.sessions.map(function (session) { return session.date; })
                        );
                        if (!attendance) return;
                        const result = await rpcFetch('/saveAttendance', {
                            courseId: selection.courseId,
                            date: attendance.date,
                            records: attendance.records
                        });
                        menu.printResult({ message: 'Asistencia guardada correctamente', ...result });
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                const showAttendanceReport = async function () {
                    try {
                        const courses = await rpcFetch('/listCourses');
                        if (courses.length === 0) {
                            alert('No hay cursos disponibles.');
                            return;
                        }
                        const selection = await showFormModal('Consultar Asistencias', [
                            { name: 'courseId', label: 'Curso', type: 'select', options: courses.map(function (course) { return { value: course.courseId, text: course.name }; }) }
                        ]);
                        if (!selection) return;
                        const report = await rpcFetch('/getAttendanceReport', selection);
                        menu.printAttendanceReport(report);
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

                document.getElementById('btnAttendanceReport').onclick = showAttendanceReport;
                document.getElementById('btnTeacherAttendanceReport').onclick = showAttendanceReport;

                document.getElementById('btnNewStudent').onclick = async function () {
                    const data = await showFormModal('Nuevo Estudiante', [
                        { name: 'name', label: 'Nombre' },
                        { name: 'surname', label: 'Apellido' },
                        { name: 'dni', label: 'DNI', type: 'number' }
                    ]);
                    if (!data) return;
                    try {
                        const res = await rpcFetch('/newStudent', data);
                        menu.printResult(res);
                        notify('Estudiante registrado con éxito.', 'success', 'Operación completada');
                    } catch (e) { alert(`Error: ${e.detail}`); }
                };

            }
        }

        customElements.define('main-menu', Menu);

        function main() {
            document.body.appendChild(new Menu());
        }

        window.onload = main;
