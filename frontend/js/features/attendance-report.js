

Object.assign(Menu.prototype, {
    clearAttendanceReport() {
        const reportCard = document.getElementById('attendanceReportCard');
        const tableContainer = document.getElementById('attendanceReportTable');
        const reportTitle = document.getElementById('attendanceReportTitle');
        while (tableContainer.firstChild) {
            tableContainer.removeChild(tableContainer.firstChild);
        }
        reportTitle.textContent = 'Reporte de asistencia';
        reportCard.style.display = 'none';
    },

    printAttendanceReport(report, dateRange = {}) {
        const reportCard = document.getElementById('attendanceReportCard');
        const tableContainer = document.getElementById('attendanceReportTable');
        const reportTitle = document.getElementById('attendanceReportTitle');
        while (tableContainer.firstChild) {
            tableContainer.removeChild(tableContainer.firstChild);
        }
        reportTitle.textContent = `Reporte de asistencia - ${report.course.name}`;

        const filters = createElement('div', { className: 'attendance-report-filters' });

        // Períodos académicos (cuatrimestrales) calculados a partir de las fechas reales del curso.
        const periodOptions = this.buildAttendancePeriods(report.sessions.map(function (session) {
            return session.date;
        }));
        const selectedPeriodKey = dateRange.period || '';

        if (selectedPeriodKey && !dateRange.startDate && !dateRange.endDate) {
            const selectedPeriod = periodOptions.find(function (period) {
                return period.key === selectedPeriodKey;
            });
            if (selectedPeriod) {
                dateRange = Object.assign({}, dateRange, {
                    startDate: selectedPeriod.start,
                    endDate: selectedPeriod.end
                });
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
        const activePeriod = periodOptions.find(function (period) {
            return period.key === selectedPeriodKey;
        });
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
                .map(function (session) {
                    return student.attendanceByDate[session.date];
                })
                .filter(Boolean);
            const present = records.filter(function (record) {
                return record.status === 'present';
            }).length;
            const late = records.filter(function (record) {
                return record.status === 'late';
            }).length;

            studentMetrics.set(student.studentId, {
                present,
                late,
                absent: records.filter(function (record) {
                    return record.status === 'absent';
                }).length,
                earlyDepartures: records.filter(function (record) {
                    return record.earlyDeparture;
                }).length,
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
        table.className = 'report-table compact';
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
            textContent: 'Leyenda: P = presente · T = tarde · A = ausente · * = retiro anticipado. Encabezados de fecha en formato día/mes. Deslizá la planilla para ver todas las fechas.'
        }));

        // Lista de clases accionable para celular: una línea por fecha con
        // los conteos de la clase y acceso al formulario de asistencia.
        const classList = createElement('div', { className: 'attendance-class-list' });
        classList.appendChild(createElement('p', {
            className: 'attendance-class-hint',
            textContent: 'Tocá una clase para tomar o editar la asistencia. P = presentes · A = ausentes · T = tardes · R = retiros.'
        }));

        const self = this;
        const openClass = async function (session) {
            if (!report.course.courseId) {
                alert('No se pudo identificar el curso para editar la asistencia.');
                return;
            }
            try {
                const roster = await rpcFetch('/getAttendanceRoster', {
                    courseId: report.course.courseId,
                    date: session.date
                });
                if (!roster.students.length) {
                    alert('El curso no tiene estudiantes inscriptos.');
                    return;
                }

                const attendance = await showAttendanceModal(
                    report.course.courseId,
                    report.course.name,
                    session.date,
                    roster.students,
                    report.sessions.map(function (item) { return item.date; })
                );
                if (!attendance) return;

                await rpcFetch('/saveAttendance', {
                    courseId: report.course.courseId,
                    date: attendance.date,
                    records: attendance.records
                });

                const refreshed = await rpcFetch('/getAttendanceReport', {
                    courseId: report.course.courseId
                });
                self.printAttendanceReport(refreshed, {
                    period: selectedPeriodKey,
                    startDate: startInput.value,
                    endDate: endInput.value,
                    studentQuery: studentSearch.value,
                    filtersOpen: !filters.classList.contains('collapsed'),
                    page: 1
                });
            } catch (e) {
                notify(e.detail || 'No se pudo cargar la asistencia.', 'error', 'No se pudo completar');
            }
        };

        filteredSessions.forEach(function (session) {
            const counts = { present: 0, absent: 0, late: 0, early: 0, unmarked: 0 };
            filteredStudents.forEach(function (student) {
                const record = student.attendanceByDate[session.date];
                if (!record) {
                    counts.unmarked++;
                    return;
                }
                if (record.status === 'present') counts.present++;
                else if (record.status === 'absent') counts.absent++;
                else if (record.status === 'late') counts.late++;
                if (record.earlyDeparture) counts.early++;
            });

            const dateLabel = session.date.split('-').reverse().join('/');
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'attendance-class-row';
            row.setAttribute('aria-label', `Abrir asistencia del ${dateLabel}`);

            const info = createElement('span', { className: 'attendance-class-info' });
            info.appendChild(createElement('span', {
                className: 'attendance-class-date',
                textContent: dateLabel
            }));

            const meta = createElement('span', { className: 'attendance-class-meta' });
            [
                ['present', 'P', counts.present],
                ['absent', 'A', counts.absent],
                ['late', 'T', counts.late],
                ['early', 'R', counts.early],
                ['empty', 'Sin marcar', counts.unmarked]
            ].forEach(function (item) {
                if (!item[2]) return;
                meta.appendChild(createElement('span', {
                    className: `attendance-class-count ${item[0]}`,
                    textContent: `${item[1]} ${item[2]}`
                }));
            });
            info.appendChild(meta);

            const action = createElement('span', { className: 'attendance-class-action' });
            const chevron = createElement('span', { className: 'material-symbol', textContent: 'chevron_right' });
            chevron.setAttribute('aria-hidden', 'true');
            action.append(createElement('span', { textContent: 'Abrir' }), chevron);

            row.append(info, action);
            row.addEventListener('click', function () {
                openClass(session);
            });
            classList.appendChild(row);
        });
        tableContainer.appendChild(classList);

        reportCard.style.display = 'block';
    },

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
});

function ensureAttendanceReportLanding() {
    const reportCard = document.getElementById('attendanceReportCard');
    const tableContainer = document.getElementById('attendanceReportTable');
    if (!reportCard || !tableContainer) return;

    // Si ya hay un reporte o un estado vacío, no se reemplaza.
    if (tableContainer.childElementCount > 0) return;

    const isTeacher = currentRole === 'Docente';
    const empty = createElement('div', { className: 'attendance-report-empty' });

    const icon = createElement('span', {
        className: 'material-symbol',
        textContent: 'analytics'
    });
    icon.setAttribute('aria-hidden', 'true');

    const copy = createElement('div', { className: 'attendance-report-empty-copy' });
    copy.append(
        createElement('strong', {
            textContent: isTeacher
                ? 'Consultá la asistencia de tus cursos'
                : 'Consultá la asistencia de un curso'
        }),
        createElement('p', {
            textContent: isTeacher
                ? 'Elegí uno de tus cursos para ver la planilla, los conteos por fecha y el porcentaje de cada alumno.'
                : 'Elegí un curso para ver la planilla, los conteos por fecha y el porcentaje de cada estudiante.'
        })
    );

    const action = createElement('button', {
        type: 'button',
        className: 'attendance-report-empty-action',
        textContent: 'Elegir curso'
    });
    action.addEventListener('click', function () {
        const target = document.getElementById(
            isTeacher ? 'btnTeacherAttendanceReport' : 'btnAttendanceReport'
        );
        if (target) target.click();
    });

    empty.append(icon, copy, action);
    tableContainer.appendChild(empty);
    reportCard.style.display = 'block';
}

