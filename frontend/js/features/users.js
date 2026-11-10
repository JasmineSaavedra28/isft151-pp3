

function initUserHandlers(menu) {
    document.getElementById('btnNewUser').onclick = async function () {
        const data = await showFormModal('Agregar Usuario / Rol', [
            { name: 'username', label: 'Usuario' },
            { name: 'password', label: 'Contraseña inicial', type: 'password' },
            { name: 'confirmPassword', label: 'Repetir contraseña', type: 'password', matchWith: 'password' },
            { name: 'acceptedTerms', label: 'El usuario recibió y aceptó los Términos y la Política de privacidad', type: 'checkbox', required: true, legalLinks: true },
            {
                name: 'role',
                label: 'Rol',
                type: 'select',
                options: [
                    { value: 'Administrador', text: 'Administrador' },
                    { value: 'Preceptor', text: 'Preceptor' },
                    { value: 'Docente', text: 'Docente' }
                ]
            }
        ]);
        if (!data) return;

        delete data.confirmPassword;
        delete data.acceptedTerms;
        data.password = await computeSHA256(data.password);

        try {
            const res = await rpcFetch('/registerUser', data);
            menu.printResult({ message: 'Usuario creado correctamente. Confirmá que recibió los documentos legales y conservá constancia de su aceptación.', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnModifyUser').onclick = async function () {
        try {
            const users = await rpcFetch('/listUsers');
            const options = users.map(function (user) {
                return { value: user.userId, text: `${user.username} (${user.role})` };
            });
            if (options.length === 0) {
                alert('No hay usuarios registrados.');
                return;
            }

            const selected = await showFormModal('Seleccionar Usuario', [
                { name: 'userId', label: 'Usuario', type: 'select', options }
            ]);
            if (!selected) return;

            const user = users.find(function (item) {
                return item.userId === selected.userId;
            });

            const data = await showFormModal('Modificar Nombre de Usuario', [
                { name: 'userId', label: 'Usuario', type: 'select', options: [{ value: user.userId, text: user.username }], value: user.userId },
                { name: 'username', label: 'Nuevo nombre de usuario', value: user.username }
            ]);
            if (!data) return;

            const res = await rpcFetch('/modifyUser', data);
            menu.printResult({ message: 'Usuario modificado correctamente', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnDisableUser').onclick = async function () {
        try {
            const users = await rpcFetch('/listUsers');
            const options = users.map(function (user) {
                const status = user.status === 'enabled' ? 'Habilitado' : 'Deshabilitado';
                return { value: user.userId, text: `${user.username} (${user.role} · ${status})` };
            });
            if (options.length === 0) {
                alert('No hay usuarios registrados.');
                return;
            }

            const data = await showFormModal('Habilitar o deshabilitar usuario', [
                { name: 'userId', label: 'Usuario', type: 'select', options }
            ]);
            if (!data) return;

            const res = await rpcFetch('/disableUser', data);
            menu.printResult({
                message: res.status === 'enabled'
                    ? 'Usuario habilitado correctamente'
                    : 'Usuario deshabilitado correctamente',
                ...res
            });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnDeleteUser').onclick = async function () {
        try {
            const users = await rpcFetch('/listUsers');
            const options = users.map(function (user) {
                return { value: user.userId, text: `${user.username} (${user.role})` };
            });
            if (options.length === 0) {
                alert('No hay usuarios registrados.');
                return;
            }

            const data = await showFormModal('Eliminar Usuario', [
                { name: 'userId', label: 'Usuario', type: 'select', options }
            ]);
            if (!data) return;

            const confirmation = await showFormModal('Confirmar eliminación', [
                { name: 'confirm', label: 'Escribí ELIMINAR para confirmar', type: 'text' }
            ]);
            if (!confirmation || confirmation.confirm !== 'ELIMINAR') return;

            const res = await rpcFetch('/deleteUser', data);
            menu.printResult({ message: 'Usuario eliminado correctamente', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnUpdateUserRole').onclick = async function () {
        try {
            const users = await rpcFetch('/listUsers');
            const options = users.map(function (user) {
                return { value: user.userId, text: `${user.username} (${user.role})` };
            });

            const data = await showFormModal('Modificar Rol', [
                { name: 'userId', label: 'Usuario', type: 'select', options },
                {
                    name: 'newRole',
                    label: 'Nuevo rol',
                    type: 'select',
                    options: [
                        { value: 'Administrador', text: 'Administrador' },
                        { value: 'Preceptor', text: 'Preceptor' },
                        { value: 'Docente', text: 'Docente' }
                    ]
                }
            ]);
            if (!data) return;

            const res = await rpcFetch('/updateUserRole', data);
            menu.printResult({ message: 'Rol actualizado correctamente', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnListUsers').onclick = async function () {
        try {
            const users = await rpcFetch('/listUsers');
            menu.printResult({ usuarios: users });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };
}
