/* ============================================================
   Footer institucional
   El logo del instituto se mantiene abajo, como parte del TP académico.
   ============================================================ */

function createInstitutionFooter() {
    const footer = createElement('footer', { className: 'site-footer' });

    const identity = createElement('div', { className: 'site-footer-identity' });
    const logo = document.createElement('img');
    logo.className = 'site-footer-logo';
    logo.src = 'logo-isft151.png';
    logo.alt = 'Logo del ISFT N.º 151';
    logo.loading = 'lazy';
    logo.decoding = 'async';

    const identityText = createElement('div', { className: 'site-footer-identity-text' });
    identityText.append(
        createElement('strong', { textContent: 'ISFT N.º 151' }),
        createElement('span', { textContent: 'Proyecto académico' })
    );
    identity.append(logo, identityText);

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

    const legalLinks = createElement('nav', { className: 'site-footer-legal' });
    [['Términos y condiciones', 'terminos.html'], ['Política de privacidad', 'privacidad.html']].forEach(function (item) {
        const link = createElement('a', { textContent: item[0] });
        link.href = item[1];
        legalLinks.appendChild(link);
    });
    text.appendChild(legalLinks);

    footer.append(identity, text);
    return footer;
}
