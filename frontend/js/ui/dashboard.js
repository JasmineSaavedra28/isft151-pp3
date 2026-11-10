

const dashboardState = {
    requestId: 0
};

function getDashboardToday() {
    const now = new Date();
    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
    ].join('-');
}

function formatDashboardDate(date) {
    const value = new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date || new Date());
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDashboardShortDate(value) {
    if (!value) return '—';
    return value.slice(8, 10) + '/' + value.slice(5, 7);
}

function formatDashboardNumber(value) {
    return new Intl.NumberFormat('es-AR').format(Number(value) || 0);
}

function formatDashboardPercent(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
    return new Intl.NumberFormat('es-AR', {
        maximumFractionDigits: 1
    }).format(Number(value));
}

function createDashboardIcon(name, className = 'material-symbol') {
    const icon = createElement('span', { className, textContent: name });
    icon.setAttribute('aria-hidden', 'true');
    return icon;
}

function createDashboardOverview() {
    const section = createElement('section', {
        id: 'dashboardOverview',
        className: 'dashboard-overview',
        'aria-labelledby': 'dashboardGreeting'
    });

    const hero = createElement('div', { className: 'dashboard-hero' });
    const heroCopy = createElement('div', { className: 'dashboard-hero-copy' });
    const eyebrow = createElement('span', { className: 'dashboard-eyebrow' });
    eyebrow.append(
        createDashboardIcon('space_dashboard'),
        createElement('span', { textContent: 'Panel principal' })
    );

    const greeting = createElement('h2', { id: 'dashboardGreeting', textContent: 'Hola' });
    const subtitle = createElement('p', {
        id: 'dashboardSubtitle',
        className: 'dashboard-hero-subtitle',
        textContent: 'Revisá el estado general de la institución y accedé a la gestión en un solo lugar.'
    });

    const meta = createElement('div', { className: 'dashboard-hero-meta' });
    meta.append(
        createElement('span', { id: 'dashboardDateChip', className: 'dashboard-date-chip' }),
        createElement('span', { id: 'dashboardRoleChip', className: 'dashboard-role-chip' })
    );

    heroCopy.append(eyebrow, greeting, subtitle, meta);

    const heroActions = createElement('div', {
        id: 'dashboardHeroActions',
        className: 'dashboard-hero-actions'
    });

    hero.append(heroCopy, heroActions);

    const grid = createElement('div', { className: 'dashboard-grid' });

    const attendanceCard = createElement('section', {
        id: 'dashboardAttendanceCard',
        className: 'dashboard-attendance-card',
        'aria-live': 'polite',
        'aria-busy': 'true'
    });

    const kpis = createElement('section', {
        id: 'dashboardKpis',
        className: 'dashboard-kpis',
        'aria-label': 'Indicadores del panel'
    });
    const quickCard = createElement('section', {
        id: 'dashboardQuickCard',
        className: 'dashboard-quick-card',
        'aria-label': 'Accesos rápidos'
    });

    grid.append(attendanceCard, kpis, quickCard);
    section.append(hero, grid);

    updateDashboardHero();
    renderDashboardQuickActions();
    renderDashboardSkeleton();

    return section;
}

function updateDashboardHero() {
    const greeting = document.getElementById('dashboardGreeting');
    const subtitle = document.getElementById('dashboardSubtitle');
    const dateChip = document.getElementById('dashboardDateChip');
    const roleChip = document.getElementById('dashboardRoleChip');
    const actions = document.getElementById('dashboardHeroActions');

    const role = currentRole || '';
    const hour = new Date().getHours();
    const salutation = hour < 12
        ? 'Buenos días'
        : hour < 20
            ? 'Buenas tardes'
            : 'Buenas noches';

    if (greeting) {
        greeting.textContent = currentUserId
            ? `${salutation}, ${currentUserId}`
            : 'Bienvenido a MiRegistro';
    }

    if (subtitle) {
        subtitle.textContent = role === 'Docente'
            ? 'Revisá la asistencia de hoy, tus cursos y el avance de tus alumnos.'
            : 'Revisá el estado general de la institución y accedé a la gestión en un solo lugar.';
    }

    if (dateChip) {
        dateChip.replaceChildren(
            createDashboardIcon('calendar_today'),
            document.createTextNode(formatDashboardDate(new Date()))
        );
    }

    if (roleChip) {
        roleChip.replaceChildren(
            createDashboardIcon('badge'),
            document.createTextNode(role ? `Rol · ${role}` : 'Sin sesión')
        );
    }

    if (actions) {
        actions.replaceChildren();
        getDashboardHeroActions(role).forEach(function (definition) {
            actions.appendChild(createDashboardAction(definition, 'hero'));
        });
    }
}

function getDashboardHeroActions(role) {
    if (role === 'Docente') {
        return [
            {
                label: 'Tomar asistencia',
                icon: 'fact_check',
                description: 'Registrar la clase de hoy',
                primary: true,
                run: function () {
                    clickDashboardButton('btnTakeAttendance');
                }
            },
            {
                label: 'Ver reportes',
                icon: 'analytics',
                description: 'Asistencias por curso',
                run: openDashboardReportPicker
            }
        ];
    }

    if (role === 'Administrador') {
        return [
            {
                label: 'Ver reportes',
                icon: 'analytics',
                description: 'Asistencias por curso',
                primary: true,
                run: openDashboardReportPicker
            },
            {
                label: 'Gestionar cursos',
                icon: 'school',
                description: 'Cursos e inscripciones',
                run: function () {
                    showSection('courseManagementContainer');
                }
            }
        ];
    }

    return [];
}

function getDashboardQuickActions(role) {
    if (role === 'Docente') {
        return [
            {
                label: 'Tomar asistencia',
                icon: 'fact_check',
                description: 'Registrar una clase',
                run: function () {
                    clickDashboardButton('btnTakeAttendance');
                }
            },
            {
                label: 'Mis alumnos',
                icon: 'groups',
                description: 'Ver estudiantes',
                run: function () {
                    showSection('teacherStudentsContainer');
                }
            },
            {
                label: 'Mis cursos',
                icon: 'school',
                description: 'Cursos asignados',
                run: function () {
                    showSection('teacherAttendanceContainer');
                }
            },
            {
                label: 'Reportes',
                icon: 'analytics',
                description: 'Asistencias por curso',
                run: openDashboardReportPicker
            }
        ];
    }

    if (role === 'Administrador') {
        return [
            {
                label: 'Alumnos',
                icon: 'groups',
                description: 'Gestión de estudiantes',
                run: function () {
                    showSection('studentManagementContainer');
                }
            },
            {
                label: 'Cursos',
                icon: 'school',
                description: 'Cursos e inscripciones',
                run: function () {
                    showSection('courseManagementContainer');
                }
            },
            {
                label: 'Reportes',
                icon: 'analytics',
                description: 'Asistencias por curso',
                run: openDashboardReportPicker
            },
            {
                label: 'Calendario',
                icon: 'calendar_month',
                description: 'Ciclo y feriados',
                run: function () {
                    showSection('calendarManagementContainer');
                }
            }
        ];
    }

    return [];
}

function createDashboardAction(definition, variant) {
    const button = createElement('button', {
        type: 'button',
        className: `dashboard-action dashboard-action-${variant}${definition.primary ? ' is-primary' : ''}`
    });

    const copy = createElement('span', { className: 'dashboard-action-copy' });
    copy.append(
        createElement('strong', { textContent: definition.label }),
        createElement('small', { textContent: definition.description })
    );

    button.append(createDashboardIcon(definition.icon), copy);
    button.addEventListener('click', definition.run);
    return button;
}

function clickDashboardButton(id) {
    const button = document.getElementById(id);
    if (button) button.click();
}

function openDashboardReportPicker() {
    showSection('attendanceReportCard');
    clickDashboardButton(currentRole === 'Docente' ? 'btnTeacherAttendanceReport' : 'btnAttendanceReport');
}

function renderDashboardQuickActions() {
    const card = document.getElementById('dashboardQuickCard');
    if (!card) return;

    const header = createElement('div', { className: 'dashboard-quick-head' });
    const copy = createElement('div', { className: 'dashboard-section-title' });
    copy.append(
        createDashboardIcon('bolt'),
        createElement('h3', { textContent: 'Accesos rápidos' })
    );

    const refresh = createElement('button', {
        type: 'button',
        className: 'dashboard-card-refresh',
        'aria-label': 'Actualizar panel',
        title: 'Actualizar panel'
    });
    refresh.appendChild(createDashboardIcon('refresh'));
    refresh.addEventListener('click', refreshDashboard);

    header.append(copy, refresh);

    const grid = createElement('div', { className: 'dashboard-quick-grid' });
    getDashboardQuickActions(currentRole || '').forEach(function (definition) {
        grid.appendChild(createDashboardAction(definition, 'quick'));
    });

    card.replaceChildren(header, grid);
}

function renderDashboardSkeleton() {
    const card = document.getElementById('dashboardAttendanceCard');
    if (card) {
        card.setAttribute('aria-busy', 'true');
        card.replaceChildren(
            createDashboardHeader({
                label: 'CARGANDO',
                className: 'is-loading',
                subtitle: 'Consultando cursos y asistencias'
            })
        );

        const stats = createElement('div', { className: 'dashboard-attendance-stats' });
        for (let index = 0; index < 4; index += 1) {
            stats.appendChild(createElement('div', { className: 'dashboard-skeleton dashboard-skeleton-stat' }));
        }
        card.appendChild(stats);
        card.appendChild(createElement('div', { className: 'dashboard-skeleton dashboard-skeleton-list-title' }));
        for (let index = 0; index < 3; index += 1) {
            card.appendChild(createElement('div', { className: 'dashboard-skeleton dashboard-skeleton-row' }));
        }
    }

    const kpis = document.getElementById('dashboardKpis');
    if (kpis) {
        const header = createElement('div', { className: 'dashboard-section-title' });
        header.append(
            createDashboardIcon('monitoring'),
            createElement('h3', { textContent: 'Resumen general' })
        );

        const grid = createElement('div', { className: 'dashboard-kpi-grid' });
        for (let index = 0; index < 4; index += 1) {
            grid.appendChild(createElement('div', { className: 'dashboard-kpi dashboard-kpi-skeleton' }));
        }

        kpis.replaceChildren(header, grid);
    }
}

async function refreshDashboard() {
    const section = document.getElementById('dashboardOverview');
    if (!section) return;

    const requestId = ++dashboardState.requestId;

    updateDashboardHero();
    renderDashboardQuickActions();
    renderDashboardSkeleton();

    try {
        const data = await loadDashboardData();
        if (requestId !== dashboardState.requestId) return;
        renderDashboardData(data);
    } catch (error) {
        if (requestId !== dashboardState.requestId) return;
        renderDashboardError(error);
    } finally {
        const card = document.getElementById('dashboardAttendanceCard');
        if (card) card.setAttribute('aria-busy', 'false');
    }
}

async function loadDashboardData() {
    const courses = await rpcFetch('/listCourses');
    const courseList = Array.isArray(courses) ? courses : [];

    const reportRequests = courseList.map(function (course) {
        return rpcFetch('/getAttendanceReport', { courseId: course.courseId });
    });

    const studentsRequest = currentRole === 'Administrador'
        ? rpcFetch('/listStudents').catch(function () {
            return null;
        })
        : Promise.resolve(null);

    const results = await Promise.all([
        Promise.allSettled(reportRequests),
        studentsRequest
    ]);

    const reports = results[0]
        .filter(function (result) {
            return result.status === 'fulfilled';
        })
        .map(function (result) {
            return result.value;
        });

    if (courseList.length > 0 && reports.length === 0) {
        const firstFailure = results[0].find(function (result) {
            return result.status === 'rejected';
        });
        throw firstFailure ? firstFailure.reason : new Error('No se pudieron cargar las asistencias.');
    }

    return analyzeDashboardData(courseList, reports, results[1]);
}

function analyzeDashboardData(courses, reports, studentsList) {
    const today = getDashboardToday();
    const reportsByCourse = new Map();

    reports.forEach(function (report) {
        if (report && report.course && report.course.courseId) {
            reportsByCourse.set(report.course.courseId, report);
        }
    });

    const totals = {
        present: 0,
        late: 0,
        absent: 0,
        unmarked: 0,
        marked: 0,
        todayCourses: 0,
        todayStudents: 0
    };
    const uniqueStudents = new Set();
    const courseRows = [];
    let totalSessions = 0;
    let lifetimePresent = 0;
    let lifetimeLate = 0;
    let lifetimeAbsent = 0;

    courses.forEach(function (course) {
        const report = reportsByCourse.get(course.courseId) || {
            course: course,
            sessions: [],
            students: []
        };
        const students = Array.isArray(report.students) ? report.students : [];
        const sessions = Array.isArray(report.sessions) ? report.sessions : [];
        const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
        const todaySession = sessions.find(function (session) {
            return session.date === today;
        }) || null;

        totalSessions += sessions.length;

        students.forEach(function (student) {
            uniqueStudents.add(student.studentId);
            lifetimePresent += Number(student.present) || 0;
            lifetimeLate += Number(student.late) || 0;
            lifetimeAbsent += Number(student.absent) || 0;
        });

        const todayCounts = todaySession ? countDashboardSession(students, today) : null;
        const lastCounts = lastSession ? countDashboardSession(students, lastSession.date) : null;

        if (todayCounts) {
            totals.present += todayCounts.present;
            totals.late += todayCounts.late;
            totals.absent += todayCounts.absent;
            totals.unmarked += todayCounts.unmarked;
            totals.marked += todayCounts.marked;
            totals.todayCourses += 1;
            totals.todayStudents += students.length;
        }

        courseRows.push({
            courseId: course.courseId,
            name: course.name || (report.course && report.course.name) || 'Curso',
            totalStudents: students.length,
            todaySession: todaySession,
            lastSession: lastSession,
            todayCounts: todayCounts,
            lastCounts: lastCounts
        });
    });

    courseRows.sort(function (a, b) {
        if (Boolean(a.todaySession) !== Boolean(b.todaySession)) {
            return a.todaySession ? -1 : 1;
        }

        const aDate = a.lastSession ? a.lastSession.date : '';
        const bDate = b.lastSession ? b.lastSession.date : '';
        if (aDate !== bDate) return bDate.localeCompare(aDate);
        return a.name.localeCompare(b.name, 'es');
    });

    const lifetimeMarked = lifetimePresent + lifetimeLate + lifetimeAbsent;
    const lifetimePercentage = lifetimeMarked > 0
        ? ((lifetimePresent + lifetimeLate) / lifetimeMarked) * 100
        : null;

    const studentCount = Array.isArray(studentsList)
        ? studentsList.length
        : uniqueStudents.size;

    return {
        courses: courses,
        courseRows: courseRows,
        totalSessions: totalSessions,
        studentCount: studentCount,
        totalStudentsInCourses: uniqueStudents.size,
        lifetimePercentage: lifetimePercentage,
        totals: totals,
        hasToday: totals.todayCourses > 0
    };
}

function countDashboardSession(students, date) {
    const counts = {
        present: 0,
        late: 0,
        absent: 0,
        unmarked: 0,
        marked: 0
    };

    students.forEach(function (student) {
        const record = student.attendanceByDate
            ? student.attendanceByDate[date]
            : null;

        if (!record) {
            counts.unmarked += 1;
            return;
        }

        if (record.status === 'present') counts.present += 1;
        else if (record.status === 'late') counts.late += 1;
        else if (record.status === 'absent') counts.absent += 1;
        else counts.unmarked += 1;
    });

    counts.marked = counts.present + counts.late + counts.absent;
    return counts;
}

function renderDashboardData(data) {
    updateDashboardHero();
    renderDashboardQuickActions();
    renderDashboardKpis(data);
    renderDashboardAttendance(data);
}

function createDashboardHeader(options) {
    const header = createElement('div', { className: 'dashboard-card-head' });

    const iconWrap = createElement('span', { className: 'dashboard-card-icon' });
    iconWrap.appendChild(createDashboardIcon('fact_check'));

    const copy = createElement('div', { className: 'dashboard-card-copy' });
    copy.append(
        createElement('h3', { textContent: 'Asistencia de hoy' }),
        createElement('p', {
            textContent: options.subtitle || formatDashboardDate(new Date())
        })
    );

    const actions = createElement('div', { className: 'dashboard-card-head-actions' });
    const status = createElement('span', {
        className: 'dashboard-status ' + (options.className || ''),
        textContent: options.label
    });

    const refresh = createElement('button', {
        type: 'button',
        className: 'dashboard-card-refresh',
        'aria-label': 'Actualizar panel',
        title: 'Actualizar panel'
    });
    refresh.appendChild(createDashboardIcon('refresh'));
    refresh.addEventListener('click', refreshDashboard);

    actions.append(status, refresh);
    header.append(iconWrap, copy, actions);
    return header;
}

function getDashboardAttendanceStatus(data) {
    if (data.courses.length === 0) {
        return { label: 'SIN CURSOS', className: 'is-empty' };
    }

    if (data.hasToday) {
        return data.totals.unmarked > 0
            ? { label: 'PENDIENTE', className: 'is-pending' }
            : { label: 'EN ORDEN', className: 'is-ok' };
    }

    return data.totalSessions > 0
        ? { label: 'SIN CLASES HOY', className: 'is-empty' }
        : { label: 'SIN CLASES', className: 'is-empty' };
}

function renderDashboardAttendance(data) {
    const card = document.getElementById('dashboardAttendanceCard');
    if (!card) return;

    const status = getDashboardAttendanceStatus(data);
    const header = createDashboardHeader({
        label: status.label,
        className: status.className,
        subtitle: data.courses.length > 0
            ? formatDashboardDate(new Date())
            : 'Todavía no hay cursos cargados'
    });

    card.replaceChildren(header);

    if (data.courses.length === 0) {
        card.appendChild(createDashboardEmptyState({
            icon: 'school',
            title: currentRole === 'Docente' ? 'No tenés cursos asignados' : 'Todavía no hay cursos',
            text: currentRole === 'Docente'
                ? 'Cuando el administrador te asigne un curso, va a aparecer acá con su asistencia.'
                : 'Creá el primer curso para empezar a registrar alumnos y asistencias.',
            actionLabel: currentRole === 'Administrador' ? 'Crear curso' : '',
            action: currentRole === 'Administrador'
                ? function () {
                    showSection('courseManagementContainer');
                    clickDashboardButton('btnNewCourse');
                }
                : null
        }));
        return;
    }

    const stats = createElement('div', { className: 'dashboard-attendance-stats' });
    const hasToday = data.hasToday;
    const statDefinitions = [
        {
            icon: 'check_circle',
            label: 'Presentes',
            tone: 'present',
            value: hasToday ? data.totals.present : '—',
            note: hasToday
                ? (data.totals.marked > 0 ? `${data.totals.marked} registros` : 'Sin registros')
                : 'Sin clases hoy'
        },
        {
            icon: 'schedule',
            label: 'Tardanzas',
            tone: 'late',
            value: hasToday ? data.totals.late : '—',
            note: hasToday ? 'llegadas tarde' : 'Sin clases hoy'
        },
        {
            icon: 'cancel',
            label: 'Ausentes',
            tone: 'absent',
            value: hasToday ? data.totals.absent : '—',
            note: hasToday ? 'sin asistencia' : 'Sin clases hoy'
        },
        {
            icon: 'pending_actions',
            label: 'Sin marcar',
            tone: 'unmarked',
            value: hasToday ? data.totals.unmarked : '—',
            note: hasToday ? 'por registrar' : 'Sin clases hoy'
        }
    ];

    statDefinitions.forEach(function (definition) {
        const stat = createElement('div', {
            className: `dashboard-stat ${definition.tone}`
        });
        stat.append(
            createDashboardIcon(definition.icon),
            createElement('small', { textContent: definition.label }),
            createElement('strong', { textContent: definition.value }),
            createElement('span', {
                className: 'dashboard-stat-note',
                textContent: definition.note
            })
        );
        stats.appendChild(stat);
    });

    card.appendChild(stats);

    const courseHead = createElement('div', { className: 'dashboard-course-head' });
    const rowsWithSessions = data.courseRows.filter(function (row) {
        return Boolean(row.lastSession);
    });
    const heading = hasToday
        ? 'Cursos de hoy'
        : (data.totalSessions > 0 ? 'Últimas clases registradas' : 'Cursos');

    courseHead.append(
        createElement('h4', { textContent: heading }),
        createElement('span', {
            textContent: hasToday
                ? `${data.totals.todayCourses} ${data.totals.todayCourses === 1 ? 'curso' : 'cursos'}`
                : `${rowsWithSessions.length} ${rowsWithSessions.length === 1 ? 'curso' : 'cursos'} con clases`
        })
    );

    card.appendChild(courseHead);

    if (data.totalSessions === 0) {
        card.appendChild(createDashboardEmptyState({
            icon: 'event_busy',
            title: 'Aún no hay clases registradas',
            text: 'Cuando tomes la primera asistencia, las clases y sus conteos van a aparecer en este panel.',
            compact: true
        }));
        return;
    }

    const list = createElement('div', { className: 'dashboard-course-list' });
    data.courseRows.forEach(function (row) {
        list.appendChild(createDashboardCourseRow(row));
    });
    card.appendChild(list);
}

function createDashboardCourseRow(row) {
    const isToday = Boolean(row.todaySession);
    const counts = isToday ? row.todayCounts : row.lastCounts;
    const session = isToday ? row.todaySession : row.lastSession;

    const button = createElement('button', {
        type: 'button',
        className: 'dashboard-course-row'
    });
    button.disabled = !session;

    const info = createElement('span', { className: 'dashboard-course-info' });
    const studentLabel = `${row.totalStudents} ${row.totalStudents === 1 ? 'estudiante' : 'estudiantes'}`;
    const dateLabel = isToday
        ? 'Hoy'
        : row.lastSession
            ? `Última clase · ${formatDashboardShortDate(row.lastSession.date)}`
            : 'Sin clases registradas';

    info.append(
        createElement('strong', { textContent: row.name }),
        createElement('span', { textContent: `${dateLabel} · ${studentLabel}` })
    );

    const right = createElement('span', { className: 'dashboard-course-right' });

    if (counts) {
        const chips = createElement('span', { className: 'dashboard-course-chips' });
        [
            ['present', 'P', counts.present],
            ['late', 'T', counts.late],
            ['absent', 'A', counts.absent]
        ].forEach(function (item) {
            chips.appendChild(createElement('span', {
                className: `dashboard-course-chip ${item[0]}`,
                textContent: `${item[1]} ${item[2]}`
            }));
        });
        right.appendChild(chips);

        if (counts.unmarked > 0) {
            right.appendChild(createElement('span', {
                className: 'dashboard-course-chip pending',
                textContent: `${counts.unmarked} sin marcar`
            }));
        }
    }

    const stateIcon = createElement('span', {
        className: 'dashboard-course-state ' + (isToday
            ? (counts && counts.unmarked > 0 ? 'is-pending' : 'is-ok')
            : 'is-neutral')
    });
    stateIcon.appendChild(createDashboardIcon(
        isToday
            ? (counts && counts.unmarked > 0 ? 'pending_actions' : 'check_circle')
            : 'history'
    ));
    right.appendChild(stateIcon);
    right.appendChild(createDashboardIcon('chevron_right', 'material-symbol dashboard-course-chevron'));

    button.append(info, right);

    if (session) {
        button.title = `Abrir el reporte de ${row.name}`;
        button.addEventListener('click', function () {
            openDashboardCourse(row.courseId, button);
        });
    } else {
        button.title = 'Este curso todavía no tiene clases registradas';
    }

    return button;
}

async function openDashboardCourse(courseId, trigger) {
    if (!courseId) return;

    if (trigger) trigger.classList.add('is-loading');

    try {
        const report = await rpcFetch('/getAttendanceReport', { courseId: courseId });
        const menuElement = document.querySelector('main-menu');
        if (menuElement && typeof menuElement.printAttendanceReport === 'function') {
            menuElement.printAttendanceReport(report);
            showSection('attendanceReportCard');
        }
    } catch (error) {
        notify(error.detail || 'No se pudo abrir el reporte.', 'error', 'No se pudo completar');
    } finally {
        if (trigger) trigger.classList.remove('is-loading');
    }
}

function renderDashboardKpis(data) {
    const kpis = document.getElementById('dashboardKpis');
    if (!kpis) return;

    const header = createElement('div', { className: 'dashboard-section-title' });
    header.append(
        createDashboardIcon('monitoring'),
        createElement('h3', { textContent: 'Resumen general' })
    );

    const grid = createElement('div', { className: 'dashboard-kpi-grid' });
    const isTeacher = currentRole === 'Docente';

    const definitions = [
        {
            label: 'Cursos',
            value: formatDashboardNumber(data.courses.length),
            note: isTeacher ? 'asignados a vos' : 'en total',
            icon: 'school',
            tone: 'blue'
        },
        {
            label: 'Alumnos',
            value: formatDashboardNumber(data.studentCount),
            note: isTeacher ? 'tus cursos' : 'activos',
            icon: 'groups',
            tone: 'violet'
        },
        {
            label: 'Asistencia',
            value: data.lifetimePercentage === null
                ? '—'
                : `${formatDashboardPercent(data.lifetimePercentage)}%`,
            note: 'del ciclo',
            icon: 'insights',
            tone: 'green',
            meter: data.lifetimePercentage
        },
        {
            label: 'Clases',
            value: formatDashboardNumber(data.totalSessions),
            note: 'registradas',
            icon: 'event_available',
            tone: 'amber'
        }
    ];

    definitions.forEach(function (definition) {
        const card = createElement('div', {
            className: `dashboard-kpi tone-${definition.tone}`
        });

        const iconWrap = createElement('span', { className: 'dashboard-kpi-icon' });
        iconWrap.appendChild(createDashboardIcon(definition.icon));

        const copy = createElement('span', { className: 'dashboard-kpi-copy' });
        copy.append(
            createElement('span', { className: 'dashboard-kpi-label', textContent: definition.label }),
            createElement('strong', { className: 'dashboard-kpi-value', textContent: definition.value }),
            createElement('small', { className: 'dashboard-kpi-note', textContent: definition.note })
        );

        card.append(iconWrap, copy);

        if (definition.meter !== undefined && definition.meter !== null) {
            const meter = createElement('span', { className: 'dashboard-kpi-meter' });
            const bar = createElement('span', { className: 'dashboard-kpi-meter-bar' });
            bar.style.width = `${Math.max(0, Math.min(100, definition.meter))}%`;
            meter.appendChild(bar);
            card.appendChild(meter);
        }

        grid.appendChild(card);
    });

    kpis.replaceChildren(header, grid);
}

function renderDashboardError(error) {
    const card = document.getElementById('dashboardAttendanceCard');
    const isAuthError = error && error.type === 'AuthError';

    if (card) {
        card.setAttribute('aria-busy', 'false');
        const header = createDashboardHeader({
            label: 'SIN CONEXIÓN',
            className: 'is-error',
            subtitle: 'No se pudieron consultar los datos'
        });
        card.replaceChildren(header, createDashboardEmptyState({
            icon: 'cloud_off',
            title: isAuthError ? 'Tu sesión expiró' : 'No pudimos cargar el panel',
            text: isAuthError
                ? 'Volvé a iniciar sesión para consultar la asistencia de tus cursos.'
                : 'Revisá que el servidor esté disponible y volvé a intentar. Mientras tanto, podés usar el menú para acceder a las secciones.',
            error: true,
            actionLabel: isAuthError ? 'Iniciar sesión' : 'Reintentar',
            action: isAuthError
                ? function () {
                    clickDashboardButton('btnLogin');
                }
                : refreshDashboard
        }));
    }

    const kpis = document.getElementById('dashboardKpis');
    if (kpis) {
        const header = createElement('div', { className: 'dashboard-section-title' });
        header.append(
            createDashboardIcon('monitoring'),
            createElement('h3', { textContent: 'Resumen general' })
        );
        kpis.replaceChildren(header, createDashboardEmptyState({
            icon: 'signal_wifi_off',
            title: 'Sin datos disponibles',
            text: 'Los indicadores se van a mostrar cuando el servidor responda.',
            compact: true,
            error: true
        }));
    }
}

function createDashboardEmptyState(options) {
    const empty = createElement('div', {
        className: 'dashboard-empty'
            + (options.compact ? ' is-compact' : '')
            + (options.error ? ' is-error' : '')
    });

    empty.appendChild(createDashboardIcon(options.icon || 'inbox'));
    empty.appendChild(createElement('strong', { textContent: options.title }));

    if (options.text) {
        empty.appendChild(createElement('p', { textContent: options.text }));
    }

    if (options.actionLabel && options.action) {
        const action = createElement('button', {
            type: 'button',
            className: 'dashboard-empty-action',
            textContent: options.actionLabel
        });
        action.addEventListener('click', options.action);
        empty.appendChild(action);
    }

    return empty;
}
