# Sistema de Control de Asistencias Escolares

## Resumen

El Sistema de Control de Asistencias Escolares es una plataforma web orientada a sistematizar y centralizar la gestión de asistencias en instituciones educativas.

El sistema busca reemplazar el uso de registros en papel y planillas de cálculo realizadas de forma manual, permitiendo administrar de manera centralizada la información académica y la asistencia de los estudiantes.

La plataforma contempla la gestión de entidades educativas, cursos, asignaturas, comisiones, docentes y estudiantes. También permite definir el calendario académico, registrar las clases dictadas y asociar las asistencias de los estudiantes con las clases efectivamente realizadas.

Además, permite gestionar justificaciones de inasistencias mediante la carga digital de certificados y justificantes, generar alertas ante acumulación de faltas o situaciones de riesgo pedagógico y consultar reportes de asistencia por estudiante, curso o comisión.

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

[Ver planilla de supervisión y seguimiento](PEGAR_AQUI_EL_LINK_DE_LA_PLANILLA)

---

# Requerimientos funcionales

## RF1. Gestión de usuarios

El sistema deberá permitir gestionar los usuarios que interactúan con la plataforma.

### 1.1. Registro de usuarios

El sistema deberá permitir registrar nuevos usuarios.

### 1.2. Consulta de usuarios

El sistema deberá permitir listar y consultar los usuarios registrados.

### 1.3. Modificación de usuarios

El sistema deberá permitir modificar los datos de los usuarios.

### 1.4. Deshabilitación de usuarios

El sistema deberá permitir deshabilitar usuarios.

### 1.5. Gestión de roles

El sistema deberá permitir asignar y modificar los roles de los usuarios.

Los roles contemplados son:

- Profesor.
- Preceptor.
- Secretario.
- Inspector.

---

## RF2. Gestión de entidades educativas

El sistema deberá permitir gestionar las entidades educativas.

### 2.1. Registro de entidades educativas

El sistema deberá permitir registrar entidades educativas.

### 2.2. Consulta de entidades educativas

El sistema deberá permitir listar y consultar entidades educativas.

### 2.3. Modificación de entidades educativas

El sistema deberá permitir modificar los datos de las entidades educativas.

### 2.4. Deshabilitación de entidades educativas

El sistema deberá permitir deshabilitar entidades educativas.

---

## RF3. Gestión de cursos

El sistema deberá permitir gestionar los cursos y su estructura.

### 3.1. Registro de cursos

El sistema deberá permitir registrar cursos.

### 3.2. Consulta de cursos

El sistema deberá permitir listar y consultar cursos.

### 3.3. Modificación de cursos

El sistema deberá permitir modificar los datos de los cursos.

### 3.4. Gestión de comisiones

El sistema deberá permitir crear y gestionar subgrupos o comisiones de un curso.

### 3.5. Asociación de docentes

El sistema deberá permitir asociar uno o más docentes a cursos y comisiones.

### 3.6. Gestión de nóminas

El sistema deberá permitir gestionar la nómina de estudiantes correspondiente a cada curso o comisión.

---

## RF4. Gestión de asignaturas

El sistema deberá permitir gestionar las asignaturas de las entidades educativas.

### 4.1. Registro de asignaturas

El sistema deberá permitir registrar asignaturas.

### 4.2. Consulta de asignaturas

El sistema deberá permitir listar y consultar asignaturas.

### 4.3. Modificación de asignaturas

El sistema deberá permitir modificar los datos de las asignaturas.

### 4.4. Asociación de asignaturas

El sistema deberá permitir asociar asignaturas con cursos y comisiones.

---

## RF5. Gestión del calendario académico

El sistema deberá permitir gestionar el calendario académico correspondiente al ciclo lectivo.

### 5.1. Configuración del ciclo lectivo

El sistema deberá permitir establecer el ciclo lectivo.

### 5.2. Definición de fechas

El sistema deberá permitir definir las fechas válidas para el dictado de clases.

### 5.3. Registro de clases

El sistema deberá permitir registrar las clases dictadas por asignatura y comisión.

### 5.4. Consulta de clases

El sistema deberá permitir consultar las clases programadas y efectivamente dictadas.

---

## RF6. Gestión de estados

El sistema deberá permitir gestionar los estados correspondientes a las asistencias y justificaciones.

### 6.1. Estados de asistencia

El sistema deberá permitir gestionar los estados correspondientes a los registros de asistencia.

### 6.2. Estados de justificación

El sistema deberá permitir gestionar los estados correspondientes a las justificaciones de inasistencias.

### 6.3. Consulta de estados

El sistema deberá permitir consultar el estado actual de una asistencia o justificación.

---

## RF7. Gestión de asistencias

El sistema deberá permitir gestionar el control de asistencia de los estudiantes.

### 7.1. Registro de asistencia

El sistema deberá permitir registrar la asistencia de los estudiantes.

### 7.2. Registro de inasistencias

El sistema deberá permitir registrar las inasistencias de los estudiantes.

### 7.3. Registro de retiros anticipados

El sistema deberá permitir registrar retiros anticipados de los estudiantes.

### 7.4. Vinculación con clases

El sistema deberá vincular los registros de asistencia con las clases efectivamente dictadas.

### 7.5. Modificación de asistencias

El sistema deberá permitir modificar los registros de asistencia según los permisos correspondientes.

### 7.6. Cálculo de porcentaje

El sistema deberá calcular automáticamente el porcentaje de asistencia de cada estudiante sobre el total real de clases dictadas.

---

## RF8. Gestión de justificaciones de inasistencias

El sistema deberá permitir gestionar las justificaciones correspondientes a las inasistencias de los estudiantes.

### 8.1. Carga de certificados

El sistema deberá permitir cargar certificados y justificantes digitales.

### 8.2. Asociación con estudiantes

El sistema deberá asociar los justificantes con el estudiante correspondiente.

### 8.3. Consulta de justificaciones

El sistema deberá permitir consultar las justificaciones registradas.

### 8.4. Gestión del estado

El sistema deberá permitir gestionar el estado de las justificaciones.

---

## RF9. Generación de alertas

El sistema deberá generar alertas relacionadas con la asistencia y situaciones de riesgo pedagógico.

### 9.1. Alertas por inasistencias

El sistema deberá generar alertas ante la acumulación de inasistencias.

### 9.2. Alertas por riesgo pedagógico

El sistema deberá generar alertas ante situaciones de riesgo pedagógico.

### 9.3. Asociación de alertas

El sistema deberá asociar las alertas con los estudiantes correspondientes.

### 9.4. Consulta de alertas

El sistema deberá permitir consultar las alertas generadas.

---

## RF10. Gestión de reportes de asistencia

El sistema deberá permitir consultar y generar reportes relacionados con la asistencia.

### 10.1. Reporte por estudiante

El sistema deberá permitir consultar el estado de asistencia de un estudiante.

### 10.2. Reporte por curso

El sistema deberá permitir consultar las asistencias de un curso o comisión.

### 10.3. Porcentajes de asistencia

El sistema deberá permitir visualizar los porcentajes de asistencia de los estudiantes.

### 10.4. Consulta de alertas

El sistema deberá permitir consultar las alertas asociadas a los estudiantes.

### 10.5. Generación de reportes

El sistema deberá permitir generar reportes de asistencia según estudiante, curso, comisión y período.

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

La especificación inicial de la API se encuentra dentro del directorio:

```text
api/

# Change Log

## [0.1.0] - Inicio del proyecto

### Agregado

- Creación del repositorio.
- Creación de la estructura inicial del proyecto.
- Definición del objetivo general del sistema.
- Identificación de la problemática.
- Definición del alcance inicial.
- Identificación de los usuarios y roles principales.
- Definición inicial de los requerimientos funcionales.
- Definición inicial de los requerimientos no funcionales.

---

## [0.2.0] - Gestión de estructura académica

### Agregado

- Gestión de entidades educativas.
- Gestión de cursos.
- Gestión de asignaturas.
- Gestión de comisiones y subgrupos.
- Asociación de docentes a cursos y comisiones.
- Gestión de nóminas de estudiantes.

---

## [0.3.0] - Calendario académico

### Agregado

- Configuración del ciclo lectivo.
- Definición de fechas válidas para el dictado de clases.
- Registro de clases dictadas.
- Asociación de clases con asignaturas y comisiones.

---

## [0.4.0] - Control de asistencias

### Agregado

- Registro de asistencia de estudiantes.
- Registro de inasistencias.
- Registro de retiros anticipados.
- Asociación entre estudiantes y clases dictadas.
- Cálculo automático del porcentaje de asistencia.

---

## [0.5.0] - Justificaciones

### Agregado

- Carga digital de certificados.
- Carga de justificantes.
- Asociación de justificantes con estudiantes.
- Consulta de justificaciones.
- Gestión de estados de las justificaciones.

---

## [0.6.0] - Alertas y reportes

### Agregado

- Generación de alertas por acumulación de inasistencias.
- Generación de alertas por riesgo pedagógico.
- Consulta del estado de asistencia por estudiante.
- Consulta de asistencia por curso.
- Consulta de asistencia por comisión.
- Visualización de porcentajes de asistencia.
- Generación de reportes.

---

## [1.0.0] - Versión inicial completa

### Agregado

- Integración de las funcionalidades principales.
- Gestión de usuarios y roles.
- Gestión de entidades educativas.
- Gestión de cursos y comisiones.
- Gestión de asignaturas.
- Gestión del calendario académico.
- Control integral de asistencias.
- Gestión de justificaciones.
- Generación de alertas.
- Consulta y generación de reportes.
- Gestión de estados.

---

# Tecnologías utilizadas

> Esta sección deberá actualizarse cuando se defina el stack tecnológico definitivo.

- **Frontend:** Por definir.
- **Backend:** Por definir.
- **Base de datos:** Por definir.
- **Control de versiones:** Git / GitHub.
- **Metodología:** TDD (Test Driven Development).

---

# Requisitos para el despliegue

Para ejecutar el proyecto será necesario contar con:

- Git.
- El entorno de ejecución correspondiente al lenguaje utilizado.
- El gestor de dependencias correspondiente.
- El motor de base de datos utilizado por el proyecto.
- Un navegador web actualizado.

Los requisitos específicos se actualizarán a medida que avance el desarrollo.

---
