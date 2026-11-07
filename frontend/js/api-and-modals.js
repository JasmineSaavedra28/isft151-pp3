const host = 'http://localhost:3000';
        let currentUserId = null;
        let authSessionToken = null;

        function notify(message, type = 'success', title = 'Información') {
            const region = document.getElementById('notificationRegion');
            if (!region) return;
            const activeDialog = document.getElementById('formModal');
            const inDialog = Boolean(activeDialog && activeDialog.open);
            const notification = document.createElement('div');
            notification.className = `notification ${type}${inDialog ? ' auth-inline-notification' : ''}`;
            const heading = document.createElement('strong');
            heading.textContent = title;
            notification.append(heading, document.createTextNode(message));
            if (inDialog) activeDialog.insertBefore(notification, activeDialog.firstChild);
            else region.appendChild(notification);
            window.setTimeout(function () { notification.remove(); }, 5000);
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


        function showAuthModal() {
            return new Promise(function (resolve) {
                const modal = document.getElementById('formModal');
                const body = document.getElementById('modalBody');
                const title = document.getElementById('modalTitle');
                const submit = document.getElementById('btnSubmitModal');
                const cancel = document.getElementById('btnCancelModal');
                const oldSubmit = submit.textContent;
                title.textContent = 'Ingresar a MiRegistro';
                modal.classList.add('auth-modal');
                body.replaceChildren();

                const intro = document.createElement('p');
                intro.className = 'auth-intro';
                intro.textContent = 'Usá tus credenciales institucionales para continuar.';
                const userGroup = document.createElement('div'); userGroup.className = 'form-group';
                const userLabel = document.createElement('label'); userLabel.textContent = 'Usuario'; userLabel.htmlFor = 'authUser';
                const user = document.createElement('input'); user.id = 'authUser'; user.autocomplete = 'username'; user.placeholder = 'Tu nombre de usuario'; user.required = true;
                userGroup.append(userLabel, user);
                const passGroup = document.createElement('div'); passGroup.className = 'form-group';
                const passLabel = document.createElement('label'); passLabel.textContent = 'Contraseña'; passLabel.htmlFor = 'authPass';
                const passWrap = document.createElement('div'); passWrap.className = 'auth-password-wrap';
                const pass = document.createElement('input'); pass.id = 'authPass'; pass.type = 'password'; pass.autocomplete = 'current-password'; pass.placeholder = 'Tu contraseña'; pass.required = true;
                const reveal = document.createElement('button'); reveal.type = 'button'; reveal.className = 'auth-eye-button'; reveal.setAttribute('aria-label','Mostrar contraseña'); reveal.title = 'Mostrar contraseña';
                const eyeOpen = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
                const eyeClosed = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8"/></svg>';
                reveal.innerHTML = eyeOpen;
                reveal.addEventListener('click', function(){ const visible = pass.type === 'password'; pass.type = visible ? 'text' : 'password'; reveal.innerHTML = visible ? eyeClosed : eyeOpen; reveal.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña'); reveal.title = visible ? 'Ocultar contraseña' : 'Mostrar contraseña'; });
                passWrap.append(pass, reveal); passGroup.append(passLabel, passWrap);
                const forgot = document.createElement('button'); forgot.type = 'button'; forgot.className = 'auth-link'; forgot.textContent = '¿Olvidaste tu contraseña?';
                forgot.addEventListener('click', function(){ notify('La recuperación automática todavía no está conectada al backend. Solicitá al administrador que restablezca tu contraseña.', 'info', 'Recuperación de contraseña'); });
                const separator = document.createElement('div'); separator.className = 'auth-separator'; separator.textContent = 'o continuar con';
                const google = document.createElement('button'); google.type = 'button'; google.className = 'auth-google'; google.disabled = true;
                google.innerHTML = '<span class="auth-google-g">G</span><span>Continuar con Google</span><small>Próximamente</small>';
                google.title = 'Requiere configurar Google OAuth en el backend';
                const foot = document.createElement('div'); foot.className = 'auth-footnote';
                const footText = document.createElement('span'); footText.textContent = '¿No tenés cuenta?';
                const createAccount = document.createElement('button'); createAccount.type = 'button'; createAccount.className = 'auth-create-account'; createAccount.textContent = 'Crear usuario';
                createAccount.addEventListener('click', function(){
                    title.textContent = 'Crear cuenta';
                    body.replaceChildren();
                    const registerIntro = document.createElement('p'); registerIntro.className = 'auth-intro'; registerIntro.textContent = 'Completá tus datos para solicitar una cuenta en MiRegistro.';
                    const fields = document.createElement('div'); fields.className = 'auth-register-fields';
                    function addField(labelText, id, type, placeholder, autocomplete) {
                        const group = document.createElement('div'); group.className = 'form-group';
                        const label = document.createElement('label'); label.htmlFor = id; label.textContent = labelText;
                        const input = document.createElement('input'); input.id = id; input.type = type; input.placeholder = placeholder; input.autocomplete = autocomplete || 'off'; input.required = true;
                        group.append(label, input); fields.appendChild(group); return input;
                    }
                    const fullName = addField('Nombre y apellido', 'registerFullName', 'text', 'Tu nombre completo', 'name');
                    const email = addField('Correo electrónico', 'registerEmail', 'email', 'nombre@institucion.edu.ar', 'email');
                    const newUser = addField('Nombre de usuario', 'registerUser', 'text', 'Elegí un usuario', 'username');
                    const newPass = addField('Crear contraseña', 'registerPass', 'password', 'Mínimo 8 caracteres', 'new-password');
                    const confirmPass = addField('Repetir contraseña', 'registerConfirmPass', 'password', 'Volvé a escribir la contraseña', 'new-password');
                    [newPass, confirmPass].forEach(function(input){ const wrap = document.createElement('div'); wrap.className = 'auth-password-wrap'; input.parentNode.insertBefore(wrap, input); wrap.appendChild(input); const eye = document.createElement('button'); eye.type = 'button'; eye.className = 'auth-eye-button'; eye.setAttribute('aria-label', 'Mostrar contraseña'); eye.innerHTML = eyeOpen; eye.addEventListener('click', function(){ const show = input.type === 'password'; input.type = show ? 'text' : 'password'; eye.innerHTML = show ? eyeClosed : eyeOpen; eye.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña'); }); wrap.appendChild(eye); });
                    const termsLabel = document.createElement('label'); termsLabel.className = 'auth-register-terms';
                    const termsCheck = document.createElement('input'); termsCheck.type = 'checkbox'; termsCheck.required = true;
                    const termsText = document.createElement('span'); termsText.append('Acepto los ');
                    const termsA = document.createElement('a'); termsA.href = 'terminos.html'; termsA.target = '_blank'; termsA.rel = 'noopener'; termsA.textContent = 'Términos y condiciones';
                    const privacyA = document.createElement('a'); privacyA.href = 'privacidad.html'; privacyA.target = '_blank'; privacyA.rel = 'noopener'; privacyA.textContent = 'Política de privacidad';
                    termsText.append(termsA, ' y la ', privacyA, '.'); termsLabel.append(termsCheck, termsText);
                    const back = document.createElement('button'); back.type = 'button'; back.className = 'auth-link auth-back-login'; back.textContent = 'Ya tengo una cuenta · Iniciar sesión';
                    back.addEventListener('click', function(){ title.textContent = 'Ingresar a MiRegistro'; body.replaceChildren(intro, userGroup, passGroup, forgot, separator, google, foot); submit.textContent = 'Iniciar sesión'; });
                    body.append(registerIntro, fields, termsLabel, back);
                    submit.textContent = 'Crear cuenta';
                    submit.onclick = function(){
                        if (!fullName.value.trim() || !email.validity.valid || !newUser.value.trim() || !newPass.value || !confirmPass.value) { notify('Completá todos los campos con información válida.', 'error', 'Revisá el formulario'); return; }
                        if (newPass.value.length < 8) { notify('La contraseña debe tener al menos 8 caracteres.', 'error', 'Contraseña no válida'); return; }
                        if (newPass.value !== confirmPass.value) { notify('Las contraseñas no coinciden.', 'error', 'Revisá la contraseña'); return; }
                        if (!termsCheck.checked) { notify('Para crear la cuenta tenés que aceptar los términos y la política de privacidad.', 'error', 'Falta aceptar los documentos'); return; }
                        notify('El formulario está preparado, pero el registro público todavía debe conectarse a un endpoint seguro del backend. No se creó ninguna cuenta.', 'info', 'Registro pendiente de conexión');
                    };
                });
                foot.append(footText, createAccount);
                body.append(intro, userGroup, passGroup, forgot, separator, google, foot);
                cancel.textContent = 'Volver';
                const actions = modal.querySelector('.dialog-actions');
                if (actions) actions.classList.add('auth-dialog-actions');
                submit.textContent = 'Iniciar sesión';
                const cleanup = function(){ submit.onclick = null; cancel.onclick = null; submit.textContent = oldSubmit; cancel.textContent = 'Cancelar'; modal.classList.remove('auth-modal'); const actions = modal.querySelector('.dialog-actions'); if (actions) actions.classList.remove('auth-dialog-actions'); modal.close(); };
                submit.onclick = function(){
                    if (!user.value.trim() || !pass.value) { notify('Completá usuario y contraseña.', 'error'); return; }
                    const result = { user: user.value.trim(), pass: pass.value };
                    cleanup(); resolve(result);
                };
                cancel.onclick = function(){ cleanup(); resolve(null); };
                modal.addEventListener('close', function onClose(){ modal.removeEventListener('close', onClose); if (modal.classList.contains('auth-modal')) { modal.classList.remove('auth-modal'); submit.onclick=null; cancel.onclick=null; submit.textContent=oldSubmit; cancel.textContent='Cancelar'; const actions = modal.querySelector('.dialog-actions'); if (actions) actions.classList.remove('auth-dialog-actions'); resolve(null); } });
                modal.showModal(); user.focus();
            });
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
                    if (f.type === 'checkbox' && f.legalLinks) {
                        label.append(' ');
                        const termsLink = document.createElement('a'); termsLink.href = 'terminos.html'; termsLink.target = '_blank'; termsLink.rel = 'noopener'; termsLink.textContent = 'Términos';
                        const privacyLink = document.createElement('a'); privacyLink.href = 'privacidad.html'; privacyLink.target = '_blank'; privacyLink.rel = 'noopener'; privacyLink.textContent = 'Privacidad';
                        label.append(termsLink, ' · ', privacyLink);
                    }
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
                        if (f.type === 'password') {
                            const wrap = document.createElement('div'); wrap.className = 'auth-password-wrap';
                            const eye = document.createElement('button'); eye.type = 'button'; eye.className = 'auth-eye-button'; eye.setAttribute('aria-label', 'Mostrar contraseña');
                            const openSvg = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
                            const closedSvg = '<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8"/></svg>';
                            eye.innerHTML = openSvg; eye.addEventListener('click', function(){ const show = input.type === 'password'; input.type = show ? 'text' : 'password'; eye.innerHTML = show ? closedSvg : openSvg; eye.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña'); });
                            wrap.append(input, eye); group.appendChild(wrap);
                        } else group.appendChild(input);
                    }
                    if (f.type === 'checkbox') input.checked = Boolean(f.value);
                    if (f.required) input.required = true;
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
                    const missing = fields.find(function (f) { return f.required && (f.type === 'checkbox' ? !inputs[f.name].checked : !String(inputs[f.name].value || '').trim()); });
                    if (missing) { notify(missing.type === 'checkbox' ? 'Debés aceptar los términos y la política de privacidad para crear el usuario.' : 'Completá el campo ' + missing.label + '.', 'error'); inputs[missing.name].focus(); return; }
                    const mismatch = fields.find(function (f) { return f.matchWith && inputs[f.name].value !== inputs[f.matchWith].value; });
                    if (mismatch) { notify('Las contraseñas no coinciden.', 'error'); inputs[mismatch.name].focus(); return; }
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

