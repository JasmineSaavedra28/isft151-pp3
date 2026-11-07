/* ============================================================
   Cursos e inscripciones
   ============================================================ */

function initCourseHandlers(menu) {
    async function getCourseAndStudentOptions() {
        const [courses, students] = await Promise.all([
            rpcFetch('/listCourses'),
            rpcFetch('/listStudents')
        ]);

        return {
            courses,
            students,
            courseOptions: courses.map(function (course) {
                return { value: course.courseId, text: `${course.name} (${formatDataValue(course.startDate)} a ${formatDataValue(course.endDate)})` };
            }),
            studentOptions: students.map(function (student) {
                return { value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` };
            })
        };
    }

    document.getElementById('btnNewCourse').onclick = async function () {
        try {
            const users = await rpcFetch('/listUsers');
            const professors = users.filter(function (user) {
                return user.role === 'Docente' && user.status === 'enabled';
            });
            if (professors.length === 0) {
                alert('Debe existir al menos un docente habilitado.');
                return;
            }

            const data = await showFormModal('Crear Curso o Comisión', [
                { name: 'name', label: 'Nombre (Ej: Matemática 2 - Comisión A)' },
                { name: 'professorId', label: 'Docente', type: 'select', options: professors.map(function (user) { return { value: user.userId, text: user.username }; }) },
                { name: 'startDate', label: 'Fecha de inicio', type: 'date' },
                { name: 'endDate', label: 'Fecha de fin', type: 'date' }
            ]);
            if (!data) return;

            const res = await rpcFetch('/newCourse', data);
            menu.printResult({ message: 'Curso creado correctamente', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnModifyCourse').onclick = async function () {
        try {
            const [courses, users] = await Promise.all([
                rpcFetch('/listCourses'),
                rpcFetch('/listUsers')
            ]);
            const professors = users.filter(function (user) {
                return user.role === 'Docente' && user.status === 'enabled';
            });
            if (courses.length === 0 || professors.length === 0) {
                alert('Debe existir al menos un curso y un docente habilitado.');
                return;
            }

            const selected = await showFormModal('Seleccionar Curso', [
                { name: 'courseId', label: 'Curso', type: 'select', options: courses.map(function (course) { return { value: course.courseId, text: course.name }; }) }
            ]);
            if (!selected) return;

            const course = courses.find(function (item) {
                return item.courseId === selected.courseId;
            });

            const data = await showFormModal('Modificar Curso', [
                { name: 'courseId', label: 'Curso', type: 'select', options: [{ value: course.courseId, text: course.name }], value: course.courseId },
                { name: 'name', label: 'Nombre del curso', value: course.name },
                { name: 'professorId', label: 'Docente', type: 'select', options: professors.map(function (user) { return { value: user.userId, text: user.username }; }), value: course.professorId },
                { name: 'startDate', label: 'Fecha de inicio', type: 'date', value: course.startDate },
                { name: 'endDate', label: 'Fecha de fin', type: 'date', value: course.endDate }
            ]);
            if (!data) return;

            const res = await rpcFetch('/modifyCourse', data);
            menu.printResult({ message: 'Curso modificado correctamente', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnEnrollStudent').onclick = async function () {
        try {
            const { courseOptions, studentOptions } = await getCourseAndStudentOptions();
            if (courseOptions.length === 0 || studentOptions.length === 0) {
                alert('Debe existir al menos un curso y un estudiante.');
                return;
            }

            const data = await showFormModal('Inscribir Estudiante en Curso', [
                { name: 'courseId', label: 'Curso', type: 'select', options: courseOptions },
                { name: 'studentId', label: 'Estudiante', type: 'select', options: studentOptions }
            ]);
            if (!data) return;

            const res = await rpcFetch('/enrollStudent', data);
            menu.printResult({ message: 'Estudiante inscrito correctamente', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnRemoveEnrollment').onclick = async function () {
        try {
            const { courseOptions } = await getCourseAndStudentOptions();
            const courseSelection = await showFormModal('Seleccionar curso', [
                { name: 'courseId', label: 'Curso', type: 'select', options: courseOptions }
            ]);
            if (!courseSelection) return;

            const enrolled = await rpcFetch('/getStudentsFromCourse', courseSelection);
            const studentOptions = enrolled.students.map(function (student) {
                return { value: student.studentId, text: `${student.dni} - ${student.surname}, ${student.name}` };
            });
            if (studentOptions.length === 0) {
                alert('No hay estudiantes inscriptos en este curso.');
                return;
            }

            const data = await showFormModal('Desinscribir Estudiante', [
                { name: 'courseId', label: 'Curso', type: 'select', options: courseOptions, value: courseSelection.courseId },
                { name: 'studentId', label: 'Estudiante', type: 'select', options: studentOptions }
            ]);
            if (!data) return;

            const res = await rpcFetch('/removeStudentFromCourse', data);
            menu.printResult({ message: 'Estudiante desinscrito correctamente', ...res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnListCourses').onclick = async function () {
        try {
            const courses = await rpcFetch('/listCourses');
            menu.printResult({ cursos: courses });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnListCourseStudents').onclick = async function () {
        try {
            const { courseOptions } = await getCourseAndStudentOptions();
            const data = await showFormModal('Consultar Alumnos del Curso', [
                { name: 'courseId', label: 'Curso', type: 'select', options: courseOptions }
            ]);
            if (!data) return;

            const result = await rpcFetch('/getStudentsFromCourse', data);
            menu.printResult({ alumnos: result.students });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };
}
