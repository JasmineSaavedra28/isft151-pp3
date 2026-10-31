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

    CREATE TABLE IF NOT EXISTS academic_calendars (
        id TEXT PRIMARY KEY,
        academic_year INTEGER UNIQUE NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        holidays TEXT NOT NULL DEFAULT '[]'
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

const obsoleteTables = [
    'attendances',
    'absence_justifications',
    'alert_configurations',
    'pedagogical_observations',
    'class_sessions',
    'course_schedules',
    'course_subjects',
    'subjects',
    'student_list_members',
    'student_lists',
    'legacy_courses',
    'members',
    'access',
    'endpoint',
    'group',
    'user'
];

for (const tableName of obsoleteTables) {
    db.exec(`DROP TABLE IF EXISTS "${tableName}"`);
}

export { db, config };
