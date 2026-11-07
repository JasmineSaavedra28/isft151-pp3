/* ============================================================
   Navegación y componentes compartidos
   ============================================================ */

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

const sectionTitles = {
    dashboardOverview: 'Resumen',
    accountPage: 'Mi cuenta',
    adminContainer: 'Usuarios y roles',
    studentManagementContainer: 'Estudiantes',
    courseManagementContainer: 'Cursos e inscripciones',
    calendarManagementContainer: 'Calendario académico',
    teacherAttendanceContainer: 'Mis cursos y asistencia',
    attendanceReportCard: 'Reportes de asistencia'
};

const actionIcons = {
    btnNewUser: 'person_add',
    btnModifyUser: 'edit',
    btnDisableUser: 'toggle_on',
    btnDeleteUser: 'delete',
    btnUpdateUserRole: 'admin_panel_settings',
    btnListUsers: 'list',
    btnNewStudent: 'person_add',
    btnModifyStudent: 'edit',
    btnDeleteStudent: 'delete',
    btnListStudents: 'list',
    btnNewCourse: 'add_box',
    btnModifyCourse: 'edit',
    btnListCourses: 'list',
    btnEnrollStudent: 'person_add',
    btnRemoveEnrollment: 'person_remove',
    btnListCourseStudents: 'groups',
    btnAttendanceReport: 'fact_check',
    btnNewCalendar: 'calendar_add_on',
    btnListCalendars: 'calendar_month',
    btnTeacherListCourses: 'school',
    btnTakeAttendance: 'fact_check',
    btnTeacherAttendanceReport: 'analytics'
};

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
        if (button.dataset.targetId === targetId) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
    });

    document.querySelectorAll('.sidebar-nav button[data-target-id]').forEach(function (button) {
        if (button.dataset.targetId === targetId) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
    });

    const contextTitle = document.querySelector('.header-context-title');
    if (contextTitle) contextTitle.textContent = sectionTitles[targetId] || 'MiRegistro';
    document.title = `MiRegistro · ${sectionTitles[targetId] || 'Gestión escolar'}`;

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
            if (!authSessionToken) {
                const loginButton = document.getElementById('btnLogin');
                if (loginButton) loginButton.click();
                closeMobileMenu();
                closeMobileAccountPanel();
                return;
            }
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
            ? new Set(['dashboardOverview', 'teacherAttendanceContainer', 'attendanceReportCard'])
            : new Set();

    document.querySelectorAll('.sidebar-nav button[data-target-id]').forEach(function (button) {
        button.style.display = !allowedSections || allowedSections.has(button.dataset.targetId)
            ? 'flex'
            : 'none';
    });

    const sidebarGuest = document.querySelector('.sidebar-guest');
    if (sidebarGuest) sidebarGuest.hidden = Boolean(role);

    const sidebarLabel = document.querySelector('.sidebar-label');
    if (sidebarLabel) sidebarLabel.hidden = !role;

    if (!role) {
        const contextTitle = document.querySelector('.header-context-title');
        if (contextTitle) contextTitle.textContent = 'Bienvenido';
    }

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
        const requiresLogin = !role;
        const permitted = !requiresLogin && (!allowedSections || allowedSections.has(targetId));
        button.disabled = !requiresLogin && !permitted;
        button.setAttribute('aria-disabled', String(button.disabled));
        button.title = button.disabled
            ? 'No disponible para tu rol'
            : (requiresLogin ? 'Iniciá sesión para acceder' : button.getAttribute('aria-label'));
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

function createCard(id, title, buttonDefinitions, style = '', icon = 'apps', description = '') {
    const card = createElement('div', { id, className: 'card', style });

    const header = createElement('div', { className: 'card-header' });
    const iconElement = createElement('span', { className: 'material-symbol card-icon', textContent: icon });
    iconElement.setAttribute('aria-hidden', 'true');

    const copy = createElement('div', { className: 'card-copy' });
    copy.appendChild(createElement('h3', { textContent: title }));
    if (description) {
        copy.appendChild(createElement('p', { className: 'card-description', textContent: description }));
    }

    header.append(iconElement, copy);
    card.appendChild(header);

    const actions = createElement('div', { className: 'card-actions' });
    buttonDefinitions.forEach(function (definition) {
        const button = createButton(definition[0], definition[1], definition[2]);
        const iconName = actionIcons[definition[0]];
        if (iconName) {
            const actionIcon = createElement('span', { className: 'material-symbol', textContent: iconName });
            actionIcon.setAttribute('aria-hidden', 'true');
            button.prepend(actionIcon);
        }
        actions.appendChild(button);
    });
    card.appendChild(actions);

    return card;
}
