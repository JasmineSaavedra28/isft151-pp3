# Especificacion de requerimientos

Esta especificacion describe el alcance funcional y las cualidades esperadas del sistema.

## Objetivos

- Centralizar la informacion relacionada con la asistencia escolar.
- Reducir el uso de registros en papel y planillas de calculo.
- Facilitar el registro y consulta de asistencias.
- Contemplar cursos divididos en diferentes comisiones.
- Permitir la asignacion de uno o mas docentes a una misma comision.
- Gestionar la nomina de estudiantes de cada curso o comision.
- Relacionar las asistencias de los estudiantes con las clases efectivamente dictadas.
- Digitalizar la gestion de justificaciones de inasistencias.
- Generar alertas ante situaciones que requieran atencion.
- Facilitar la consulta de reportes de asistencia.

## Alcance funcional vigente

Los requerimientos estan agrupados en gestion de usuarios, estudiantes y nominas, cursos, asignaturas, calendario y horarios, asistencias, justificaciones, alertas, reportes y clases.

- **RF1-RF5:** administrar usuarios, nominas, cursos, asignaturas y calendario academico.
- **RF6:** registrar asistencias, vincularlas con clases y generar porcentajes.
- **RF7:** registrar inasistencias y administrar justificaciones y certificados.
- **RF8-RF9:** configurar umbrales y generar alertas por asistencia, acumulacion o riesgo pedagogico. Estos requerimientos forman parte del alcance planeado, pero quedaron fuera de esta entrega.
- **RF10:** consultar reportes, estados y alertas con filtros definidos.
- **RF11:** gestionar las clases asociadas a cursos, asignaturas, docentes y fechas. Permanece pendiente de definicion: faltan acordar operaciones, actores y relacion con calendarios, horarios y asistencias.

Las rutas propuestas y su estado de implementacion se detallan en [la documentacion de API](../api/README.md).

El estado de cada requerimiento y subrequerimiento se detalla en la [trazabilidad de requerimientos](#trazabilidad-de-requerimientos).

## Trazabilidad de requerimientos

Leyenda: **Implementado** cubre el requerimiento; **Parcial** tiene una funcionalidad relacionada pero no completa el alcance; **No implementado** no tiene desarrollo en esta entrega.

| N.º | Requerimiento | Estado | Detalle de la entrega |
| --- | --- | --- | --- |
| 1 | Gestionar usuarios (profesores, preceptores) | Parcial | Se administran usuarios y roles, pero el rol Preceptor no tiene una vista propia. |
| 1.1 | Registrar usuarios (`registerUser`) | Implementado | Alta de usuario con contraseña y rol. |
| 1.2 | Deshabilitar usuarios (`disableUser`) | Implementado | Baja/deshabilitación de usuarios. |
| 1.3 | Asignar roles (`assignUserRoles`) | Parcial | El rol se define al registrar; no existe una operación separada de asignación múltiple. |
| 1.4 | Modificar roles (`updateUserRoles`) | Implementado | Cambio de rol mediante `/updateUserRole`. |
| 2 | Gestionar estudiantes | Parcial | Se administran estudiantes de forma individual. |
| 2.1 | Crear lista vacía | Parcial | Un curso nuevo queda sin estudiantes, pero no existe una entidad de lista independiente. |
| 2.2 | Registrar lista de alumnos | Parcial | Alta individual; no hay carga masiva de listas. |
| 2.3 | Mover alumno de curso | No implementado | Se puede desinscribir e inscribir por separado, sin una operación de movimiento. |
| 2.4 | Deshabilitar alumnos | Implementado | Baja lógica del estudiante (`status = inactive`) desde “Eliminar Estudiante”. |
| 3 | Gestionar cursos | Parcial | Se administran cursos e inscripciones individuales. |
| 3.1 | Registrar cursos | Implementado | Alta y modificación mediante `/newCourse` y `/modifyCourse`. |
| 3.2 | Asignar lista de estudiantes a curso | Parcial | Inscripción individual (`/enrollStudent`); no hay asignación masiva. |
| 4 | Gestionar asignaturas | No implementado | No hay entidad de asignatura en el backend ni en la interfaz. |
| 4.1 | Crear asignaturas | No implementado | Sin desarrollo. |
| 4.2 | Asociar asignaturas a docentes | No implementado | Sin desarrollo. |
| 4.3 | Asociar asignaturas a un curso | No implementado | Sin desarrollo. |
| 5 | Gestionar el calendario académico | Parcial | Se gestionan fechas válidas, pero no horarios. |
| 5.1 | Definir fechas válidas para el dictado (`setValidClassDates`) | Implementado | Calendario con año, fecha de inicio, fecha de fin y feriados (`/newAcademicCalendar`). |
| 5.2 | Asignar horarios a cursos (`assignCourseSchedule`) | No implementado | Sin desarrollo. |
| 5.3 | Asignar horarios a asignaturas de cursos (`assignSubjectSchedule`) | No implementado | Sin desarrollo. |
| 6 | Gestionar asistencias | Parcial | Se registra la asistencia de estudiantes y se calculan porcentajes. |
| 6.1 | Asistencia docente y dictado efectivo de la clase | No implementado | No se valida el presente del docente. |
| 6.2 | Registrar asistencia de los estudiantes | Implementado | `/saveAttendance` con estados presente, ausente, tardanza y retiro anticipado. |
| 6.3 | Vincular asistencia con las clases efectivamente dictadas | Parcial | Se guarda una sesión por curso y fecha con docente; no existe una entidad “clase” validada. |
| 6.5 | Corregir registros de asistencia según permisos | Parcial | Se puede volver a guardar la asistencia (upsert) o eliminar la sesión; no hay corrección individual auditada. |
| 6.6 | Calcular el porcentaje de asistencia | Implementado | `/getAttendanceReport` calcula totales y porcentaje por estudiante. |
| 7 | Gestionar inasistencias | Parcial | La ausencia se registra dentro de la asistencia; no hay módulo de inasistencias. |
| 7.1 | Registrar inasistencias | Parcial | Estado `absent` en la toma de asistencia; sin registro independiente. |
| 7.2 | Gestionar justificaciones de inasistencias | No implementado | Sin desarrollo. |
| 7.3 | Cargar certificados y justificantes | No implementado | Sin desarrollo. |
| 7.4 | Asociar justificados con el estudiante | No implementado | Sin desarrollo. |
| 7.5 | Consultar justificaciones registradas | No implementado | Sin desarrollo. |
| 7.6 | Justificar una inasistencia | No implementado | Sin desarrollo. |
| 8 | Gestionar configuraciones de alertas | No implementado | Sin desarrollo. |
| 8.1 | Configurar el valor a partir del cual se genera una alerta | No implementado | Sin desarrollo. |
| 9 | Generar alertas | No implementado | Sin desarrollo. |
| 9.1 | Alertas por acumulación de inasistencias | No implementado | Sin desarrollo. |
| 9.2 | Alertas por situaciones de riesgo pedagógico | No implementado | Sin desarrollo. |
| 9.3 | Asociar alertas con el estudiante | No implementado | Sin desarrollo. |
| 9.4 | Alerta por cesantía por acumulación de inasistencias | No implementado | Sin desarrollo. |
| 10 | Consultar alertas y gestionar reportes y estados | Parcial | Reportes de asistencia por curso y porcentajes; no hay alertas ni justificaciones. |
| 10.1 | Gestionar reportes de asistencias | Implementado | Reporte por curso mediante `/getAttendanceReport`. |
| 10.2 | Consultar el estado de asistencia de un estudiante | Parcial | Visible dentro del reporte del curso; sin consulta individual global. |
| 10.3 | Consultar asistencias de un curso o comisión | Parcial | Por curso; no existe gestión de comisiones. |
| 10.4 | Visualizar porcentajes de asistencia | Implementado | Incluidos en el reporte y en el panel de resumen. |
| 10.5 | Consultar alertas asociadas a estudiantes | No implementado | Sin desarrollo. |
| 10.6 | Generar reportes por estudiante, curso, comisión y período | Parcial | Solo por curso; sin filtros por estudiante, comisión o período. |
| 10.7 | Gestionar estados | Parcial | Estados de asistencia; no de justificaciones. |
| 10.8 | Gestionar estados de asistencias y justificaciones | Parcial | Solo asistencias. |
| 10.9 | Consultar el estado actual de una asistencia o justificación | Parcial | Asistencia sí; justificación no. |
| 10.10 | Actualizar el estado de una asistencia o justificación según permisos | Parcial | Se puede volver a registrar o eliminar asistencia; no hay flujo de justificaciones. |
| 11 | Gestionar clases | No implementado | No hay entidad de clase; las asistencias se agrupan por curso y fecha. |

## Requerimientos no funcionales

- El sistema se desarrolla siguiendo TDD.
- El acceso requiere autenticacion y permisos por rol.
- No se permiten usuarios duplicados.
- El sistema cuenta con una interfaz grafica.
- Las operaciones bloqueantes pueden ejecutarse de forma asincrona.
- La logica de negocio se separa de la interfaz mediante controladores.
- Los datos registrados mantienen integridad y persistencia.
- Los permisos restringen el acceso segun rol y accion.

## Planificacion

La planificacion y el seguimiento se realizan mediante la planilla estandarizada proporcionada por la catedra: [planilla de supervision y seguimiento](https://docs.google.com/spreadsheets/d/1_nh5zMnrUbhaEw9PTOLw36pfdZt3iTiIUrgg5JzhuA0/edit?gid=0#gid=0).

## Convenciones

Las clases usan `UpperCamelCase`. Las funciones, variables y rutas de API usan `lowerCamelCase`. Se mantienen los nombres del contrato de API para evitar incompatibilidades.
