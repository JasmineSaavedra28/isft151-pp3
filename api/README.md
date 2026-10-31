# Documentacion de la API

La API HTTP implementada se ejecuta por defecto en `http://localhost:3000`. Todas las operaciones utilizan solicitudes `POST` con contenido JSON. El backend acepta `OPTIONS` para CORS.

Esta convencion fue definida por la catedra y no constituye una opcion pendiente de revision.

## Autenticacion

`/login` recibe la identidad mediante `x-user-id` y una credencial Bearer. Las demas rutas requieren una sesion iniciada y autorizacion por rol. La interfaz envia `Content-Type: application/json`, `x-user-id`, `Authorization` y `x-api-version`.

## Rutas implementadas

- Sesion: `/login`, `/logout`.
- Usuarios: `/registerUser`, `/disableUser`, `/deleteUser`, `/updateUserRole`, `/modifyUser`, `/listUsers`.
- Estudiantes: `/newStudent`, `/deleteStudent`, `/modifyStudent`, `/getStudent`, `/listStudents`.
- Cursos e inscripciones: `/newCourse`, `/modifyCourse`, `/listCourses`, `/enrollStudent`, `/removeStudentFromCourse`, `/getStudentsFromCourse`.
- Calendarios: `/newAcademicCalendar`, `/listAcademicCalendars`.
- Asistencia: `/getAttendanceRoster`, `/saveAttendance`, `/getAttendanceReport`.

El codigo autoritativo de las rutas disponibles esta en [backend/main.mjs](../backend/main.mjs). Las rutas siguientes son propuestas y no deben considerarse implementadas hasta que aparezcan registradas ahi.

## Contratos no implementados

### Asignaturas y horarios

- `/newSubject`, `/deleteSubject`, `/modifySubject`: crear, eliminar y modificar asignaturas.
- `/assignSubjectProfessor`, `/assignSubjectCourse`: asignar docentes y cursos a asignaturas.
- `/setValidClassDates`: definir periodo lectivo y feriados.
- `/assignCourseSchedule`, `/assignSubjectSchedule`: asignar horarios generales y por asignatura.

### Asistencias y justificaciones

- `/registerProfessorAttendance`: validar el dictado mediante asistencia docente.
- `/registerStudentAttendance`, `/linkAttendanceToClass`, `/modifyAttendance`: registrar, vincular y corregir asistencias.
- `/calculateAttendancePercentage`: calcular el porcentaje individual.
- `/registerAbsence`, `/manageJustification`, `/uploadCertificate`: registrar faltas y gestionar documentos.
- `/assignJustification`, `/listJustifications`, `/justifyAbsence`: vincular, consultar y resolver justificaciones.

### Alertas y reportes

Las siguientes rutas corresponden a requerimientos planeados que quedaron fuera del alcance de esta entrega y no se consideran pendientes de implementacion inmediata:

- `/configAlert`: definir umbrales institucionales.
- `/generateAlert`, `/generateAlertAccumulation`, `/generateAlertPedagogical`: evaluar riesgos por asistencia, acumulacion o criterio pedagogico.
- `/associateAlertToStudent`, `/generateOutAlert`: asociar alertas y detectar posible perdida de regularidad.
- Los filtros por estudiante, curso, comision y periodo deben acordarse para completar la consulta de reportes y estados.

### Esquemas propuestos

- `/newSubject` (Administrador): request `{ "name": "string", "code": "string", "weeklyHours": "number" }`; response `{ "subjectId": "string", "name": "string", "code": "string", "weeklyHours": "number" }`.
- `/deleteSubject` (Administrador): request `{ "subjectId": "string" }`; response `{ "success": "boolean" }`.
- `/modifySubject` (Administrador): request `{ "subjectId": "string", "name": "string", "code": "string", "weeklyHours": "number" }`; response `{ "subjectId": "string", "name": "string", "code": "string", "weeklyHours": "number", "success": "boolean" }`.
- `/assignSubjectProfessor` (Administrador, Preceptor): request `{ "subjectId": "string", "professorId": "string" }`; response `{ "subjectId": "string", "professorId": "string", "success": "boolean" }`.
- `/assignSubjectCourse` (Administrador, Preceptor): request `{ "subjectId": "string", "courseId": "string" }`; response `{ "subjectId": "string", "courseId": "string", "success": "boolean" }`.
- `/setValidClassDates` (Administrador): request `{ "academicTerm": "string", "startDate": "string", "endDate": "string", "holidays": ["string"] }`; response `{ "calendarId": "string", "academicTerm": "string", "totalValidDays": "number", "success": "boolean" }`.
- `/assignCourseSchedule` (Preceptor, Administrador): request `{ "courseId": "string", "schedule": [{ "dayOfWeek": "string", "startTime": "string", "endTime": "string" }] }`; response `{ "courseId": "string", "scheduleAssigned": "boolean" }`.
- `/assignSubjectSchedule` (Preceptor, Administrador): request `{ "courseId": "string", "subjectId": "string", "schedule": [{ "dayOfWeek": "string", "startTime": "string", "endTime": "string", "classroom": "string" }] }`; response `{ "courseId": "string", "subjectId": "string", "scheduleAssigned": "boolean" }`.
- `/registerProfessorAttendance` (Preceptor, Administrador, Docente): request `{ "professorId": "string", "classId": "string", "date": "string", "status": "string" }`; response `{ "professorAttendanceId": "string", "classId": "string", "classConducted": "boolean" }`.
- `/registerStudentAttendance` (Docente, Preceptor): request `{ "studentId": "string", "classId": "string", "status": "string" }`; response `{ "attendanceId": "string", "studentId": "string", "status": "string" }`.
- `/linkAttendanceToClass` (Preceptor, Docente): request `{ "classId": "string", "attendanceIds": ["string"] }`; response `{ "classId": "string", "linkedCount": "number", "success": "boolean" }`.
- `/modifyAttendance` (Preceptor, Administrador): request `{ "attendanceId": "string", "userId": "string", "newStatus": "string", "reason": "string" }`; response `{ "attendanceId": "string", "updatedStatus": "string", "modifiedBy": "string", "success": "boolean" }`.
- `/calculateAttendancePercentage` (Docente, Preceptor, Estudiante): request `{ "studentId": "string", "subjectId": "string" }`; response `{ "studentId": "string", "subjectId": "string", "totalClasses": "number", "attendedClasses": "number", "percentage": "number" }`.
- `/registerAbsence` (Preceptor, Docente): request `{ "studentId": "string", "date": "string", "type": "string", "subjectId": "string" }`; response `{ "absenceId": "string", "studentId": "string", "date": "string", "justified": "boolean" }`.
- `/manageJustification` (Preceptor, Administrador): request `{ "absenceId": "string", "status": "string", "reason": "string" }`; response `{ "justificationId": "string", "absenceId": "string", "status": "string" }`.
- `/uploadCertificate` (Preceptor, Estudiante): request `{ "absenceId": "string", "fileUrl": "string", "documentType": "string", "notes": "string" }`; response `{ "certificateId": "string", "absenceId": "string", "uploadedAt": "string" }`.
- `/assignJustification` (Preceptor): request `{ "studentId": "string", "absenceId": "string", "justificationId": "string" }`; response `{ "studentId": "string", "absenceId": "string", "justificationId": "string", "success": "boolean" }`.
- `/listJustifications` (Preceptor, Docente, Administrador): request `{ "studentId": "string" }`; response `{ "studentId": "string", "justifications": [{ "justificationId": "string", "absenceId": "string", "date": "string", "status": "string", "reason": "string", "certificateUrl": "string" }] }`.
- `/justifyAbsence` (Preceptor, Administrador): request `{ "absenceId": "string", "justificationId": "string" }`; response `{ "absenceId": "string", "isJustified": "boolean", "success": "boolean" }`.
- `/configAlert` (Administrador): request `{ "minAttendancePercentage": "number", "maxConsecutiveAbsences": "number", "maxTotalAbsencesAllowed": "number", "pedagogicalRiskThreshold": "number" }`; response `{ "configId": "string", "minAttendancePercentage": "number", "maxConsecutiveAbsences": "number", "maxTotalAbsencesAllowed": "number", "pedagogicalRiskThreshold": "number", "success": "boolean" }`.
- `/generateAlert` (Sistema, Preceptor): request `{ "studentId": "string", "subjectId": "string" }`; response `{ "alertId": "string", "studentId": "string", "alertType": "string", "currentPercentage": "number", "threshold": "number", "triggered": "boolean" }`.
- `/generateAlertAccumulation` (Sistema, Preceptor): request `{ "courseId": "string", "studentId": "string" }`; response `{ "alertId": "string", "studentId": "string", "courseId": "string", "totalAbsences": "number", "alertType": "string", "triggered": "boolean" }`.
- `/generateAlertPedagogical` (Docente, Preceptor, Sistema): request `{ "studentId": "string", "totalAbsences": "number", "reason": "string" }`; response `{ "alertId": "string", "studentId": "string", "alertType": "string", "severity": "string", "triggered": "boolean" }`.
- `/associateAlertToStudent` (Sistema, Preceptor): request `{ "studentId": "string", "alertId": "string" }`; response `{ "studentId": "string", "alertId": "string", "assigned": "boolean" }`.
- `/generateOutAlert` (Sistema, Preceptor): request `{ "studentId": "string" }`; response `{ "alertId": "string", "studentId": "string", "alertType": "string", "totalAbsences": "number", "status": "string", "triggered": "boolean" }`.

### Diferencias pendientes de documentar

- Unificar `/assignUserRole` y `/updateUserRole` o definir sus responsabilidades.
- Unificar los campos de usuario: `name`/`email` frente a `username`.
- Unificar `listCourse` y `listCourses`.
- Confirmar si `/registerProfessorAttendance` registra asistencia docente o asistencia de una clase.
- Unificar los roles propuestos y los disponibles en la interfaz.
- Definir rutas para entidades educativas, consulta de usuarios y gestion completa de clases.
- Mapear `/getAttendanceRoster`, `/saveAttendance` y `/getAttendanceReport` a los contratos propuestos.
- Fijar formatos de fechas, horarios, estados, roles y carga de certificados.

El alcance funcional relacionado se describe en [srs/README.md](../srs/README.md).
