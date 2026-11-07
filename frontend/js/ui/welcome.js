/* ============================================================
   Pantalla de bienvenida
   ============================================================ */

function createWelcomeScreen() {
    const section = createElement('section', { id: 'welcomeScreen', className: 'welcome-screen' });
    const hero = createElement('div', { className: 'welcome-hero' });

    hero.appendChild(createElement('div', { className: 'welcome-eyebrow', textContent: 'MiRegistro · Gestión escolar' }));
    hero.appendChild(createElement('h2', { textContent: 'Tu escuela, más organizada.' }));
    hero.appendChild(createElement('p', {
        textContent: 'Un espacio simple para organizar alumnos, cursos y asistencias. Todo lo importante de la gestión escolar, en un mismo lugar.'
    }));

    const visual = createElement('div', { className: 'welcome-visual' });
    visual.setAttribute('aria-hidden', 'true');

    const visualTop = createElement('div', { className: 'welcome-visual-top' });
    visualTop.append(
        createElement('span', { className: 'material-symbol', textContent: 'fact_check' }),
        createElement('strong', { textContent: 'Asistencia de hoy' }),
        createElement('span', { className: 'welcome-visual-live', textContent: 'EN ORDEN' })
    );

    const visualStats = createElement('div', { className: 'welcome-visual-stats' });
    [['check_circle', 'Presentes', '28'], ['schedule', 'Tardanzas', '2'], ['cancel', 'Ausentes', '1']].forEach(function (item) {
        const stat = createElement('div', { className: 'welcome-visual-stat' });
        stat.append(
            createElement('span', { className: 'material-symbol', textContent: item[0] }),
            createElement('small', { textContent: item[1] }),
            createElement('b', { textContent: item[2] })
        );
        visualStats.appendChild(stat);
    });

    const visualRows = createElement('div', { className: 'welcome-visual-rows' });
    [
        ['3° A', '31 estudiantes', 'check_circle'],
        ['4° B', '29 estudiantes', 'check_circle'],
        ['5° A', 'En seguimiento', 'schedule']
    ].forEach(function (item) {
        const line = createElement('div', { className: 'welcome-visual-row' });
        line.append(
            createElement('strong', { textContent: item[0] }),
            createElement('span', { textContent: item[1] }),
            createElement('span', { className: 'material-symbol', textContent: item[2] })
        );
        visualRows.appendChild(line);
    });

    visual.append(visualTop, visualStats, visualRows);
    hero.appendChild(visual);

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
        tab.addEventListener('click', function () {
            selectFeature(index);
        });
        tabs.appendChild(tab);
    });

    preview.append(tabs, detail);
    preview.appendChild(createElement('p', {
        className: 'welcome-note',
        textContent: 'La información de tu institución estará disponible al iniciar sesión.'
    }));

    section.append(hero, preview);
    selectFeature(0);
    return section;
}
