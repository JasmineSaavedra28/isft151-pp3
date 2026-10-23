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
- **RF8-RF9:** configurar umbrales y generar alertas por asistencia, acumulacion o riesgo pedagogico.
- **RF10:** consultar reportes, estados y alertas con filtros definidos.
- **RF11:** gestionar las clases asociadas a cursos, asignaturas, docentes y fechas. Permanece pendiente de definicion: faltan acordar operaciones, actores y relacion con calendarios, horarios y asistencias.

Las rutas propuestas y su estado de implementacion se detallan en [la documentacion de API](../api/README.md).

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
