import { createServer } from 'node:http';
import { URL } from 'node:url';
import { config } from './database.js';
import * as handlers from './handlers.js';
import * as model from './model.js';

const router = new Map();

router.set('/login', handlers.loginHandler);
router.set('/logout', handlers.logoutHandler);
router.set('/registerUser', handlers.registerUserHandler);
router.set('/disableUser', handlers.disableUserHandler);
router.set('/deleteUser', handlers.deleteUserHandler);
router.set('/updateUserRole', handlers.updateUserRoleHandler);
router.set('/modifyUser', handlers.modifyUserHandler);
router.set('/listUsers', handlers.listUsersHandler);

router.set('/newStudent', handlers.newStudentHandler);
router.set('/deleteStudent', handlers.deleteStudentHandler);
router.set('/modifyStudent', handlers.modifyStudentHandler);
router.set('/getStudent', handlers.getStudentHandler);

router.set('/listStudents', handlers.listStudentsHandler);
router.set('/newCourse', handlers.newCourseHandler);
router.set('/modifyCourse', handlers.modifyCourseHandler);
router.set('/listCourses', handlers.listCoursesHandler);
router.set('/enrollStudent', handlers.enrollStudentHandler);
router.set('/removeStudentFromCourse', handlers.removeStudentFromCourseHandler);
router.set('/getStudentsFromCourse', handlers.getStudentsFromCourseHandler);
router.set('/newAcademicCalendar', handlers.newAcademicCalendarHandler);
router.set('/listAcademicCalendars', handlers.listAcademicCalendarsHandler);
router.set('/getAttendanceRoster', handlers.getAttendanceRosterHandler);
router.set('/saveAttendance', handlers.saveAttendanceHandler);
router.set('/getAttendanceReport', handlers.getAttendanceReportHandler);

async function requestDispatcher(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id, Authorization, x-api-version');

    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        return response.end();
    }

    if (request.method !== 'POST') {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Only POST is supported'] }));
    }

    const parsedUrl = new URL(request.url, `http://${config.server.ip}`);
    const pathname = parsedUrl.pathname;
    const handler = router.get(pathname);

    if (!handler) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'BadRequest', detail: ['Endpoint not found'] }));
    }

    if (pathname === '/login') {
        return handler(request, response);
    }

    const username = request.headers['x-user-id'];
    const endpointName = pathname.slice(1);

    if (!model.isAuthorized(username, endpointName)) {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ exception: 'Unauthorized', detail: ['Access denied'] }));
    }

    try {
        await handler(request, response);
    } catch {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'ServerError', detail: ['Internal server error'] }));
    }
}

const server = createServer(requestDispatcher);
server.listen(config.server.port, config.server.ip, () => {
    console.log(`Server running on port ${config.server.port}`);
    console.log('\nUsuarios:');
    console.table(model.getAllUsers());
    console.log('Estudiantes:');
    console.table(model.getAllStudents());
});
