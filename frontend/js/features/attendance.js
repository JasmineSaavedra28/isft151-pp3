/* ============================================================
   Asistencias · docentes y reportes
   ============================================================ */

function initAttendanceHandlers(menu) {
    document.getElementById('btnTeacherListCourses').onclick = async function () {
        try {
            const courses = await rpcFetch('/listCourses');
            menu.printResult({ misCursos: courses });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnTakeAttendance').onclick = async function () {
        try {
            const courses = await rpcFetch('/listCourses');
            if (courses.length === 0) {
                alert('No tiene cursos asignados.');
                return;
            }

            const selection = await showFormModal('Seleccionar Clase', [
                { name: 'courseId', label: 'Curso', type: 'select', options: courses.map(function (course) { return { value: course.courseId, text: course.name }; }) },
                { name: 'date', label: 'Fecha de la clase', type: 'date' }
            ]);
            if (!selection) return;

            const roster = await rpcFetch('/getAttendanceRoster', selection);
            if (roster.students.length === 0) {
                alert('El curso no tiene estudiantes inscriptos.');
                return;
            }

            const course = courses.find(function (item) {
                return item.courseId === selection.courseId;
            });

            const attendanceReport = await rpcFetch('/getAttendanceReport', {
                courseId: selection.courseId
            });

            const attendance = await showAttendanceModal(
                selection.courseId,
                course.name,
                selection.date,
                roster.students,
                attendanceReport.sessions.map(function (session) {
                    return session.date;
                })
            );
            if (!attendance) return;

            const result = await rpcFetch('/saveAttendance', {
                courseId: selection.courseId,
                date: attendance.date,
                records: attendance.records
            });
            menu.printResult({ message: 'Asistencia guardada correctamente', ...result });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    const showAttendanceReport = async function () {
        try {
            const courses = await rpcFetch('/listCourses');
            if (courses.length === 0) {
                alert('No hay cursos disponibles.');
                return;
            }

            const selection = await showFormModal('Consultar Asistencias', [
                { name: 'courseId', label: 'Curso', type: 'select', options: courses.map(function (course) { return { value: course.courseId, text: course.name }; }) }
            ]);
            if (!selection) return;

            const report = await rpcFetch('/getAttendanceReport', selection);
            menu.printAttendanceReport(report);
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnAttendanceReport').onclick = showAttendanceReport;
    document.getElementById('btnTeacherAttendanceReport').onclick = showAttendanceReport;
}
