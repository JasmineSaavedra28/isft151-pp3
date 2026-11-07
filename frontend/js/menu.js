/* ============================================================
   Menú principal · estructura de la aplicación
   Los manejadores de cada sección viven en js/features/.
   ============================================================ */

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
        sidebarNav.appendChild(createNavItem('dashboardOverview', 'home', 'Resumen'));
        sidebarNav.appendChild(createNavItem('adminContainer', 'manage_accounts', 'Usuarios'));
        sidebarNav.appendChild(createNavItem('studentManagementContainer', 'groups', 'Estudiantes'));
        sidebarNav.appendChild(createNavItem('courseManagementContainer', 'school', 'Cursos'));
        sidebarNav.appendChild(createNavItem('calendarManagementContainer', 'calendar_month', 'Calendario'));
        sidebarNav.appendChild(createNavItem('teacherAttendanceContainer', 'fact_check', 'Asistencias'));
        sidebarNav.appendChild(createNavItem('attendanceReportCard', 'analytics', 'Reportes'));
        sidebar.appendChild(sidebarNav);

        const sidebarGuest = createElement('div', { className: 'sidebar-guest' });
        sidebarGuest.append(
            createElement('span', { className: 'material-symbol sidebar-guest-icon', textContent: 'lock' }),
            createElement('strong', { textContent: 'Acceso institucional' }),
            createElement('p', { textContent: 'Iniciá sesión para ver las secciones de gestión de tu institución.' })
        );
        const sidebarGuestButton = createButton('sidebarLoginButton', 'Ingresar');
        sidebarGuestButton.addEventListener('click', function () {
            document.getElementById('btnLogin').click();
        });
        sidebarGuest.appendChild(sidebarGuestButton);
        sidebar.appendChild(sidebarGuest);

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

        const headerContext = createElement('div', { className: 'header-context' });
        headerContext.append(
            createElement('span', { className: 'header-context-kicker', textContent: 'MiRegistro' }),
            createElement('h2', { className: 'header-context-title', textContent: 'Resumen' })
        );

        header.append(heading, headerContext);

        const headerActions = createElement('div', { className: 'header-actions' });
        headerActions.appendChild(createElement('span', {
            id: 'userStatus',
            textContent: '',
            className: 'user-status'
        }));
        headerActions.appendChild(createButton('btnLogin', 'Iniciar Sesión'));
        headerActions.appendChild(createButton('btnLogout', 'Cerrar Sesión', true));
        headerActions.lastChild.style.display = 'none';

        const headerMenu = createElement('div', { className: 'header-account-menu', id: 'headerAccountMenu' });
        headerMenu.hidden = true;
        [
            ['dashboardOverview', 'Inicio'],
            ['adminContainer', 'Administración'],
            ['studentManagementContainer', 'Estudiantes'],
            ['courseManagementContainer', 'Cursos'],
            ['calendarManagementContainer', 'Calendario']
        ].forEach(function (item) {
            const option = createButton('', item[1]);
            option.dataset.accountTarget = item[0];
            option.addEventListener('click', function () {
                showSection(item[0]);
                headerMenu.hidden = true;
            });
            headerMenu.appendChild(option);
        });

        const menuLogout = createButton('headerMenuLogout', 'Cerrar sesión', true);
        menuLogout.addEventListener('click', function () {
            document.getElementById('btnLogout').click();
            headerMenu.hidden = true;
        });
        headerMenu.appendChild(menuLogout);
        headerActions.appendChild(headerMenu);
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

        const accountPage = createElement('section', { id: 'accountPage', className: 'card account-page', style: 'display:none;' });
        accountPage.appendChild(createElement('span', { className: 'section-kicker', textContent: 'Mi cuenta' }));
        accountPage.appendChild(createElement('h2', { id: 'accountPageTitle', textContent: 'Tu cuenta' }));
        accountPage.appendChild(createElement('p', { id: 'accountPageDescription', textContent: 'Iniciá sesión para acceder a tu cuenta institucional.' }));

        const accountInfo = createElement('div', { className: 'account-page-info' });
        accountInfo.append(
            createElement('p', { id: 'accountPageUser', textContent: 'Estado: sin iniciar sesión' }),
            createElement('p', { id: 'accountPageRole', textContent: 'Rol: —' })
        );

        const accountLogin = createButton('accountPageLogin', 'Iniciar sesión');
        accountLogin.addEventListener('click', function () {
            document.getElementById('btnLogin').click();
        });
        accountPage.append(accountInfo, accountLogin);
        actionContainer.appendChild(accountPage);

        actionContainer.appendChild(createCard('adminContainer', 'Administración', [
            ['btnNewUser', 'Agregar Usuario / Rol'],
            ['btnModifyUser', 'Modificar Usuario'],
            ['btnDisableUser', 'Habilitar / Deshabilitar Usuario'],
            ['btnDeleteUser', 'Eliminar Usuario', true],
            ['btnUpdateUserRole', 'Modificar Rol'],
            ['btnListUsers', 'Listar Usuarios']
        ], 'display: none;', 'manage_accounts', 'Gestioná usuarios, roles y permisos de acceso.'));

        actionContainer.appendChild(createCard('studentManagementContainer', 'Gestión de Estudiantes', [
            ['btnNewStudent', 'Registrar Estudiante'],
            ['btnModifyStudent', 'Modificar Estudiante'],
            ['btnDeleteStudent', 'Eliminar Estudiante', true],
            ['btnListStudents', 'Listar Estudiantes']
        ], 'display: none;', 'groups', 'Registrá y mantené actualizada la información de estudiantes.'));

        actionContainer.appendChild(createCard('courseManagementContainer', 'Cursos e inscripciones', [
            ['btnNewCourse', 'Crear Curso'],
            ['btnModifyCourse', 'Modificar Curso'],
            ['btnListCourses', 'Listar Cursos'],
            ['btnEnrollStudent', 'Inscribir Estudiante'],
            ['btnRemoveEnrollment', 'Desinscribir Estudiante', true],
            ['btnListCourseStudents', 'Ver Alumnos del Curso'],
            ['btnAttendanceReport', 'Ver Asistencias']
        ], 'display: none;', 'school', 'Organizá cursos, inscripciones y consultá asistencias.'));

        actionContainer.appendChild(createCard('calendarManagementContainer', 'Calendario académico', [
            ['btnNewCalendar', 'Configurar Calendario'],
            ['btnListCalendars', 'Listar Calendarios']
        ], 'display: none;', 'calendar_month', 'Definí el ciclo lectivo y los feriados del período.'));

        actionContainer.appendChild(createCard('teacherAttendanceContainer', 'Mis cursos y asistencia', [
            ['btnTeacherListCourses', 'Ver Mis Cursos'],
            ['btnTakeAttendance', 'Tomar Asistencia'],
            ['btnTeacherAttendanceReport', 'Ver Asistencias']
        ], 'display: none;', 'fact_check', 'Consultá tus cursos y registrá la asistencia.'));

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
        const accountDetails = createElement('p', { className: 'mobile-account-details', textContent: 'Ingresá para acceder a las funciones de tu institución.' });
        const accountAction = createButton('mobileAccountAction', 'Iniciar sesión');
        accountAction.classList.add('mobile-account-action');

        accountAction.addEventListener('click', function () {
            const signedIn = Boolean(authSessionToken);
            closeMobileAccountPanel();
            const sessionButton = document.getElementById(signedIn ? 'btnLogout' : 'btnLogin');
            if (sessionButton) sessionButton.click();
        });

        accountPanel.append(accountStatus, accountDetails, accountAction);

        accountButton.addEventListener('click', function () {
            closeMobileMenu();
            closeMobileAccountPanel();
            const action = document.getElementById('actionContainer');
            const welcome = document.getElementById('welcomeScreen');
            if (action) action.style.display = 'block';
            if (welcome) welcome.style.display = 'none';
            const page = document.getElementById('accountPage');
            if (page) {
                page.style.display = 'block';
                document.querySelectorAll('#actionContainer > section, #actionContainer > .card').forEach(function (el) {
                    if (el.id !== 'accountPage') el.style.display = 'none';
                });
            }
            document.querySelectorAll('.mobile-quick-nav button').forEach(function (btn) {
                btn.removeAttribute('aria-current');
            });
            accountButton.setAttribute('aria-current', 'page');
            updateAccountPage();
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

    updateAccountPage() {
        const signedIn = Boolean(authSessionToken);
        const title = document.getElementById('accountPageTitle');
        const description = document.getElementById('accountPageDescription');
        const user = document.getElementById('accountPageUser');
        const role = document.getElementById('accountPageRole');
        const login = document.getElementById('accountPageLogin');

        if (title) title.textContent = signedIn ? 'Tu cuenta institucional' : 'Bienvenido a MiRegistro';
        if (description) description.textContent = signedIn ? 'Consultá los datos de tu sesión y administrá el acceso a tu cuenta.' : 'Desde acá podés iniciar sesión para acceder a las herramientas de tu institución.';
        if (user) user.textContent = signedIn ? 'Usuario: ' + currentUserId : 'Estado: sin iniciar sesión';

        const status = document.getElementById('userStatus');
        if (role) role.textContent = signedIn ? (status ? status.textContent.split('(').pop().replace(')', '') : 'Rol asignado') : 'Rol: —';

        if (login) {
            login.textContent = signedIn ? 'Cerrar sesión' : 'Iniciar sesión';
            login.classList.toggle('danger', signedIn);
            login.onclick = function () {
                document.getElementById(signedIn ? 'btnLogout' : 'btnLogin').click();
            };
        }
    }

    connectedCallback() {
        updateNavigation(null);
        initSessionHandlers(this);
        initUserHandlers(this);
        initStudentHandlers(this);
        initCourseHandlers(this);
        initCalendarHandlers(this);
        initAttendanceHandlers(this);
    }
}

customElements.define('main-menu', Menu);
