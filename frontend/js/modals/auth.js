/* ============================================================
   Modal de ingreso y creación de cuenta
   ============================================================ */

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

        const userGroup = document.createElement('div');
        userGroup.className = 'form-group';
        const userLabel = document.createElement('label');
        userLabel.textContent = 'Usuario';
        userLabel.htmlFor = 'authUser';
        const user = document.createElement('input');
        user.id = 'authUser';
        user.autocomplete = 'username';
        user.placeholder = 'Tu nombre de usuario';
        user.required = true;
        userGroup.append(userLabel, user);

        const passGroup = document.createElement('div');
        passGroup.className = 'form-group';
        const passLabel = document.createElement('label');
        passLabel.textContent = 'Contraseña';
        passLabel.htmlFor = 'authPass';
        const passWrap = document.createElement('div');
        passWrap.className = 'auth-password-wrap';
        const pass = document.createElement('input');
        pass.id = 'authPass';
        pass.type = 'password';
        pass.autocomplete = 'current-password';
        pass.placeholder = 'Tu contraseña';
        pass.required = true;

        const reveal = document.createElement('button');
        reveal.type = 'button';
        reveal.className = 'auth-eye-button';
        reveal.setAttribute('aria-label', 'Mostrar contraseña');
        reveal.title = 'Mostrar contraseña';

        const eyeOpen = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
        const eyeClosed = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8"/></svg>';
        reveal.innerHTML = eyeOpen;
        reveal.addEventListener('click', function () {
            const visible = pass.type === 'password';
            pass.type = visible ? 'text' : 'password';
            reveal.innerHTML = visible ? eyeClosed : eyeOpen;
            reveal.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
            reveal.title = visible ? 'Ocultar contraseña' : 'Mostrar contraseña';
        });

        passWrap.append(pass, reveal);
        passGroup.append(passLabel, passWrap);

        const forgot = document.createElement('button');
        forgot.type = 'button';
        forgot.className = 'auth-link';
        forgot.textContent = '¿Olvidaste tu contraseña?';
        forgot.addEventListener('click', function () {
            notify('La recuperación automática todavía no está conectada al backend. Solicitá al administrador que restablezca tu contraseña.', 'info', 'Recuperación de contraseña');
        });

        const separator = document.createElement('div');
        separator.className = 'auth-separator';
        separator.textContent = 'o continuar con';

        const google = document.createElement('button');
        google.type = 'button';
        google.className = 'auth-google';
        google.disabled = true;
        google.innerHTML = '<span class="auth-google-g">G</span><span>Continuar con Google</span><small>Próximamente</small>';
        google.title = 'Requiere configurar Google OAuth en el backend';

        const foot = document.createElement('div');
        foot.className = 'auth-footnote';
        const footText = document.createElement('span');
        footText.textContent = '¿No tenés cuenta?';
        const createAccount = document.createElement('button');
        createAccount.type = 'button';
        createAccount.className = 'auth-create-account';
        createAccount.textContent = 'Crear usuario';

        createAccount.addEventListener('click', function () {
            title.textContent = 'Crear cuenta';
            body.replaceChildren();

            const registerIntro = document.createElement('p');
            registerIntro.className = 'auth-intro';
            registerIntro.textContent = 'Completá tus datos para solicitar una cuenta en MiRegistro.';

            const fields = document.createElement('div');
            fields.className = 'auth-register-fields';

            function addField(labelText, id, type, placeholder, autocomplete) {
                const group = document.createElement('div');
                group.className = 'form-group';
                const label = document.createElement('label');
                label.htmlFor = id;
                label.textContent = labelText;
                const input = document.createElement('input');
                input.id = id;
                input.type = type;
                input.placeholder = placeholder;
                input.autocomplete = autocomplete || 'off';
                input.required = true;
                group.append(label, input);
                fields.appendChild(group);
                return input;
            }

            const fullName = addField('Nombre y apellido', 'registerFullName', 'text', 'Tu nombre completo', 'name');
            const email = addField('Correo electrónico', 'registerEmail', 'email', 'nombre@institucion.edu.ar', 'email');
            const newUser = addField('Nombre de usuario', 'registerUser', 'text', 'Elegí un usuario', 'username');
            const newPass = addField('Crear contraseña', 'registerPass', 'password', 'Mínimo 8 caracteres', 'new-password');
            const confirmPass = addField('Repetir contraseña', 'registerConfirmPass', 'password', 'Volvé a escribir la contraseña', 'new-password');

            [newPass, confirmPass].forEach(function (input) {
                const wrap = document.createElement('div');
                wrap.className = 'auth-password-wrap';
                input.parentNode.insertBefore(wrap, input);
                wrap.appendChild(input);

                const eye = document.createElement('button');
                eye.type = 'button';
                eye.className = 'auth-eye-button';
                eye.setAttribute('aria-label', 'Mostrar contraseña');
                eye.innerHTML = eyeOpen;
                eye.addEventListener('click', function () {
                    const show = input.type === 'password';
                    input.type = show ? 'text' : 'password';
                    eye.innerHTML = show ? eyeClosed : eyeOpen;
                    eye.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
                });
                wrap.appendChild(eye);
            });

            const termsLabel = document.createElement('label');
            termsLabel.className = 'auth-register-terms';
            const termsCheck = document.createElement('input');
            termsCheck.type = 'checkbox';
            termsCheck.required = true;
            const termsText = document.createElement('span');
            termsText.append('Acepto los ');
            const termsA = document.createElement('a');
            termsA.href = 'terminos.html';
            termsA.target = '_blank';
            termsA.rel = 'noopener';
            termsA.textContent = 'Términos y condiciones';
            const privacyA = document.createElement('a');
            privacyA.href = 'privacidad.html';
            privacyA.target = '_blank';
            privacyA.rel = 'noopener';
            privacyA.textContent = 'Política de privacidad';
            termsText.append(termsA, ' y la ', privacyA, '.');
            termsLabel.append(termsCheck, termsText);

            const back = document.createElement('button');
            back.type = 'button';
            back.className = 'auth-link auth-back-login';
            back.textContent = 'Ya tengo una cuenta · Iniciar sesión';
            back.addEventListener('click', function () {
                title.textContent = 'Ingresar a MiRegistro';
                body.replaceChildren(intro, userGroup, passGroup, forgot, separator, google, foot);
                submit.textContent = 'Iniciar sesión';
            });

            body.append(registerIntro, fields, termsLabel, back);
            submit.textContent = 'Crear cuenta';
            submit.onclick = function () {
                if (!fullName.value.trim() || !email.validity.valid || !newUser.value.trim() || !newPass.value || !confirmPass.value) {
                    notify('Completá todos los campos con información válida.', 'error', 'Revisá el formulario');
                    return;
                }
                if (newPass.value.length < 8) {
                    notify('La contraseña debe tener al menos 8 caracteres.', 'error', 'Contraseña no válida');
                    return;
                }
                if (newPass.value !== confirmPass.value) {
                    notify('Las contraseñas no coinciden.', 'error', 'Revisá la contraseña');
                    return;
                }
                if (!termsCheck.checked) {
                    notify('Para crear la cuenta tenés que aceptar los términos y la política de privacidad.', 'error', 'Falta aceptar los documentos');
                    return;
                }
                notify('El formulario está preparado, pero el registro público todavía debe conectarse a un endpoint seguro del backend. No se creó ninguna cuenta.', 'info', 'Registro pendiente de conexión');
            };
        });

        foot.append(footText, createAccount);
        body.append(intro, userGroup, passGroup, forgot, separator, google, foot);
        cancel.textContent = 'Volver';

        const actions = modal.querySelector('.dialog-actions');
        if (actions) actions.classList.add('auth-dialog-actions');
        submit.textContent = 'Iniciar sesión';

        const cleanup = function () {
            submit.onclick = null;
            cancel.onclick = null;
            submit.textContent = oldSubmit;
            cancel.textContent = 'Cancelar';
            modal.classList.remove('auth-modal');
            const dialogActions = modal.querySelector('.dialog-actions');
            if (dialogActions) dialogActions.classList.remove('auth-dialog-actions');
            modal.close();
        };

        submit.onclick = function () {
            if (!user.value.trim() || !pass.value) {
                notify('Completá usuario y contraseña.', 'error');
                return;
            }
            const result = { user: user.value.trim(), pass: pass.value };
            cleanup();
            resolve(result);
        };

        cancel.onclick = function () {
            cleanup();
            resolve(null);
        };

        modal.addEventListener('close', function onClose() {
            modal.removeEventListener('close', onClose);
            if (modal.classList.contains('auth-modal')) {
                modal.classList.remove('auth-modal');
                submit.onclick = null;
                cancel.onclick = null;
                submit.textContent = oldSubmit;
                cancel.textContent = 'Cancelar';
                const dialogActions = modal.querySelector('.dialog-actions');
                if (dialogActions) dialogActions.classList.remove('auth-dialog-actions');
                resolve(null);
            }
        });

        modal.showModal();
        user.focus();
    });
}
