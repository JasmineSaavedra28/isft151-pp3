import * as model from './model.js';

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let payload = '';
        request.on('data', chunk => payload += chunk.toString());
        request.on('end', () => {
            if (!payload) return resolve({});
            try {
                resolve(JSON.parse(payload));
            } catch {
                reject(new Error('InvalidJSON'));
            }
        });
        request.on('error', reject);
    });
}

async function loginHandler(request, response) {
    const username = request.headers['x-user-id'];
    const authHeader = request.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!username || !token) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing credentials'] }));
    }

    const session = model.login(username, token);
    if (!session) {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'Unauthorized', detail: ['Invalid credentials'] }));
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ userId: session.userId, role: session.role }));
}

async function logoutHandler(request, response) {
    const username = request.headers['x-user-id'];
    if (!username || !model.logout(username)) {
        response.writeHead(422, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'DomainError', detail: ['No active session found'] }));
    }
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({}));
}

async function registerUserHandler(request, response) {
    try {
        const body = await readJsonBody(request);
        const { username, password, role } = body;

        if (!username || !password || !role) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Incomplete fields'] }));
        }

        if (model.userExists(username)) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['User already exists'] }));
        }

        const result = model.createUser(username, password, role);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function disableUserHandler(request, response) {
    try {
        const body = await readJsonBody(request);
        const { userId } = body;

        if (!userId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing userId'] }));
        }

        const success = model.disableUser(userId);
        if (!success) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['User could not be disabled'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({}));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function deleteUserHandler(request, response) {
    try {
        const body = await readJsonBody(request);
        const user = body.username ? model.getUserByUsername(body.username) : null;
        const userId = body.userId || user?.id;
        if (!userId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing userId or username'] }));
        }

        const success = model.deleteUser(userId);
        if (!success) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['User not found'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({}));
    } catch (error) {
        if (error.message === 'UserHasAcademicData') {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['User cannot be deleted while assigned to academic data'] }));
        }
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function updateUserRoleHandler(request, response) {
    try {
        const body = await readJsonBody(request);
        const { userId, newRole } = body;

        if (!userId || !newRole) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing parameters'] }));
        }

        const updated = model.updateUserRole(userId, newRole);
        if (!updated) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['User not found'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(updated));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function modifyUserHandler(request, response) {
    try {
        const { userId, username } = await readJsonBody(request);
        if (!userId || !username) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing userId or username'] }));
        }

        const result = model.modifyUser(userId, username);
        if (!result) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['User not found'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch (error) {
        if (error.message === 'UsernameAlreadyExists') {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Username already exists'] }));
        }
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function listUsersHandler(request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(model.getAllUsers()));
}

async function newStudentHandler(request, response) {
    try {
        const { name, surname, dni } = await readJsonBody(request);
        if (!name || !surname || !dni) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing student fields'] }));
        }

        if (model.studentDniExists(dni)) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Student DNI already registered'] }));
        }

        const result = model.createStudent(name, surname, dni);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function deleteStudentHandler(request, response) {
    try {
        const { studentId } = await readJsonBody(request);
        if (!studentId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing studentId'] }));
        }

        const success = model.deleteStudent(studentId);
        if (!success) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Student not found'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({}));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function modifyStudentHandler(request, response) {
    try {
        const { studentId, name, surname, dni } = await readJsonBody(request);
        if (!studentId || !name || !surname || !dni) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Incomplete fields'] }));
        }

        const result = model.modifyStudent(studentId, name, surname, dni);
        if (!result) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Student could not be updated'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function getStudentHandler(request, response) {
    try {
        const { studentId } = await readJsonBody(request);
        if (!studentId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing studentId'] }));
        }

        const student = model.getStudentById(studentId);
        if (!student) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Student not found'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(student));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function listStudentsHandler(request, response) {
    try {
        const list = model.getAllStudents();
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(list));
    } catch {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'ServerError', detail: ['Internal error'] }));
    }
}

async function newCourseHandler(request, response) {
    try {
        const { name, professorId, startDate, endDate } = await readJsonBody(request);
        if (!name || !professorId || !startDate || !endDate) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing course fields'] }));
        }

        const result = model.createCourse(name, professorId, startDate, endDate);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch {
        response.writeHead(422, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Course could not be created'] }));
    }
}

async function modifyCourseHandler(request, response) {
    try {
        const { courseId, name, professorId, startDate, endDate } = await readJsonBody(request);
        if (!courseId || !name || !professorId || !startDate || !endDate) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing course fields'] }));
        }

        const result = model.modifyCourse(courseId, name, professorId, startDate, endDate);
        if (!result) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Course not found'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch (error) {
        const detail = error.message === 'InvalidProfessor'
            ? 'Course professor must be an enabled teacher'
            : error.message === 'InvalidCourseDates'
                ? 'Course start date must be before end date'
                : 'Malformed request body';
        response.writeHead(error.message === 'InvalidProfessor' || error.message === 'InvalidCourseDates' ? 422 : 400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: error.message === 'Malformed request body' ? 'BadRequest' : 'DomainError', detail: [detail] }));
    }
}

async function listCoursesHandler(request, response) {
    try {
        const user = model.getUserByUsername(request.headers['x-user-id']);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(model.getCoursesForUser(user)));
    } catch {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'ServerError', detail: ['Internal error'] }));
    }
}

async function enrollStudentHandler(request, response) {
    try {
        const { courseId, studentId } = await readJsonBody(request);
        if (!courseId || !studentId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing course or student ID'] }));
        }

        if (!model.addStudentToCourse(courseId, studentId)) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Student already enrolled or invalid course/student'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({}));
    } catch {
        response.writeHead(422, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Enrollment could not be created'] }));
    }
}

async function removeStudentFromCourseHandler(request, response) {
    try {
        const { courseId, studentId } = await readJsonBody(request);
        if (!courseId || !studentId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing identifiers'] }));
        }

        if (!model.removeStudentFromCourse(courseId, studentId)) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Enrollment not found'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({}));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function getStudentsFromCourseHandler(request, response) {
    try {
        const { courseId } = await readJsonBody(request);
        if (!courseId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing courseId'] }));
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(model.getStudentsFromCourse(courseId)));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function newAcademicCalendarHandler(request, response) {
    try {
        const { academicYear, startDate, endDate, holidays } = await readJsonBody(request);
        if (!academicYear || !startDate || !endDate || !Array.isArray(holidays)) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Incomplete calendar fields'] }));
        }
        if (startDate > endDate) {
            response.writeHead(422, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'DomainError', detail: ['Calendar start date must be before end date'] }));
        }

        const result = model.createAcademicCalendar(academicYear, startDate, endDate, holidays);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Malformed request body'] }));
    }
}

async function listAcademicCalendarsHandler(request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(model.getAcademicCalendars()));
}

function attendanceErrorResponse(response, error) {
    if (error.message === 'CourseAccessDenied') {
        response.writeHead(403, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'Forbidden', detail: ['The course is not assigned to this teacher'] }));
    }
    if (error.message === 'InvalidAcademicDate') {
        response.writeHead(422, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'DomainError', detail: ['The date is outside the academic calendar or is a holiday'] }));
    }
    response.writeHead(400, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Invalid attendance data'] }));
}

async function getAttendanceRosterHandler(request, response) {
    try {
        const { courseId, date } = await readJsonBody(request);
        if (!courseId || !date) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing courseId or date'] }));
        }
        const user = model.getUserByUsername(request.headers['x-user-id']);
        const result = model.getAttendanceRoster(courseId, date, user);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch (error) {
        return attendanceErrorResponse(response, error);
    }
}

async function saveAttendanceHandler(request, response) {
    try {
        const { courseId, date, records } = await readJsonBody(request);
        if (!courseId || !date || !Array.isArray(records)) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing attendance fields'] }));
        }
        const user = model.getUserByUsername(request.headers['x-user-id']);
        const result = model.saveAttendance(courseId, date, records, user);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch (error) {
        return attendanceErrorResponse(response, error);
    }
}

async function getAttendanceReportHandler(request, response) {
    try {
        const { courseId } = await readJsonBody(request);
        if (!courseId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Missing courseId'] }));
        }
        const user = model.getUserByUsername(request.headers['x-user-id']);
        const result = model.getAttendanceReport(courseId, user);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(result));
    } catch (error) {
        if (error.message === 'CourseAccessDenied') {
            response.writeHead(403, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ exception: 'Forbidden', detail: ['The course is not assigned to this teacher'] }));
        }
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Invalid report request'] }));
    }
}


export {
    loginHandler,
    logoutHandler,
    registerUserHandler,
    disableUserHandler,
    updateUserRoleHandler,
    modifyUserHandler,
    listUsersHandler,
    deleteUserHandler,
    newStudentHandler,
    deleteStudentHandler,
    modifyStudentHandler,
    getStudentHandler,
    listStudentsHandler,
    newCourseHandler,
    modifyCourseHandler,
    listCoursesHandler,
    enrollStudentHandler,
    removeStudentFromCourseHandler,
    getStudentsFromCourseHandler,
    newAcademicCalendarHandler,
    listAcademicCalendarsHandler,
    getAttendanceRosterHandler,
    saveAttendanceHandler,
    getAttendanceReportHandler
};
