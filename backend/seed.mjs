import crypto from 'node:crypto';
import { randomUUID } from 'node:crypto';
import { createUser, userExists } from './model.js';
import { db } from './database.js';

const username = 'admin';
const rawPassword = '1234';
const role = 'Administrador';

const passwordHash = crypto.createHash('sha256').update(rawPassword).digest('hex');

if (!userExists(username)) {
    const result = createUser(username, passwordHash, role);
    console.log(`Admin user created: ${result.userId}`);
}

const endpoints = [
    'registerUser', 'disableUser', 'deleteUser', 'updateUserRole', 'modifyUser',
    'newStudent', 'deleteStudent', 'modifyStudent', 'getStudent',
    'listStudents',
    'newCourse', 'modifyCourse', 'listCourses', 'enrollStudent', 'removeStudentFromCourse', 'getStudentsFromCourse',
    'newAcademicCalendar', 'listAcademicCalendars', 'getAttendanceRoster', 'saveAttendance', 'getAttendanceReport'
];

const insertEndpoint = db.prepare('INSERT OR IGNORE INTO endpoints (id, path) VALUES (?, ?)');
const insertPerm = db.prepare('INSERT OR IGNORE INTO permissions (role, endpoint_id) VALUES (?, ?)');
db.prepare("DELETE FROM permissions WHERE role IN ('Preceptor', 'Docente')").run();
const docenteEndpoints = new Set(['listCourses', 'getAttendanceRoster', 'saveAttendance', 'getAttendanceReport']);

for (const path of endpoints) {
    const existing = db.prepare('SELECT id FROM endpoints WHERE path = ?').get(path);
    const endpointId = existing ? existing.id : randomUUID();
    if (!existing) {
        insertEndpoint.run(endpointId, path);
    }

    if (docenteEndpoints.has(path)) {
        insertPerm.run('Docente', endpointId);
    }
}

const obsoleteEndpoints = [
    'newStudentList', 'addStudentToList', 'removeStudentFromList',
    'moveStudentFromList', 'getStudentsFromList', 'removeStudentList',
    'editStudentList', 'listStudentLists'
];
const deleteEndpoint = db.prepare('DELETE FROM endpoints WHERE path = ? COLLATE NOCASE');
for (const path of obsoleteEndpoints) {
    deleteEndpoint.run(path);
}

console.log('Endpoints and RBAC seeded successfully.');
