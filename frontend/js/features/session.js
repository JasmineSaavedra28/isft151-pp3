/* ============================================================
   Sesión · ingreso, cierre y restauración de la vista
   ============================================================ */

function initSessionHandlers(menu) {
    document.getElementById('btnLogin').onclick = async function (event) {
        if (authSessionToken) {
            if (event) event.stopPropagation();
            const panel = document.getElementById('headerAccountMenu');
            if (panel) panel.hidden = !panel.hidden;
            this.setAttribute('aria-expanded', String(panel && !panel.hidden));
            return;
        }

        const data = await showAuthModal();
        if (!data || !data.user || !data.pass) return;

        currentUserId = data.user;
        authSessionToken = await computeSHA256(data.pass);

        try {
            const res = await rpcFetch('/login');
            document.getElementById('userStatus').textContent = `Usuario: ${currentUserId} (${res.role})`;

            const loginButton = document.getElementById('btnLogin');
            loginButton.textContent = res.role === 'Administrador' ? 'Admin' : currentUserId;
            loginButton.disabled = false;
            loginButton.setAttribute('aria-haspopup', 'true');
            loginButton.setAttribute('aria-expanded', 'false');
            loginButton.hidden = false;
            loginButton.style.display = 'inline-flex';

            const headerMenu = document.getElementById('headerAccountMenu');
            if (headerMenu) headerMenu.hidden = true;
            document.getElementById('btnLogout').style.display = 'none';

            menu.updateAccountPage();
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('actionContainer').style.display = 'block';
            document.getElementById('adminContainer').style.display = res.role === 'Administrador' ? 'block' : 'none';
            document.getElementById('studentManagementContainer').style.display = res.role === 'Administrador' ? 'block' : 'none';
            document.getElementById('courseManagementContainer').style.display = res.role === 'Administrador' ? 'block' : 'none';
            document.getElementById('calendarManagementContainer').style.display = res.role === 'Administrador' ? 'block' : 'none';
            document.getElementById('teacherAttendanceContainer').style.display = res.role === 'Docente' ? 'block' : 'none';
            document.getElementById('teacherStudentsContainer').style.display = res.role === 'Docente' ? 'block' : 'none';

            updateNavigation(res.role);
            showSection('dashboardOverview');
            menu.clearAttendanceReport();
            menu.printResult({ success: true, message: 'Ingreso exitoso', role: res.role });
        } catch (e) {
            alert(`Error: ${e.detail}`);
            currentUserId = null;
            authSessionToken = null;
            document.getElementById('btnLogin').textContent = 'Iniciar Sesión';
            document.getElementById('btnLogin').disabled = false;
            document.getElementById('btnLogin').hidden = false;
            document.getElementById('btnLogin').style.display = 'inline-flex';
            document.getElementById('btnLogout').style.display = 'none';
            updateNavigation(null);
        }
    };

    document.getElementById('btnLogout').onclick = async function () {
        try {
            await rpcFetch('/logout');
        } catch (e) {}

        currentUserId = null;
        authSessionToken = null;
        document.getElementById('userStatus').textContent = '';
        document.getElementById('btnLogin').textContent = 'Iniciar Sesión';

        document.getElementById('btnLogin').onclick = async function () {
            const data = await showAuthModal();
            if (!data || !data.user || !data.pass) return;
            currentUserId = data.user;
            authSessionToken = await computeSHA256(data.pass);

            try {
                const res = await rpcFetch('/login');
                const loginButton = document.getElementById('btnLogin');
                loginButton.textContent = res.role === 'Administrador' ? 'Admin' : currentUserId;
                document.getElementById('userStatus').textContent = `Usuario: ${currentUserId} (${res.role})`;
                document.getElementById('welcomeScreen').style.display = 'none';
                document.getElementById('actionContainer').style.display = 'block';

                ['adminContainer', 'studentManagementContainer', 'courseManagementContainer', 'calendarManagementContainer'].forEach(function (id) {
                    const el = document.getElementById(id);
                    if (el) el.style.display = res.role === 'Administrador' ? 'block' : 'none';
                });

                const teacher = document.getElementById('teacherAttendanceContainer');
                if (teacher) teacher.style.display = res.role === 'Docente' ? 'block' : 'none';
                const teacherStudents = document.getElementById('teacherStudentsContainer');
                if (teacherStudents) teacherStudents.style.display = res.role === 'Docente' ? 'block' : 'none';

                updateNavigation(res.role);
                menu.updateAccountPage();
                showSection('dashboardOverview');
            } catch (e) {
                currentUserId = null;
                authSessionToken = null;
                notify(e.detail || 'No se pudo iniciar sesión.', 'error');
                document.getElementById('btnLogin').textContent = 'Iniciar Sesión';
            }
        };

        document.getElementById('btnLogin').disabled = false;
        document.getElementById('btnLogin').hidden = false;
        document.getElementById('btnLogin').style.display = 'inline-flex';
        document.getElementById('btnLogout').style.display = 'none';

        const headerMenu = document.getElementById('headerAccountMenu');
        if (headerMenu) headerMenu.hidden = true;

        document.getElementById('actionContainer').style.display = 'none';
        document.getElementById('welcomeScreen').style.display = 'grid';
        document.getElementById('adminContainer').style.display = 'none';
        document.getElementById('studentManagementContainer').style.display = 'none';
        document.getElementById('courseManagementContainer').style.display = 'none';
        document.getElementById('calendarManagementContainer').style.display = 'none';
        document.getElementById('teacherAttendanceContainer').style.display = 'none';
        document.getElementById('teacherStudentsContainer').style.display = 'none';
        updateNavigation(null);
        menu.updateAccountPage();
        menu.clearAttendanceReport();

        const resultCard = document.getElementById('resultCard');
        const resultContent = document.getElementById('resultContent');
        if (resultContent) resultContent.replaceChildren();
        if (resultCard) resultCard.style.display = 'none';
    };
}
