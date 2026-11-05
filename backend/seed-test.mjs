import crypto from 'node:crypto';
import { randomUUID } from 'node:crypto';

process.env.DB_PATH = process.env.DB_PATH || './db-test.sqlite3';

const { db } = await import('./database.js');

const passwordHash = crypto.createHash('sha256').update('1234').digest('hex');
const testStudentsPerCourse = [24, 27, 22];
const attendanceStatuses = ['present', 'present', 'present', 'late', 'absent'];
const studentNames = [
    'Sofia', 'Mateo', 'Valentina', 'Santiago', 'Camila', 'Benjamin',
    'Martina', 'Thiago', 'Agustina', 'Joaquin', 'Milagros', 'Nicolas',
    'Julieta', 'Franco', 'Lucia', 'Tomas', 'Micaela', 'Facundo',
    'Abril', 'Lautaro', 'Emilia', 'Gonzalo', 'Renata', 'Bruno',
    'Catalina', 'Maximo', 'Bianca', 'Federico', 'Delfina', 'Ignacio',
    'Paula', 'Ezequiel', 'Clara', 'Ramiro', 'Florencia', 'Martin',
    'Mia', 'Agustin', 'Carolina', 'Leandro', 'Ana', 'Mariano',
    'Victoria', 'Pablo', 'Josefina', 'Diego', 'Mara', 'Hernan',
    'Zoe', 'Rocio', 'Juan', 'Ailén', 'Lucas', 'Marina', 'Nahir',
    'Matias', 'Lara', 'Federico', 'Cecilia', 'Alejo', 'Daniela',
    'Nicolas', 'Belén', 'Rodrigo', 'Iara', 'Gustavo', 'Noelia',
    'Elian', 'Micaela', 'Lisandro', 'Celeste', 'Nahuel', 'Veronica',
    'Bautista'
];
const studentSurnames = [
    'Gonzalez', 'Rodriguez', 'Fernandez', 'Lopez', 'Martinez', 'Diaz',
    'Perez', 'Sanchez', 'Romero', 'Garcia', 'Sosa', 'Torres',
    'Alvarez', 'Ruiz', 'Ramirez', 'Flores', 'Acosta', 'Benitez',
    'Medina', 'Suarez', 'Herrera', 'Aguirre', 'Gimenez', 'Molina',
    'Castro', 'Ortiz', 'Silva', 'Rojas', 'Nunez', 'Luna',
    'Juarez', 'Cabrera', 'Navarro', 'Dominguez', 'Vega', 'Pereyra',
    'Ferreyra', 'Coronel', 'Vazquez', 'Maldonado', 'Rivero', 'Peralta',
    'Mendez', 'Miranda', 'Cardozo', 'Quiroga', 'Ledesma', 'Luna',
    'Farias', 'Barrios', 'Caceres', 'Ojeda', 'Villarreal', 'Maidana',
    'Cortez', 'Escobar', 'Galarza', 'Ibarra', 'Godoy', 'Bustos',
    'Mansilla', 'Bravo', 'Roldan', 'Caceres', 'Valdez', 'Ponce',
    'Duarte', 'Figueroa', 'Campos', 'Vera', 'Moyano', 'Franco',
    'Cano'
];

function clearTestData() {
    db.exec('BEGIN TRANSACTION;');
    try {
        db.exec(`
            DELETE FROM attendance_records;
            DELETE FROM attendance_sessions;
            DELETE FROM enrollments;
            DELETE FROM courses;
            DELETE FROM academic_calendars;
            DELETE FROM students;
            DELETE FROM permissions;
            DELETE FROM endpoints;
            DELETE FROM users;
        `);
        db.exec('COMMIT;');
    } catch (error) {
        db.exec('ROLLBACK;');
        throw error;
    }
}

function insertUser(username, role) {
    const id = randomUUID();
    db.prepare(`
        INSERT INTO users (id, username, password, role, status)
        VALUES (?, ?, ?, ?, 'enabled')
    `).run(id, username, passwordHash, role);
    return id;
}

function insertStudent(index) {
    const id = randomUUID();
    const name = studentNames[(index - 1) % studentNames.length];
    const surname = studentSurnames[(index - 1) % studentSurnames.length];
    db.prepare(`
        INSERT INTO students (id, name, surname, dni, status)
        VALUES (?, ?, ?, ?, 'active')
    `).run(id, name, surname, `4000${String(index).padStart(4, '0')}`);
    return id;
}

function insertCourse(name, professorId) {
    const id = randomUUID();
    db.prepare(`
        INSERT INTO courses (id, name, professor_id, start_date, end_date)
        VALUES (?, ?, ?, '2026-03-01', '2026-12-15')
    `).run(id, name, professorId);
    return id;
}

function getWeekdays(startDate, amount) {
    const dates = [];
    const date = new Date(`${startDate}T12:00:00Z`);
    while (dates.length < amount) {
        const day = date.getUTCDay();
        if (day !== 0 && day !== 6) {
            dates.push(date.toISOString().slice(0, 10));
        }
        date.setUTCDate(date.getUTCDate() + 1);
    }
    return dates;
}

function insertAttendance(courseId, professorId, studentIds, dates) {
    const insertSession = db.prepare(`
        INSERT INTO attendance_sessions (id, course_id, professor_id, date)
        VALUES (?, ?, ?, ?)
    `);
    const insertRecord = db.prepare(`
        INSERT INTO attendance_records
            (id, attendance_session_id, student_id, status, early_departure)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (const [dateIndex, date] of dates.entries()) {
        const sessionId = randomUUID();
        insertSession.run(sessionId, courseId, professorId, date);
        studentIds.forEach((studentId, studentIndex) => {
            const status = attendanceStatuses[(dateIndex + studentIndex) % attendanceStatuses.length];
            const earlyDeparture = (dateIndex + studentIndex) % 13 === 0 ? 1 : 0;
            insertRecord.run(randomUUID(), sessionId, studentId, status, earlyDeparture);
        });
    }
}

function seedPermissions() {
    const endpoints = [
        'registerUser', 'disableUser', 'deleteUser', 'updateUserRole', 'modifyUser',
        'newStudent', 'deleteStudent', 'modifyStudent', 'getStudent', 'listStudents',
        'newCourse', 'modifyCourse', 'listCourses', 'enrollStudent',
        'removeStudentFromCourse', 'getStudentsFromCourse', 'newAcademicCalendar',
        'listAcademicCalendars', 'getAttendanceRoster', 'saveAttendance',
        'deleteAttendance', 'getAttendanceReport'
    ];
    const attendanceEndpoints = new Set([
        'listCourses', 'getAttendanceRoster', 'saveAttendance',
        'deleteAttendance', 'getAttendanceReport'
    ]);
    const insertEndpoint = db.prepare(
        'INSERT INTO endpoints (id, path) VALUES (?, ?)'
    );
    const insertPermission = db.prepare(
        'INSERT INTO permissions (role, endpoint_id) VALUES (?, ?)'
    );
    for (const path of endpoints) {
        const endpointId = randomUUID();
        insertEndpoint.run(endpointId, path);
        if (attendanceEndpoints.has(path)) {
            insertPermission.run('Docente', endpointId);
            insertPermission.run('Preceptor', endpointId);
        }
    }
}

clearTestData();

const pabloId = insertUser('pablo', 'Administrador');
const jazminId = insertUser('jazmin', 'Administrador');
insertUser('admin', 'Administrador');
const carlosId = insertUser('carlos', 'Preceptor');
const joseId = insertUser('jose', 'Docente');
const matiasId = insertUser('matias', 'Docente');
const gabrielId = insertUser('gabriel', 'Docente');
seedPermissions();

const calendarId = randomUUID();
db.prepare(`
    INSERT INTO academic_calendars (id, academic_year, start_date, end_date, holidays)
    VALUES (?, 2026, '2026-03-01', '2026-12-15', '[]')
`).run(calendarId);

const courses = [
    { name: 'Algoritmos 1', professorId: joseId },
    { name: 'Seminario', professorId: matiasId },
    { name: 'Practicas 3', professorId: matiasId }
];
const dates = getWeekdays('2026-03-02', 30);

for (const [courseIndex, courseData] of courses.entries()) {
    const courseId = insertCourse(courseData.name, courseData.professorId);
    const studentIds = Array.from(
        { length: testStudentsPerCourse[courseIndex] },
        (_, index) => insertStudent(courseIndex * 100 + index + 1)
    );
    const enroll = db.prepare(`
        INSERT INTO enrollments (course_id, student_id)
        VALUES (?, ?)
    `);
    for (const studentId of studentIds) {
        enroll.run(courseId, studentId);
    }
    insertAttendance(courseId, courseData.professorId, studentIds, dates);
}

console.log(`Base de prueba creada en ${process.env.DB_PATH}`);
console.log('Usuarios: pablo, jazmin, carlos, jose, matias y gabriel');
console.log('Contraseña de todos: 1234');
console.log(`Cursos: ${courses.length}; estudiantes: ${testStudentsPerCourse.join(', ')} por curso; asistencias: ${dates.length} fechas por curso`);
