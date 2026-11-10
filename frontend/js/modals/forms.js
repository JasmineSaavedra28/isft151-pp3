

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
                const termsLink = document.createElement('a');
                termsLink.href = 'terminos.html';
                termsLink.target = '_blank';
                termsLink.rel = 'noopener';
                termsLink.textContent = 'Términos';
                const privacyLink = document.createElement('a');
                privacyLink.href = 'privacidad.html';
                privacyLink.target = '_blank';
                privacyLink.rel = 'noopener';
                privacyLink.textContent = 'Privacidad';
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
                    const wrap = document.createElement('div');
                    wrap.className = 'auth-password-wrap';

                    const eye = document.createElement('button');
                    eye.type = 'button';
                    eye.className = 'auth-eye-button';
                    eye.setAttribute('aria-label', 'Mostrar contraseña');

                    const openSvg = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
                    const closedSvg = '<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8"/></svg>';
                    eye.innerHTML = openSvg;
                    eye.addEventListener('click', function () {
                        const show = input.type === 'password';
                        input.type = show ? 'text' : 'password';
                        eye.innerHTML = show ? closedSvg : openSvg;
                        eye.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
                    });

                    wrap.append(input, eye);
                    group.appendChild(wrap);
                } else {
                    group.appendChild(input);
                }
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
            const missing = fields.find(function (f) {
                return f.required && (f.type === 'checkbox'
                    ? !inputs[f.name].checked
                    : !String(inputs[f.name].value || '').trim());
            });

            if (missing) {
                notify(
                    missing.type === 'checkbox'
                        ? 'Debés aceptar los términos y la política de privacidad para crear el usuario.'
                        : 'Completá el campo ' + missing.label + '.',
                    'error'
                );
                inputs[missing.name].focus();
                return;
            }

            const mismatch = fields.find(function (f) {
                return f.matchWith && inputs[f.name].value !== inputs[f.matchWith].value;
            });

            if (mismatch) {
                notify('Las contraseñas no coinciden.', 'error');
                inputs[mismatch.name].focus();
                return;
            }

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
