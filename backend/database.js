import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

function loadConfig() {
    try {
        const data = readFileSync('./config.json', 'utf-8');
        return JSON.parse(data);
    } catch {
        return {
            server: { ip: '127.0.0.1', port: 3000 },
            database: { path: './db.sqlite3' }
        };
    }
}

const config = loadConfig();
const db = new DatabaseSync(resolve(config.database.path));

db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'enabled'
    );

    CREATE TABLE IF NOT EXISTS endpoints (
        id TEXT PRIMARY KEY,
        path TEXT UNIQUE NOT NULL COLLATE NOCASE
    );

    CREATE TABLE IF NOT EXISTS permissions (
        role TEXT NOT NULL,
        endpoint_id TEXT NOT NULL,
        PRIMARY KEY (role, endpoint_id),
        FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        dni TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        professor_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        FOREIGN KEY (professor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        weekly_hours INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS course_subjects (
        course_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        professor_id TEXT NOT NULL,
        PRIMARY KEY (course_id, subject_id, professor_id),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS academic_calendars (
        id TEXT PRIMARY KEY,
        academic_year INTEGER UNIQUE NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        holidays TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS course_schedules (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        classroom TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS class_sessions (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        professor_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        is_valid_session INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendances (
        id TEXT PRIMARY KEY,
        class_session_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT NOT NULL,
        early_departure INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS absence_justifications (
        id TEXT PRIMARY KEY,
        attendance_id TEXT UNIQUE NOT NULL,
        certificate_url TEXT,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        resolution_notes TEXT,
        FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alert_configurations (
        id TEXT PRIMARY KEY,
        min_attendance_percentage REAL NOT NULL,
        max_consecutive_absences INTEGER NOT NULL,
        max_total_absences_allowed INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pedagogical_observations (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        observation TEXT NOT NULL,
        severity TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );
`);

const courseSubjectForeignKeys = db.prepare('PRAGMA foreign_key_list(course_subjects)').all();
if (courseSubjectForeignKeys.some(function (foreignKey) { return foreignKey.table === 'legacy_courses'; })) {
    const courseSubjectCount = db.prepare('SELECT COUNT(*) AS count FROM course_subjects').get().count;
    if (courseSubjectCount > 0) {
        throw new Error('course_subjects antigua contiene datos y requiere una migración manual.');
    }
    db.exec('DROP TABLE course_subjects;');
    db.exec(`
        CREATE TABLE course_subjects (
            course_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            professor_id TEXT NOT NULL,
            PRIMARY KEY (course_id, subject_id, professor_id),
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
}

const legacyCourseTables = ['course_schedules', 'class_sessions'];
for (const tableName of legacyCourseTables) {
    const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${tableName})`).all();
    if (foreignKeys.some(function (foreignKey) { return foreignKey.table === 'legacy_courses'; })) {
        const rowCount = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count;
        if (rowCount > 0) {
            throw new Error(`${tableName} antigua contiene datos y requiere una migración manual.`);
        }
        db.exec(`DROP TABLE ${tableName};`);
    }
}

db.exec(`
    CREATE TABLE IF NOT EXISTS course_schedules (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        classroom TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS class_sessions (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        professor_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        is_valid_session INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
        course_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        PRIMARY KEY (course_id, student_id),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        professor_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        UNIQUE (course_id, date),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (professor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        attendance_session_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT NOT NULL,
        early_departure INTEGER NOT NULL DEFAULT 0,
        UNIQUE (attendance_session_id, student_id),
        FOREIGN KEY (attendance_session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id)
    );
`);

db.exec(`
    DROP TABLE IF EXISTS student_list_members;
    DROP TABLE IF EXISTS student_lists;
    DROP TABLE IF EXISTS legacy_courses;
`);

export { db, config };
