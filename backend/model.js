import { randomUUID } from 'node:crypto';
import { db } from './database.js';

let activeSessions = new Map();

function verifyCredentials(username, passwordHash) {
    const stmt = db.prepare('SELECT id, role, status FROM users WHERE username = ? AND password = ?');
    const user = stmt.get(username, passwordHash);
    if (!user || user.status !== 'enabled') return null;
    return user;
}

function login(username, passwordHash) {
    const user = verifyCredentials(username, passwordHash);
    if (!user) return null;
    activeSessions.set(username, { status: 'enabled', role: user.role, userId: user.id });
    return activeSessions.get(username);
}

function logout(username) {
    if (!username || !activeSessions.has(username)) return false;
    activeSessions.delete(username);
    return true;
}

function userExists(username) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ? COLLATE NOCASE');
    const result = stmt.get(username);
    return result && result.count > 0;
}

function createUser(username, passwordHash, role) {
    const id = randomUUID();
    const stmt = db.prepare('INSERT INTO users (id, username, password, role, status) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, username, passwordHash, role, 'enabled');
    return { userId: id };
}

function disableUser(userId) {
    const stmt = db.prepare("UPDATE users SET status = 'disabled' WHERE id = ?");
    const result = stmt.run(userId);
    return result.changes > 0;
}

function deleteUser(userId) {
    const user = getUserById(userId);
    if (!user) return false;
    const assignments = db.prepare(`
        SELECT (
            (SELECT COUNT(*) FROM courses WHERE professor_id = ?) +
            (SELECT COUNT(*) FROM course_subjects WHERE professor_id = ?) +
            (SELECT COUNT(*) FROM class_sessions WHERE professor_id = ?) +
            (SELECT COUNT(*) FROM attendance_sessions WHERE professor_id = ?)
        ) AS count
    `).get(userId, userId, userId, userId);
    if (assignments.count > 0) throw new Error('UserHasAcademicData');

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    if (result.changes > 0) activeSessions.delete(user.username);
    return result.changes > 0;
}

function updateUserRole(userId, newRole) {
    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    const result = stmt.run(newRole, userId);
    return result.changes > 0 ? { userId, role: newRole } : null;
}

function modifyUser(userId, username) {
    const existingUser = getUserById(userId);
    if (!existingUser) return null;
    const duplicate = db.prepare(
        'SELECT COUNT(*) AS count FROM users WHERE username = ? COLLATE NOCASE AND id <> ?'
    ).get(username, userId);
    if (duplicate.count > 0) throw new Error('UsernameAlreadyExists');

    const stmt = db.prepare('UPDATE users SET username = ? WHERE id = ?');
    const result = stmt.run(username, userId);
    if (result.changes > 0 && activeSessions.has(existingUser.username)) {
        const session = activeSessions.get(existingUser.username);
        activeSessions.delete(existingUser.username);
        activeSessions.set(username, session);
    }
    return result.changes > 0 ? { userId, username } : null;
}

function getUserById(userId) {
    const stmt = db.prepare('SELECT id, username, role, status FROM users WHERE id = ?');
    return stmt.get(userId) || null;
}

function getUserByUsername(username) {
    const stmt = db.prepare('SELECT id, username, role, status FROM users WHERE username = ? COLLATE NOCASE');
    return stmt.get(username) || null;
}

function getAllUsers() {
    const stmt = db.prepare('SELECT id as userId, username, role, status FROM users ORDER BY username');
    return stmt.all();
}

function isAuthorized(username, endpointPath) {
    if (!username || !endpointPath) return false;
    const user = getUserByUsername(username);
    if (!user || user.status !== 'enabled') return false;
    if (user.role === 'Administrador') return true;

    const stmt = db.prepare(`
        SELECT COUNT(*) as count 
        FROM permissions p
        JOIN endpoints e ON p.endpoint_id = e.id
        WHERE p.role = ? AND e.path = ? COLLATE NOCASE
    `);
    const row = stmt.get(user.role, endpointPath);
    return row && row.count > 0;
}

function createStudent(name, surname, dni) {
    const id = randomUUID();
    const stmt = db.prepare('INSERT INTO students (id, name, surname, dni, status) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, name, surname, dni, 'active');
    return { studentId: id };
}

function deleteStudent(studentId) {
    const stmt = db.prepare("UPDATE students SET status = 'inactive' WHERE id = ?");
    const result = stmt.run(studentId);
    return result.changes > 0;
}

function modifyStudent(studentId, name, surname, dni) {
    const stmt = db.prepare('UPDATE students SET name = ?, surname = ?, dni = ? WHERE id = ?');
    const result = stmt.run(name, surname, dni, studentId);
    if (result.changes === 0) return null;
    return { studentId, name, surname, dni };
}

function getStudentById(studentId) {
    const stmt = db.prepare('SELECT id as studentId, name, surname, dni FROM students WHERE id = ? AND status = "active"');
    return stmt.get(studentId) || null;
}

function studentDniExists(dni) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM students WHERE dni = ?');
    const res = stmt.get(dni);
    return res && res.count > 0;
}

function getAllStudents() {
    const stmt = db.prepare("SELECT id as studentId, name, surname, dni FROM students WHERE status = 'active'");
    return stmt.all();
}

function createCourse(name, professorId, startDate, endDate) {
    const professor = getUserById(professorId);
    if (!professor || professor.role !== 'Docente' || professor.status !== 'enabled') {
        throw new Error('InvalidProfessor');
    }
    if (startDate > endDate) {
        throw new Error('InvalidCourseDates');
    }
    const id = randomUUID();
    const stmt = db.prepare('INSERT INTO courses (id, name, professor_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, name, professorId, startDate, endDate);
    return { courseId: id };
}

function modifyCourse(courseId, name, professorId, startDate, endDate) {
    const professor = getUserById(professorId);
    if (!professor || professor.role !== 'Docente' || professor.status !== 'enabled') {
        throw new Error('InvalidProfessor');
    }
    if (startDate > endDate) {
        throw new Error('InvalidCourseDates');
    }
    const stmt = db.prepare(`
        UPDATE courses
        SET name = ?, professor_id = ?, start_date = ?, end_date = ?
        WHERE id = ?
    `);
    const result = stmt.run(name, professorId, startDate, endDate, courseId);
    return result.changes > 0 ? { courseId, name, professorId, startDate, endDate } : null;
}

function getAllCourses() {
    const stmt = db.prepare(`
        SELECT c.id as courseId, c.name, c.professor_id as professorId,
               u.username as professorUsername, c.start_date as startDate,
               c.end_date as endDate
        FROM courses c
        JOIN users u ON u.id = c.professor_id
        ORDER BY c.name
    `);
    return stmt.all();
}

function getCoursesForUser(user) {
    const query = `
        SELECT c.id as courseId, c.name, c.professor_id as professorId,
               u.username as professorUsername, c.start_date as startDate,
               c.end_date as endDate
        FROM courses c
        JOIN users u ON u.id = c.professor_id
        ${user.role === 'Administrador' ? '' : 'WHERE c.professor_id = ?'}
        ORDER BY c.name
    `;
    return user.role === 'Administrador'
        ? db.prepare(query).all()
        : db.prepare(query).all(user.id);
}

function getCourseForUser(courseId, user) {
    const stmt = db.prepare(`
        SELECT c.id as courseId, c.name, c.professor_id as professorId,
               c.start_date as startDate, c.end_date as endDate
        FROM courses c
        WHERE c.id = ? AND (? = 'Administrador' OR c.professor_id = ?)
    `);
    return stmt.get(courseId, user.role, user.id) || null;
}

function createAcademicCalendar(academicYear, startDate, endDate, holidays) {
    const id = randomUUID();
    const normalizedHolidays = Array.isArray(holidays) ? holidays : [];
    const stmt = db.prepare(`
        INSERT INTO academic_calendars (id, academic_year, start_date, end_date, holidays)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(academic_year) DO UPDATE SET
            start_date = excluded.start_date,
            end_date = excluded.end_date,
            holidays = excluded.holidays
    `);
    stmt.run(id, academicYear, startDate, endDate, JSON.stringify(normalizedHolidays));
    return getAcademicCalendars().find(calendar => calendar.academicYear === Number(academicYear));
}

function getAcademicCalendars() {
    const calendars = db.prepare(`
        SELECT id, academic_year as academicYear, start_date as startDate,
               end_date as endDate, holidays
        FROM academic_calendars
        ORDER BY academic_year DESC
    `).all();
    return calendars.map(calendar => ({
        ...calendar,
        holidays: JSON.parse(calendar.holidays || '[]')
    }));
}

function getAcademicCalendarForDate(date) {
    return getAcademicCalendars().find(calendar =>
        date >= calendar.startDate && date <= calendar.endDate && !calendar.holidays.includes(date)
    ) || null;
}

function getAttendanceRoster(courseId, date, user) {
    const course = getCourseForUser(courseId, user);
    if (!course) throw new Error('CourseAccessDenied');
    if (!getAcademicCalendarForDate(date)) throw new Error('InvalidAcademicDate');

    const session = db.prepare(`
        SELECT id as sessionId, status
        FROM attendance_sessions
        WHERE course_id = ? AND date = ?
    `).get(courseId, date);
    const students = db.prepare(`
        SELECT s.id as studentId, s.name, s.surname, s.dni,
               ar.status as attendanceStatus,
               ar.early_departure as earlyDeparture
        FROM enrollments e
        JOIN students s ON s.id = e.student_id
        LEFT JOIN attendance_records ar
            ON ar.student_id = s.id
           AND ar.attendance_session_id = ?
        WHERE e.course_id = ? AND s.status = 'active'
        ORDER BY s.surname, s.name
    `).all(session?.sessionId || null, courseId);
    return { course, date, sessionId: session?.sessionId || null, students };
}

function saveAttendance(courseId, date, records, user) {
    const course = getCourseForUser(courseId, user);
    if (!course) throw new Error('CourseAccessDenied');
    if (!getAcademicCalendarForDate(date)) throw new Error('InvalidAcademicDate');
    if (!Array.isArray(records)) throw new Error('InvalidAttendanceRecords');

    const enrolledStudents = new Set(db.prepare(
        'SELECT student_id as studentId FROM enrollments WHERE course_id = ?'
    ).all(courseId).map(row => row.studentId));
    const allowedStatuses = new Set(['present', 'absent', 'late']);
    for (const record of records) {
        if (!enrolledStudents.has(record.studentId) || !allowedStatuses.has(record.status)) {
            throw new Error('InvalidAttendanceStudent');
        }
    }

    db.exec('BEGIN TRANSACTION;');
    try {
        db.prepare(`
            INSERT INTO attendance_sessions (id, course_id, professor_id, date)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(course_id, date) DO NOTHING
        `).run(randomUUID(), courseId, course.professorId, date);
        const session = db.prepare(
            'SELECT id FROM attendance_sessions WHERE course_id = ? AND date = ?'
        ).get(courseId, date);
        const upsert = db.prepare(`
            INSERT INTO attendance_records
                (id, attendance_session_id, student_id, status, early_departure)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(attendance_session_id, student_id) DO UPDATE SET
                status = excluded.status,
                early_departure = excluded.early_departure
        `);
        for (const record of records) {
            upsert.run(randomUUID(), session.id, record.studentId, record.status, record.earlyDeparture ? 1 : 0);
        }
        db.exec('COMMIT;');
        return { courseId, date, sessionId: session.id, saved: records.length };
    } catch (error) {
        db.exec('ROLLBACK;');
        throw error;
    }
}

function getAttendanceReport(courseId, user) {
    const course = getCourseForUser(courseId, user);
    if (!course) throw new Error('CourseAccessDenied');
    const sessions = db.prepare(`
        SELECT id as sessionId, date, status
        FROM attendance_sessions
        WHERE course_id = ?
        ORDER BY date
    `).all(courseId);
    const students = db.prepare(`
        SELECT s.id as studentId, s.name, s.surname, s.dni,
               COUNT(ar.id) as totalClasses,
               COALESCE(SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END), 0) as present,
               COALESCE(SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END), 0) as late,
               COALESCE(SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END), 0) as absent,
               COALESCE(SUM(CASE WHEN ar.early_departure = 1 THEN 1 ELSE 0 END), 0) as earlyDepartures,
               CASE WHEN COUNT(ar.id) = 0 THEN 0
                    ELSE ROUND(100.0 * SUM(CASE WHEN ar.status IN ('present', 'late') THEN 1 ELSE 0 END) / COUNT(ar.id), 2)
               END as attendancePercentage
        FROM enrollments e
        JOIN students s ON s.id = e.student_id
        LEFT JOIN attendance_records ar ON ar.student_id = s.id
            AND ar.attendance_session_id IN (
                SELECT id FROM attendance_sessions WHERE course_id = e.course_id
            )
        WHERE e.course_id = ? AND s.status = 'active'
        GROUP BY s.id, s.name, s.surname, s.dni
        ORDER BY s.surname, s.name
    `).all(courseId);
    const records = db.prepare(`
        SELECT ar.student_id as studentId, ats.date, ar.status, ar.early_departure as earlyDeparture
        FROM attendance_records ar
        JOIN attendance_sessions ats ON ats.id = ar.attendance_session_id
        WHERE ats.course_id = ?
    `).all(courseId);
    const attendanceByStudent = new Map();
    for (const record of records) {
        if (!attendanceByStudent.has(record.studentId)) {
            attendanceByStudent.set(record.studentId, {});
        }
        attendanceByStudent.get(record.studentId)[record.date] = {
            status: record.status,
            earlyDeparture: Boolean(record.earlyDeparture)
        };
    }
    return {
        course,
        sessions,
        students: students.map(student => ({
            ...student,
            attendanceByDate: attendanceByStudent.get(student.studentId) || {}
        }))
    };
}

function addStudentToCourse(courseId, studentId) {
    const stmt = db.prepare('INSERT OR IGNORE INTO enrollments (course_id, student_id) VALUES (?, ?)');
    const result = stmt.run(courseId, studentId);
    return result.changes > 0;
}

function removeStudentFromCourse(courseId, studentId) {
    const stmt = db.prepare('DELETE FROM enrollments WHERE course_id = ? AND student_id = ?');
    const result = stmt.run(courseId, studentId);
    return result.changes > 0;
}

function getStudentsFromCourse(courseId) {
    const stmt = db.prepare(`
        SELECT s.id as studentId, s.name, s.surname, s.dni
        FROM enrollments e
        JOIN students s ON s.id = e.student_id
        WHERE e.course_id = ? AND s.status = 'active'
        ORDER BY s.surname, s.name
    `);
    return { courseId, students: stmt.all(courseId) };
}


export {
    login,
    logout,
    userExists,
    createUser,
    modifyUser,
    disableUser,
    deleteUser,
    updateUserRole,
    getUserById,
    getUserByUsername,
    getAllUsers,
    isAuthorized,
    createStudent,
    deleteStudent,
    modifyStudent,
    getStudentById,
    studentDniExists,
    getAllStudents,
    createCourse,
    modifyCourse,
    getAllCourses,
    getCoursesForUser,
    addStudentToCourse,
    removeStudentFromCourse,
    getStudentsFromCourse,
    createAcademicCalendar,
    getAcademicCalendars,
    getAttendanceRoster,
    saveAttendance,
    getAttendanceReport
};
