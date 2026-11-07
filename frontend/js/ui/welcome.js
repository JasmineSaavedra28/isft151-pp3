/* ============================================================
   Pantalla de bienvenida
   Portada previa al inicio de sesión.
   ============================================================ */

function createWelcomeIcon(name, className = 'material-symbol') {
    const icon = createElement('span', { className, textContent: name });
    icon.setAttribute('aria-hidden', 'true');
    return icon;
}

function createWelcomeScreen() {
    const section = createElement('section', { id: 'welcomeScreen', className: 'welcome-screen' });

    function openLogin() {
        const button = document.getElementById('btnLogin');
        if (button) button.click();
    }

    const hero = createElement('div', { className: 'welcome-hero' });
    const heroCopy = createElement('div', { className: 'welcome-hero-copy' });

    const eyebrow = createElement('div', { className: 'welcome-eyebrow' });
    eyebrow.append(
        createWelcomeIcon('auto_awesome'),
        createElement('span', { textContent: 'MiRegistro · Gestión escolar' })
    );

    const title = createElement('h2');
    title.append(
        document.createTextNode('La gestión escolar, '),
        createElement('span', { textContent: 'en un solo lugar.' })
    );

    const description = createElement('p', {
        textContent: 'Organizá alumnos, cursos y asistencias desde un panel claro. Menos planillas sueltas, más tiempo para acompañar las trayectorias.'
    });

    const actions = createElement('div', { className: 'welcome-actions' });
    const login = createButton('welcomeLoginButton', 'Iniciar sesión');
    login.classList.add('welcome-login');
    login.prepend(createWelcomeIcon('login'));
    login.addEventListener('click', openLogin);

    const explore = createButton('welcomeExploreButton', 'Ver funciones');
    explore.classList.add('welcome-explore');
    explore.prepend(createWelcomeIcon('grid_view'));
    explore.addEventListener('click', function () {
        const highlights = document.querySelector('.welcome-highlights');
        if (highlights) highlights.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    actions.append(login, explore);

    const badges = createElement('div', { className: 'welcome-hero-badges' });
    [
        'Asistencia diaria',
        'Reportes claros',
        'Acceso por rol'
    ].forEach(function (label) {
        const badge = createElement('span');
        badge.append(
            createWelcomeIcon('check_circle'),
            document.createTextNode(label)
        );
        badges.appendChild(badge);
    });

    heroCopy.append(eyebrow, title, description, actions, badges);
    hero.append(heroCopy, createWelcomeVisual());

    const highlights = createWelcomeHighlights();

    const cta = createElement('div', { className: 'welcome-cta' });
    const ctaIcon = createElement('span', { className: 'welcome-cta-icon' });
    ctaIcon.appendChild(createWelcomeIcon('school'));
    const ctaCopy = createElement('div', { className: 'welcome-cta-copy' });
    ctaCopy.append(
        createElement('h3', { textContent: '¿Listo para ordenar tu día?' }),
        createElement('p', {
            textContent: 'Ingresá con tu cuenta institucional y encontrá toda la información de tus cursos en un mismo panel.'
        })
    );
    const ctaButton = createButton('welcomeCtaLoginButton', 'Ingresar a MiRegistro');
    ctaButton.classList.add('welcome-cta-button');
    ctaButton.prepend(createWelcomeIcon('arrow_forward'));
    ctaButton.addEventListener('click', openLogin);
    cta.append(ctaIcon, ctaCopy, ctaButton);

    section.append(hero, highlights, cta);
    return section;
}

function createWelcomeVisual() {
    const visual = createElement('div', { className: 'welcome-visual' });
    visual.setAttribute('aria-hidden', 'true');

    const chrome = createElement('div', { className: 'welcome-visual-chrome' });
    const dots = createElement('span', { className: 'welcome-window-dots' });
    for (let index = 0; index < 3; index += 1) {
        dots.appendChild(createElement('i'));
    }
    chrome.append(
        dots,
        createElement('span', { className: 'welcome-window-title', textContent: 'MiRegistro · Resumen' }),
        createElement('span', { className: 'welcome-visual-live', textContent: 'EN ORDEN' })
    );

    const body = createElement('div', { className: 'welcome-visual-body' });

    const visualTop = createElement('div', { className: 'welcome-visual-top' });
    const topIcon = createElement('span', { className: 'welcome-visual-icon' });
    topIcon.appendChild(createWelcomeIcon('fact_check'));
    const topCopy = createElement('div', { className: 'welcome-visual-title' });
    topCopy.append(
        createElement('strong', { textContent: 'Asistencia de hoy' }),
        createElement('small', { textContent: 'Sábado, 7 de noviembre' })
    );
    visualTop.append(topIcon, topCopy);

    const visualStats = createElement('div', { className: 'welcome-visual-stats' });
    [
        ['check_circle', 'Presentes', '28', 'de 31 registros', 'present'],
        ['schedule', 'Tardanzas', '2', 'llegadas tarde', 'late'],
        ['cancel', 'Ausentes', '1', 'sin asistencia', 'absent']
    ].forEach(function (item) {
        const stat = createElement('div', { className: `welcome-visual-stat ${item[4]}` });
        stat.append(
            createWelcomeIcon(item[0]),
            createElement('small', { textContent: item[1] }),
            createElement('b', { textContent: item[2] }),
            createElement('span', { className: 'welcome-visual-stat-note', textContent: item[3] })
        );
        visualStats.appendChild(stat);
    });

    const visualRows = createElement('div', { className: 'welcome-visual-rows' });
    [
        {
            name: '3° A',
            meta: '31 estudiantes',
            counts: [['P 28', 'present'], ['T 2', 'late'], ['A 1', 'absent']],
            status: 'check_circle',
            pending: false
        },
        {
            name: '4° B',
            meta: '29 estudiantes',
            counts: [['P 24', 'present'], ['T 2', 'late'], ['A 3', 'absent']],
            status: 'check_circle',
            pending: false
        },
        {
            name: '5° A',
            meta: 'En seguimiento',
            counts: [['P 18', 'present'], ['T 2', 'late'], ['A 5', 'absent']],
            status: 'schedule',
            pending: true
        }
    ].forEach(function (item) {
        const line = createElement('div', { className: 'welcome-visual-row' });

        const course = createElement('div', { className: 'welcome-visual-course' });
        course.append(
            createElement('strong', { textContent: item.name }),
            createElement('span', { textContent: item.meta })
        );

        const chips = createElement('div', { className: 'welcome-visual-chips' });
        item.counts.forEach(function (count) {
            chips.appendChild(createElement('span', {
                className: `welcome-visual-chip ${count[1]}`,
                textContent: count[0]
            }));
        });

        line.append(
            course,
            chips,
            createWelcomeIcon(item.status, `material-symbol welcome-visual-status${item.pending ? ' is-pending' : ''}`)
        );
        visualRows.appendChild(line);
    });

    const foot = createElement('div', { className: 'welcome-visual-foot' });
    foot.append(
        createWelcomeIcon('sync'),
        createElement('span', { textContent: 'Datos actualizados' })
    );

    body.append(visualTop, visualStats, visualRows, foot);

    const floating = createElement('div', { className: 'welcome-visual-float' });
    const floatingIcon = createElement('span', { className: 'welcome-visual-float-icon' });
    floatingIcon.appendChild(createWelcomeIcon('event_available'));
    const floatingCopy = createElement('div');
    floatingCopy.append(
        createElement('strong', { textContent: '3 cursos al día' }),
        createElement('small', { textContent: 'Sin pendientes' })
    );
    floating.append(floatingIcon, floatingCopy);

    visual.append(chrome, body, floating);
    return visual;
}

function createWelcomeHighlights() {
    const highlights = createElement('div', { className: 'welcome-highlights' });

    const head = createElement('div', { className: 'welcome-section-head' });
    head.append(
        createElement('span', { className: 'welcome-kicker', textContent: 'Todo en su lugar' }),
        createElement('h3', { textContent: 'Las herramientas del día a día' }),
        createElement('p', {
            textContent: 'Una misma interfaz para ordenar la información, registrar asistencia y revisar cómo vienen tus cursos.'
        })
    );

    const grid = createElement('div', { className: 'welcome-feature-grid' });
    [
        {
            icon: 'groups',
            tag: 'Organización',
            title: 'Alumnos',
            description: 'Toda la información de tus estudiantes, ordenada por curso y siempre a mano.',
            preview: 'avatars'
        },
        {
            icon: 'fact_check',
            tag: 'Día a día',
            title: 'Asistencias',
            description: 'Registrá presentes, ausentes y tardanzas en pocos pasos, sin planillas paralelas.',
            preview: 'attendance'
        },
        {
            icon: 'analytics',
            tag: 'Seguimiento',
            title: 'Reportes',
            description: 'Consultá porcentajes y conteos por fecha para acompañar cada trayectoria.',
            preview: 'report'
        }
    ].forEach(function (feature) {
        const card = createElement('article', { className: 'welcome-feature-card' });

        const top = createElement('div', { className: 'welcome-feature-top' });
        const iconWrap = createElement('span', { className: 'welcome-feature-icon' });
        iconWrap.appendChild(createWelcomeIcon(feature.icon));
        top.append(
            iconWrap,
            createElement('span', { className: 'welcome-feature-tag', textContent: feature.tag })
        );

        card.append(
            top,
            createElement('h4', { textContent: feature.title }),
            createElement('p', { textContent: feature.description }),
            createWelcomeFeaturePreview(feature.preview)
        );

        grid.appendChild(card);
    });

    highlights.append(head, grid);
    return highlights;
}

function createWelcomeFeaturePreview(type) {
    const preview = createElement('div', { className: 'welcome-feature-preview' });

    if (type === 'avatars') {
        const avatars = createElement('div', { className: 'welcome-avatars' });
        ['MG', 'LP', 'SR', 'TF'].forEach(function (initials) {
            avatars.appendChild(createElement('span', {
                className: 'welcome-avatar',
                textContent: initials
            }));
        });
        avatars.appendChild(createElement('span', {
            className: 'welcome-avatar more',
            textContent: '+12'
        }));
        preview.append(
            avatars,
            createElement('span', { className: 'welcome-avatars-note', textContent: '53 activos' })
        );
        return preview;
    }

    if (type === 'attendance') {
        [
            ['P 28', 'present'],
            ['T 2', 'late'],
            ['A 1', 'absent']
        ].forEach(function (item) {
            preview.appendChild(createElement('span', {
                className: `welcome-mini-chip ${item[1]}`,
                textContent: item[0]
            }));
        });
        preview.appendChild(createElement('span', {
            className: 'welcome-mini-label',
            textContent: 'Hoy'
        }));
        return preview;
    }

    const bars = createElement('div', { className: 'welcome-bars' });
    [42, 66, 54, 88, 72].forEach(function (height, index) {
        const bar = createElement('span', { className: `welcome-bar${index === 3 ? ' is-peak' : ''}` });
        bar.style.height = `${height}%`;
        bars.appendChild(bar);
    });

    const barsLabel = createElement('div', { className: 'welcome-bars-label' });
    barsLabel.append(
        createElement('strong', { textContent: '92%' }),
        createElement('span', { textContent: 'del ciclo' })
    );

    preview.append(bars, barsLabel);
    return preview;
}
