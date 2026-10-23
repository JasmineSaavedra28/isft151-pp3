# Documentacion de la API

La API HTTP implementada se ejecuta por defecto en `http://localhost:3000`. Las rutas reciben solicitudes `POST` con contenido JSON. El backend acepta `OPTIONS` para CORS.

## Autenticacion

`/login` recibe la identidad mediante `x-user-id` y una credencial Bearer. Las demas rutas requieren una sesion iniciada y autorizacion por rol. La interfaz envia `Content-Type: application/json`, `x-user-id`, `Authorization` y `x-api-version`.

## Rutas implementadas

- Sesion: `/login`, `/logout`.
- Usuarios: `/registerUser`, `/disableUser`, `/deleteUser`, `/updateUserRole`, `/modifyUser`, `/listUsers`.
- Estudiantes: `/newStudent`, `/deleteStudent`, `/modifyStudent`, `/getStudent`, `/listStudents`.
- Cursos e inscripciones: `/newCourse`, `/modifyCourse`, `/listCourses`, `/enrollStudent`, `/removeStudentFromCourse`, `/getStudentsFromCourse`.
- Calendarios: `/newAcademicCalendar`, `/listAcademicCalendars`.
- Asistencia: `/getAttendanceRoster`, `/saveAttendance`, `/getAttendanceReport`.

Los contratos propuestos para funcionalidades pendientes, con sus solicitudes, respuestas y permisos, se documentan en el [README principal](../README.md#borrador-de-contratos-de-api). No se deben considerar rutas implementadas hasta que aparezcan registradas en `backend/main.mjs`.
