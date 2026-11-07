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

