/* ============================================================
   Estudiantes
   ============================================================ */

function initStudentHandlers(menu) {
    document.getElementById('btnNewStudent').onclick = async function () {
        const data = await showFormModal('Nuevo Estudiante', [
            { name: 'name', label: 'Nombre' },
            { name: 'surname', label: 'Apellido' },
            { name: 'dni', label: 'DNI', type: 'number' }
        ]);
        if (!data) return;

        try {
            const res = await rpcFetch('/newStudent', data);
            menu.printResult(res);
            notify('Estudiante registrado con éxito.', 'success', 'Operación completada');
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnModifyStudent').onclick = async function () {
        try {
            const students = await rpcFetch('/listStudents');
            if (students.length === 0) {
                alert('No hay estudiantes registrados.');
                return;
            }

            const selected = await showFormModal('Seleccionar estudiante', [
                {
                    name: 'studentId',
                    label: 'Estudiante',
                    type: 'select',
                    options: students.map(function (student) {
                        return { value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` };
                    })
                }
            ]);
            if (!selected) return;

            const student = students.find(function (item) {
                return item.studentId === selected.studentId;
            });

            const data = await showFormModal('Modificar Estudiante', [
                { name: 'studentId', label: 'Estudiante', type: 'select', options: [{ value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` }], value: student.studentId },
                { name: 'name', label: 'Nuevo nombre', value: student.name },
                { name: 'surname', label: 'Nuevo apellido', value: student.surname },
                { name: 'dni', label: 'Nuevo DNI', type: 'number', value: student.dni }
            ]);
            if (!data) return;

            const confirmation = await showFormModal('Confirmar modificación', [
                { name: 'name', label: 'Nombre resultante', value: data.name, readOnly: true },
                { name: 'surname', label: 'Apellido resultante', value: data.surname, readOnly: true },
                { name: 'dni', label: 'DNI resultante', value: data.dni, readOnly: true }
            ], 'Confirmar cambios');
            if (!confirmation) return;

            const res = await rpcFetch('/modifyStudent', data);
            menu.printResult({ message: 'Estudiante modificado correctamente', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnDeleteStudent').onclick = async function () {
        try {
            const students = await rpcFetch('/listStudents');
            if (students.length === 0) {
                alert('No hay estudiantes registrados.');
                return;
            }

            const data = await showFormModal('Eliminar Estudiante', [
                {
                    name: 'studentId',
                    label: 'Estudiante',
                    type: 'select',
                    options: students.map(function (student) {
                        return { value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` };
                    })
                }
            ]);
            if (!data) return;

            const confirmation = await showFormModal('Confirmar baja', [
                { name: 'confirm', label: 'Escribí BAJA para confirmar', type: 'text' }
            ]);
            if (!confirmation || confirmation.confirm !== 'BAJA') return;

            const res = await rpcFetch('/deleteStudent', data);
            menu.printResult({ message: 'Estudiante eliminado correctamente', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnListStudents').onclick = async function () {
        try {
            const students = await rpcFetch('/listStudents');
            menu.printResult({ estudiantes: students });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };
}
