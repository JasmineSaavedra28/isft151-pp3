# Sistema de Control de Asistencias Escolares

## Resumen

El Sistema de Control de Asistencias Escolares es una plataforma web orientada a sistematizar y centralizar la gestión de asistencias en instituciones educativas.

El sistema busca reemplazar el uso de registros en papel y planillas de cálculo realizadas de forma manual, permitiendo administrar de manera centralizada la información académica y la asistencia de los estudiantes.

El alcance previsto contempla la gestión de entidades educativas, cursos, asignaturas, comisiones, docentes y estudiantes. También define el calendario académico, el registro de clases y la asociación de las asistencias con las clases dictadas.

La carga digital de justificantes, las alertas ante acumulación de faltas o situaciones de riesgo pedagógico y los reportes forman parte de los objetivos del sistema; el avance implementado se detalla en la sección de estado actual.

## Estado actual

El repositorio contiene una aplicación web en desarrollo con una interfaz HTML y un backend HTTP en Node.js. Actualmente la interfaz permite iniciar sesión, administrar usuarios, estudiantes y cursos, inscribir estudiantes, configurar calendarios académicos, registrar asistencias y consultar reportes.

Los requerimientos funcionales incluidos más abajo describen el alcance previsto; no todas esas funcionalidades están implementadas todavía en la interfaz.

## Inicio rápido en Windows

### Requisitos

- Node.js 22 o superior.
- Python 3, disponible como `py` o `python`.
- Windows PowerShell.

Desde la carpeta raíz del repositorio, ejecutá:

```powershell
.\levantar_servidores.ps1
```

El script abre una terminal para el backend en `http://localhost:3000` y otra para el frontend en `http://localhost:8081`. Cuando ambos servidores estén activos, abrí `http://localhost:8081` en el navegador. Si faltan las dependencias del backend, el script ejecuta `npm install` automáticamente.

Si PowerShell bloquea la ejecución del script, podés iniciarlo con:

```powershell
powershell -ExecutionPolicy Bypass -File .\levantar_servidores.ps1
```

### Preparación inicial de la base de datos

La base está en `backend/db.sqlite3`. Para crear el usuario administrador inicial y configurar los permisos, ejecutá una vez desde la raíz:

```powershell
Set-Location .\backend
node .\seed.mjs
Set-Location ..
```

El usuario inicial es `admin` y su contraseña es `1234`. Cambiá esa contraseña y no uses estas credenciales en un entorno publicado. El script de inicio levanta los dos servidores, pero no ejecuta la carga inicial.

Para detener los servidores, cerrá las ventanas de PowerShell abiertas por el script o presioná `Ctrl+C` en cada una.

### Inicio manual

Si preferís iniciar cada servicio por separado, usá dos terminales desde la raíz del repositorio:

```powershell
Set-Location .\backend
npm install
node .\main.mjs
```

```powershell
Set-Location .\frontend
py -m http.server 8081
```

Si el comando `py` no está disponible, reemplazalo por `python`.

## Funcionalidades disponibles

- Inicio y cierre de sesión con permisos según el rol.
- Administración de usuarios: alta, modificación, baja, eliminación y cambio de rol.
- Gestión de estudiantes: alta, modificación, baja y listado.
- Gestión de cursos e inscripciones de estudiantes.
- Calendarios académicos.
- Registro de asistencia por curso y fecha, con estados y retiros anticipados.
- Reportes de asistencia por curso, con totales y porcentaje por estudiante.
- Acceso docente a sus cursos, toma de asistencia y reportes.

Las justificaciones digitales y las alertas pedagógicas forman parte del alcance planteado, pero no están disponibles todavía en la interfaz actual.

---

# Objetivos

- Centralizar la información relacionada con la asistencia escolar.
- Reducir el uso de registros en papel y planillas de cálculo.
- Facilitar el registro y consulta de asistencias.
- Contemplar cursos divididos en diferentes comisiones.
- Permitir la asignación de uno o más docentes a una misma comisión.
- Gestionar la nómina de estudiantes de cada curso o comisión.
- Relacionar las asistencias de los estudiantes con las clases efectivamente dictadas.
- Digitalizar la gestión de justificaciones de inasistencias.
- Generar alertas ante situaciones que requieran atención.
- Facilitar la consulta de reportes de asistencia.

---

# Planilla de supervisión y seguimiento de avance del proyecto

La planificación y seguimiento del desarrollo del proyecto se realiza mediante la planilla de cálculo estandarizada proporcionada por la cátedra.

En ella se detallan los requerimientos funcionales, responsables, plazos tentativos, prioridades y estados de avance.

[Ver planilla de supervisión y seguimiento](https://docs.google.com/spreadsheets/d/1_nh5zMnrUbhaEw9PTOLw36pfdZt3iTiIUrgg5JzhuA0/edit?gid=0#gid=0)

---

# Requerimientos funcionales

Los siguientes requerimientos se alinean con el borrador de contratos de API documentado en la sección posterior. Los nombres entre paréntesis son las rutas propuestas; no significan que ya estén implementadas. El estado actual del backend se aclara en cada requisito cuando corresponde.

## RF1. Gestión de usuarios

El sistema deberá gestionar las cuentas y roles de profesores/docentes y preceptores. La lista definitiva de roles debe acordarse con el contrato de API.

### 1.1. Registro de usuarios

El sistema deberá permitir registrar usuarios (`/registerUser`). La propuesta recibe `name`, `email`, `password` y `role`. El backend actual implementa `/registerUser`, pero recibe `username`, `password` y `role`.

### 1.2. Deshabilitación de usuarios

El sistema deberá permitir deshabilitar usuarios por identificador (`/disableUser`). Esta ruta está implementada.

### 1.3. Asignación de roles

El sistema deberá permitir asignar un rol a un usuario (`/assignUserRole`). El contrato propuesto usa un único campo `role`; la ruta no está implementada. Debe confirmarse si se necesitan roles múltiples, como sugiere la tabla funcional.

### 1.4. Modificación de roles

El sistema deberá permitir modificar el rol de un usuario (`/updateUserRole`), con el campo `newRole`. Esta ruta está implementada para un rol individual.

## RF2. Gestión de estudiantes y nóminas

El sistema deberá gestionar estudiantes y las nóminas que los agrupan para su asignación académica.

### 2.1. Creación de nóminas vacías

El sistema deberá permitir crear una nómina vacía (`/newStudentList`). La ruta está propuesta en la API, pero todavía no está implementada.

### 2.2. Registro de estudiantes en nóminas

El sistema deberá permitir registrar estudiantes (`/newStudent`) y agregar estudiantes existentes a una nómina (`/addStudentToList`). `/newStudent` está implementada; las rutas de nóminas no.

### 2.3. Traslado de estudiantes

El sistema deberá permitir trasladar un estudiante entre nóminas (`/moveStudentFromList`). Si el traslado se entiende entre cursos, debe acordarse cómo se relaciona con `/assignCourse` y con la inscripción individual actual (`/enrollStudent`).

### 2.4. Baja de estudiantes

El sistema deberá permitir dar de baja un estudiante (`/deleteStudent`). La ruta está implementada y realiza una baja lógica, no un borrado físico.

## RF3. Gestión de cursos

El sistema deberá gestionar cursos y su composición.

### 3.1. Registro de cursos

El sistema deberá permitir registrar cursos (`/newCourse`). La ruta está implementada, aunque el backend actual recibe `name`, `professorId`, `startDate` y `endDate`, distintos de `year`, `division` y `shift` propuestos.

### 3.2. Asignación de nóminas a cursos

El sistema deberá permitir asignar una nómina a un curso (`/assignCourse`). La ruta está propuesta; el backend actual inscribe estudiantes individualmente mediante `/enrollStudent`.

## RF4. Gestión de asignaturas

El sistema deberá gestionar asignaturas y sus relaciones académicas.

### 4.1. Creación de asignaturas

El sistema deberá permitir crear asignaturas (`/newSubject`).

### 4.2. Asociación de asignaturas y docentes

El sistema deberá permitir asignar docentes a asignaturas (`/assignSubjectProfessor`).

### 4.3. Asociación de asignaturas y cursos

El sistema deberá permitir asociar asignaturas a cursos (`/assignSubjectCourse`).

Las tres rutas de este RF están propuestas, pero no están registradas en el backend actual.

## RF5. Gestión del calendario académico y horarios

El sistema deberá definir el período lectivo y los horarios de dictado.

### 5.1. Fechas válidas de cursada

El sistema deberá permitir definir el período académico, las fechas de inicio y fin y los feriados (`/setValidClassDates`). La ruta actual equivalente es `/newAcademicCalendar`, que recibe `academicYear`, `startDate`, `endDate` y `holidays`.

### 5.2. Horarios de cursos

El sistema deberá permitir asignar horarios a cursos (`/assignCourseSchedule`).

### 5.3. Horarios de asignaturas

El sistema deberá permitir asignar horarios de una asignatura dentro de un curso (`/assignSubjectSchedule`).

Las rutas de horarios están propuestas, pero todavía no están implementadas.

## RF6. Gestión de asistencias

El sistema deberá registrar asistencia y vincularla con el dictado efectivo de clases.

### 6.1. Validación del dictado por asistencia docente

El sistema deberá validar el dictado efectivo de una clase mediante la asistencia docente (`/registerProfessorAttendance`). Esta ruta todavía no está implementada.

### 6.2. Registro de asistencia de estudiantes

El sistema deberá permitir registrar la asistencia de estudiantes (`/registerStudentAttendance`). El backend actual usa `/getAttendanceRoster` para obtener la nómina del día y `/saveAttendance` para guardar registros; la ruta propuesta aún no está implementada.

### 6.3. Vinculación de asistencias con clases

El sistema deberá vincular los registros con una clase dictada (`/linkAttendanceToClass`). Esta operación no tiene una ruta implementada en el backend actual.

### 6.4. Corrección de asistencias

El sistema deberá permitir corregir registros con los permisos correspondientes (`/modifyAttendance`). La ruta propuesta no está implementada.

### 6.5. Cálculo del porcentaje de asistencia

El sistema deberá calcular el porcentaje de asistencia de cada estudiante (`/calculateAttendancePercentage`). Actualmente el porcentaje se incluye en el reporte de curso `/getAttendanceReport`; no existe una ruta independiente de cálculo.

## RF7. Gestión de inasistencias y justificaciones

El sistema deberá registrar inasistencias y administrar la presentación y resolución de sus justificaciones.

### 7.1. Registro de inasistencias

El sistema deberá registrar inasistencias (`/registerAbsence`).

### 7.2. Gestión de justificaciones

El sistema deberá actualizar el estado administrativo de una justificación (`/manageJustification`).

### 7.3. Carga de certificados

El sistema deberá permitir cargar certificados (`/uploadCertificate`). El mecanismo de carga de archivos debe definirse; el borrador solo incluye `fileUrl`.

### 7.4. Asociación de justificaciones

El sistema deberá asociar una justificación con el estudiante y la inasistencia correspondientes (`/assignJustification`).

### 7.5. Consulta de justificaciones

El sistema deberá permitir consultar las justificaciones de un estudiante (`/listJustifications`).

### 7.6. Resolución de inasistencias

El sistema deberá permitir justificar una inasistencia según corresponda (`/justifyAbsence`).

Las rutas de este RF están propuestas, pero no están implementadas en el backend actual.

## RF8. Configuración de alertas

El sistema deberá permitir configurar los umbrales que determinan cuándo se generan alertas (`/configAlert`). La ruta no está implementada.

## RF9. Generación y asociación de alertas

El sistema deberá detectar situaciones de inasistencia o riesgo pedagógico y vincularlas con los estudiantes.

### 9.1. Alertas por porcentaje de asistencia

El sistema deberá evaluar umbrales de asistencia y generar alertas (`/generateAlert`).

### 9.2. Alertas por acumulación de inasistencias

El sistema deberá generar alertas por acumulación de inasistencias (`/generateAlertAccumulation`).

### 9.3. Alertas por riesgo pedagógico

El sistema deberá registrar alertas por situaciones de riesgo pedagógico (`/generateAlertPedagogical`).

### 9.4. Asociación de alertas con estudiantes

El sistema deberá asociar alertas con los estudiantes correspondientes (`/associateAlertToStudent`).

### 9.5. Alertas por cesantía o pérdida de regularidad

El sistema deberá generar alertas por acumulación de inasistencias que pueda derivar en pérdida de regularidad (`/generateOutAlert`).

Las rutas de este RF están propuestas, pero no están implementadas en el backend actual.

## RF10. Consulta de reportes, alertas y estados

El sistema deberá permitir consultar los reportes de asistencia, las alertas y los estados asociados.

### 10.1. Reportes de asistencia

El sistema deberá gestionar reportes de asistencia. El backend actual implementa `/getAttendanceReport`, que recibe `courseId` y devuelve el reporte del curso.

### 10.2. Consulta por estudiante

El sistema deberá permitir consultar el estado de asistencia de un estudiante. Falta definir la ruta y el contrato de consulta individual.

### 10.3. Consulta por curso o comisión

El sistema deberá permitir consultar asistencias por curso o comisión. Actualmente se cubre el reporte por curso mediante `/getAttendanceReport`; el contrato propuesto debe especificar si admite comisión.

### 10.4. Porcentajes de asistencia

El sistema deberá permitir visualizar porcentajes de asistencia. Actualmente se incluyen en `/getAttendanceReport`.

### 10.5. Consulta de alertas

El sistema deberá permitir consultar alertas asociadas a estudiantes. Falta definir un endpoint de listado/consulta; las rutas propuestas actualmente generan o asocian alertas.

### 10.6. Filtros de reportes

El sistema deberá permitir generar reportes por estudiante, curso, comisión y período. La API actual solo define el reporte por `courseId`; faltan los filtros y contratos restantes.

### 10.7. Gestión de estados

El sistema deberá gestionar los estados de asistencias y justificaciones. Los valores permitidos y las transiciones deben definirse en el contrato.

### 10.8. Consulta y actualización de estados

El sistema deberá permitir consultar y actualizar el estado según las acciones realizadas y los permisos del usuario. Faltan endpoints y reglas de transición en la API propuesta.

## RF11. Gestión de clases

El sistema deberá gestionar las clases asociadas a cursos, asignaturas, docentes y fechas. Este requerimiento está incompleto y pendiente de definición funcional.

La API usa `classId` en algunos contratos, pero todavía no define operaciones para crear, consultar, modificar o cancelar clases. Antes de implementarlo hay que acordar esas operaciones y su relación con calendarios, horarios y asistencia.

- `/newSubject` (Administrador): crea una asignatura. Request `{ "name": "string", "code": "string", "weeklyHours": "number" }` -> Response `{ "subjectId": "string", "name": "string", "code": "string", "weeklyHours": "number" }`.
- `/deleteSubject` (Administrador): elimina una asignatura. Request `{ "subjectId": "string" }` -> Response `{ "success": "boolean" }`.
- `/modifySubject` (Administrador): modifica una asignatura. Request `{ "subjectId": "string", "name": "string", "code": "string", "weeklyHours": "number" }` -> Response `{ "subjectId": "string", "name": "string", "code": "string", "weeklyHours": "number", "success": "boolean" }`.
- `/assignSubjectProfessor` (Administrador, Preceptor): asigna un docente. Request `{ "subjectId": "string", "professorId": "string" }` -> Response `{ "subjectId": "string", "professorId": "string", "success": "boolean" }`.
- `/assignSubjectCourse` (Administrador, Preceptor): vincula la asignatura con un curso. Request `{ "subjectId": "string", "courseId": "string" }` -> Response `{ "subjectId": "string", "courseId": "string", "success": "boolean" }`.

### Calendario y horarios

- `/setValidClassDates` (Administrador): define fechas lectivas y feriados. Request `{ "academicTerm": "string", "startDate": "string", "endDate": "string", "holidays": ["string"] }` -> Response `{ "calendarId": "string", "academicTerm": "string", "totalValidDays": "number", "success": "boolean" }`.
- `/assignCourseSchedule` (Preceptor, Administrador): asigna horarios generales a un curso. Request `{ "courseId": "string", "schedule": [{ "dayOfWeek": "string", "startTime": "string", "endTime": "string" }] }` -> Response `{ "courseId": "string", "scheduleAssigned": "boolean" }`.
- `/assignSubjectSchedule` (Preceptor, Administrador): asigna horarios de una asignatura en un curso. Request `{ "courseId": "string", "subjectId": "string", "schedule": [{ "dayOfWeek": "string", "startTime": "string", "endTime": "string", "classroom": "string" }] }` -> Response `{ "courseId": "string", "subjectId": "string", "scheduleAssigned": "boolean" }`.

### Asistencias

- `/registerProfessorAttendance` (Preceptor, Administrador, Docente): registra asistencia docente y valida el dictado. Request `{ "professorId": "string", "classId": "string", "date": "string", "status": "string" }` -> Response `{ "professorAttendanceId": "string", "classId": "string", "classConducted": "boolean" }`.
- `/registerStudentAttendance` (Docente, Preceptor): registra la asistencia de un estudiante. Request `{ "studentId": "string", "classId": "string", "status": "string" }` -> Response `{ "attendanceId": "string", "studentId": "string", "status": "string" }`.
- `/linkAttendanceToClass` (Preceptor, Docente): vincula registros con una clase. Request `{ "classId": "string", "attendanceIds": ["string"] }` -> Response `{ "classId": "string", "linkedCount": "number", "success": "boolean" }`.
- `/modifyAttendance` (Preceptor, Administrador): corrige un registro conservando auditoría. Request `{ "attendanceId": "string", "userId": "string", "newStatus": "string", "reason": "string" }` -> Response `{ "attendanceId": "string", "updatedStatus": "string", "modifiedBy": "string", "success": "boolean" }`.
- `/calculateAttendancePercentage` (Docente, Preceptor, Estudiante): calcula el porcentaje de asistencia. Request `{ "studentId": "string", "subjectId": "string" }` -> Response `{ "studentId": "string", "subjectId": "string", "totalClasses": "number", "attendedClasses": "number", "percentage": "number" }`.

### Inasistencias y justificaciones

- `/registerAbsence` (Preceptor, Docente): registra una inasistencia. Request `{ "studentId": "string", "date": "string", "type": "string", "subjectId": "string" }` -> Response `{ "absenceId": "string", "studentId": "string", "date": "string", "justified": "boolean" }`.
- `/manageJustification` (Preceptor, Administrador): actualiza el estado de una justificación. Request `{ "absenceId": "string", "status": "string", "reason": "string" }` -> Response `{ "justificationId": "string", "absenceId": "string", "status": "string" }`.
- `/uploadCertificate` (Preceptor, Estudiante): carga el certificado asociado a una falta. Request `{ "absenceId": "string", "fileUrl": "string", "documentType": "string", "notes": "string" }` -> Response `{ "certificateId": "string", "absenceId": "string", "uploadedAt": "string" }`.
- `/assignJustification` (Preceptor): vincula la justificación con el estudiante y la inasistencia. Request `{ "studentId": "string", "absenceId": "string", "justificationId": "string" }` -> Response `{ "studentId": "string", "absenceId": "string", "justificationId": "string", "success": "boolean" }`.
- `/listJustifications` (Preceptor, Docente, Administrador): consulta justificaciones de un estudiante. Request `{ "studentId": "string" }` -> Response `{ "studentId": "string", "justifications": [{ "justificationId": "string", "absenceId": "string", "date": "string", "status": "string", "reason": "string", "certificateUrl": "string" }] }`.
- `/justifyAbsence` (Preceptor, Administrador): resuelve una inasistencia como justificada. Request `{ "absenceId": "string", "justificationId": "string" }` -> Response `{ "absenceId": "string", "isJustified": "boolean", "success": "boolean" }`.

### Configuración de alertas

- `/configAlert` (Administrador): define umbrales institucionales. Request `{ "minAttendancePercentage": "number", "maxConsecutiveAbsences": "number", "maxTotalAbsencesAllowed": "number", "pedagogicalRiskThreshold": "number" }` -> Response `{ "configId": "string", "minAttendancePercentage": "number", "maxConsecutiveAbsences": "number", "maxTotalAbsencesAllowed": "number", "pedagogicalRiskThreshold": "number", "success": "boolean" }`.

### Alertas

- `/generateAlert` (Sistema, Preceptor): evalúa alertas por porcentaje de asistencia. Request `{ "studentId": "string", "subjectId": "string" }` -> Response `{ "alertId": "string", "studentId": "string", "alertType": "string", "currentPercentage": "number", "threshold": "number", "triggered": "boolean" }`.
- `/generateAlertAccumulation` (Sistema, Preceptor): evalúa acumulación de inasistencias. Request `{ "courseId": "string", "studentId": "string" }` -> Response `{ "alertId": "string", "studentId": "string", "courseId": "string", "totalAbsences": "number", "alertType": "string", "triggered": "boolean" }`.
- `/generateAlertPedagogical` (Docente, Preceptor, Sistema): registra una alerta de riesgo pedagógico. Request `{ "studentId": "string", "totalAbsences": "number", "reason": "string" }` -> Response `{ "alertId": "string", "studentId": "string", "alertType": "string", "severity": "string", "triggered": "boolean" }`.
- `/associateAlertToStudent` (Sistema, Preceptor): asocia una alerta con un estudiante. Request `{ "studentId": "string", "alertId": "string" }` -> Response `{ "studentId": "string", "alertId": "string", "assigned": "boolean" }`.
- `/generateOutAlert` (Sistema, Preceptor): genera una alerta por posible pérdida de regularidad. Request `{ "studentId": "string" }` -> Response `{ "alertId": "string", "studentId": "string", "alertType": "string", "totalAbsences": "number", "status": "string", "triggered": "boolean" }`.

### Pendientes de revisión del contrato

- `/assignUserRole` y `/updateUserRole` se superponen; definir si son operaciones distintas o si se conserva una sola.
- Resolver los endpoints de consulta de estudiantes en una nómina y usar el término **nómina** consistentemente. Si se conserva el inglés en rutas, evaluar `Roster` en lugar de `List`.
- Definir método HTTP, autenticación, errores y códigos de respuesta para cada contrato. El backend actual solo acepta `POST` para sus rutas de API.
- Unificar los campos de usuario: esta propuesta usa `name` y `email`, mientras que el backend actual recibe `username`.
- Unificar el nombre de listado de cursos: el borrador propone `/listCourse`; el backend actual expone `/listCourses`.
- Confirmar si `/registerProfessorAttendance` registra asistencia del docente o si la asistencia a registrar es la del curso/clase.
- Unificar los roles: los requerimientos originales mencionan Profesor, Preceptor, Secretario e Inspector; el borrador usa Docente, Preceptor, Administrador y Estudiante; la interfaz actual ofrece Administrador, Preceptor y Docente.
- El borrador no define rutas para entidades educativas, listado de usuarios ni modificación de datos de usuario, aunque aparecen en otros requerimientos o en la aplicación.
- Las rutas actuales de asistencia son `/getAttendanceRoster`, `/saveAttendance` y `/getAttendanceReport`; deben mapearse con las operaciones propuestas para registrar, vincular y modificar asistencias.
- Definir el formato y las restricciones de fechas, horarios, estados y roles, además de la forma de carga de archivos de certificados.
- Revisar si los atributos de tipo `number` y `boolean` se escriben como tipos JSON (`number`, `true`/`false`) y no como strings en los ejemplos de contrato.

### Diferencia con el backend actual

Las rutas propuestas arriba no implican que estén implementadas. El backend actual registra autenticación, gestión básica de usuarios y estudiantes, cursos, inscripciones, calendarios y asistencias/reportes. Aún no registra las rutas de nóminas, asignaturas, horarios, justificaciones ni alertas descritas en este borrador. Las rutas efectivamente disponibles se pueden verificar en `backend/main.mjs`.

---

# Requerimientos no funcionales

- El sistema deberá ser desarrollado utilizando la metodología **TDD (Test Driven Development)**.
- El sistema deberá garantizar el acceso autenticado mediante un mecanismo de **inicio de sesión**.
- El sistema deberá garantizar que no existan **usuarios duplicados**.
- El sistema deberá contar con una **interfaz gráfica de usuario**.
- El sistema deberá ejecutar de forma **asíncrona las operaciones que puedan bloquear la interfaz**.
- El sistema deberá separar la **lógica de negocio de la interfaz gráfica** mediante el uso de controladores.
- El sistema deberá garantizar la **integridad de los datos** registrados.
- El sistema deberá restringir el acceso a las funcionalidades según el **rol y permisos del usuario**.
- El sistema deberá garantizar el **almacenamiento persistente** de la información.

---

# Documentación de la API

El backend expone una API HTTP en `http://localhost:3000` y recibe solicitudes `POST`. Las rutas están registradas en `backend/main.mjs`; sus controladores y lógica se encuentran en `backend/handlers.js` y `backend/model.js`.

---

# Especificación de requerimientos

Los requerimientos funcionales y no funcionales de este README describen el alcance definido para el proyecto y pueden incluir funcionalidades pendientes de implementación.

---

# Testing

Actualmente no hay una suite de pruebas ejecutable documentada. Aunque `backend/package.json` declara `npm test`, el comando falla porque intenta cargar `backend/run`, que no existe.

---

# Release

`levantar_servidores.ps1` inicia el entorno de desarrollo local; no configura un despliegue de producción.

---

# Media

No hay actualmente una carpeta `media/` en el repositorio.

---

# Reglas de desarrollo

El proyecto seguirá las siguientes reglas de desarrollo establecidas por la cátedra:

- No se utilizarán ramas de trabajo salvo que sean gestionadas correctamente.
- No se incorporarán archivos de configuración específicos de cada integrante.
- Se utilizará `.gitignore` para excluir archivos propios del entorno de desarrollo.
- No se incorporarán archivos binarios ni dependencias específicas del entorno de ejecución.
- El código del repositorio no deberá contener comentarios.
- Se utilizará un único idioma de forma consistente en todo el proyecto.
- Se utilizará una indentación uniforme de 4 espacios.
- Se respetará una única convención de nombres en todo el proyecto.
- Los cambios deberán registrarse mediante commits periódicos.
- Cada integrante será responsable de mantener sus configuraciones propias fuera del repositorio.

---

# Convención de nombres

## Clases

Se utilizará la convención `UpperCamelCase`.

Ejemplos:

`Usuario`  
`Estudiante`  
`Docente`  
`Curso`  
`Comision`  
`Asignatura`  
`Asistencia`  
`Justificacion`

## Funciones y variables

Se utilizará la convención `lowerCamelCase`.

Ejemplos:

`registrarUsuario()`  
`listarCursos()`  
`registrarAsistencia()`  
`calcularPorcentaje()`

`porcentajeAsistencia`  
`fechaAsistencia`  
`nombreEstudiante`

---

# Estructura del repositorio

    isft151-pp3/
    │
    ├── README.md
    ├── LICENSE
    ├── levantar_servidores.ps1
    ├── levantar_servidores.sh
    ├── levantar_apache.sh
    ├── levantar_node.sh
    ├── backend/
    │   ├── main.mjs
    │   ├── handlers.js
    │   ├── model.js
    │   ├── database.js
    │   ├── config.json
    │   ├── seed.mjs
    │   └── db.sqlite3
    └── frontend/
        ├── index.html
        └── WebComponentes(LoginyForms)/

---

# Tecnologías

- Backend: Node.js con módulos ES y servidor HTTP nativo.
- Persistencia: SQLite mediante `node:sqlite`.
- Frontend: HTML, CSS y JavaScript; servidor estático de desarrollo de Python.
- Dependencia del backend: `sqlite3`.

---

# Instalación

Para requisitos e instrucciones de inicio, consultá [Inicio rápido en Windows](#inicio-rápido-en-windows). El script de Windows instala las dependencias de Node cuando no existe `backend/node_modules`.

---

# Despliegue

El repositorio contiene scripts para levantar servicios localmente. No incluye configuración de despliegue a producción.

---

# Ejecución de pruebas

La ejecución de pruebas queda pendiente hasta incorporar la suite y corregir el comando `test` de `backend/package.json`.

---

# Change Log

El sistema continúa en desarrollo. Consultá la sección [Estado actual](#estado-actual) para ver las funcionalidades disponibles.

---

# Integrantes

- Jazmín Saavedra
- Pablo Curtti
- Carlos Guariglia

## Gestor del proyecto

El rol de Gestor de proyecto será definido por el grupo.

---

# Estado del proyecto

**En desarrollo**
