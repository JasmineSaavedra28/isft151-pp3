# Sistema de Control de Asistencias Escolares

## Resumen

El Sistema de Control de Asistencias Escolares es una plataforma web orientada a sistematizar y centralizar la gestión de asistencias en instituciones educativas.

El sistema busca reemplazar el uso de registros en papel y planillas de cálculo realizadas de forma manual, permitiendo administrar de manera centralizada la información académica y la asistencia de los estudiantes.

La plataforma contempla la gestión de entidades educativas, cursos, asignaturas, comisiones, docentes y estudiantes. También permite definir el calendario académico, registrar las clases dictadas y asociar las asistencias de los estudiantes con las clases efectivamente realizadas.

Además, permite gestionar justificaciones de inasistencias mediante la carga digital de certificados y justificantes, generar alertas ante acumulación de faltas o situaciones de riesgo pedagógico y consultar reportes de asistencia por estudiante, curso o comisión.

---

# Objetivos

- Centralizar la información relacionada con la asistencia escolar.
- Reducir el uso de registros en papel y planillas manuales.
- Facilitar el registro y consulta de asistencias.
- Contemplar cursos divididos en diferentes comisiones.
- Permitir la asignación de uno o más docentes a una comisión.
- Relacionar las asistencias de los estudiantes con las clases efectivamente dictadas.
- Digitalizar la gestión de justificaciones de inasistencias.
- Generar alertas ante situaciones que requieran atención.
- Facilitar la consulta de reportes de asistencia.

---

# Funcionalidades

## Gestión de usuarios

El sistema permite administrar los usuarios que interactúan con la plataforma.

- Registrar usuarios.
- Listar y consultar usuarios.
- Modificar datos de usuarios.
- Deshabilitar usuarios.
- Asignar y modificar roles.

### Roles

El sistema contempla los siguientes roles:

- Profesor.
- Preceptor.
- Secretario.
- Inspector.

Cada rol contará con permisos determinados de acuerdo con las funcionalidades que le correspondan.

---

## Gestión de entidades educativas

El sistema permite administrar las instituciones educativas.

- Registrar entidades educativas.
- Consultar entidades educativas.
- Modificar información de las entidades educativas.
- Deshabilitar entidades educativas.

---

## Gestión de cursos

El sistema permite administrar los cursos y su composición.

- Registrar cursos.
- Consultar cursos.
- Modificar cursos.
- Crear y gestionar subgrupos o comisiones.
- Asociar docentes a cursos y comisiones.
- Gestionar la nómina de estudiantes de cada curso o comisión.

Una misma nómina de estudiantes podrá organizarse en diferentes comisiones cuando la cantidad de estudiantes requiera su distribución entre varios docentes.

---

## Gestión de asignaturas

El sistema permite administrar las asignaturas correspondientes a los cursos.

- Registrar asignaturas.
- Consultar asignaturas.
- Modificar asignaturas.
- Asociar asignaturas con cursos y comisiones.

---

## Calendario académico

El sistema permite configurar el calendario correspondiente al ciclo lectivo.

- Establecer el ciclo lectivo.
- Definir las fechas válidas para el dictado de clases.
- Registrar las clases dictadas.
- Asociar las clases con una asignatura y comisión.
- Consultar las clases programadas y dictadas.

La información de las clases efectivamente dictadas será utilizada para calcular los porcentajes reales de asistencia.

---

## Control de asistencias

El sistema permite realizar un control integral de la asistencia de los estudiantes.

- Registrar asistencia.
- Registrar inasistencias.
- Registrar retiros anticipados.
- Asociar la asistencia con las clases efectivamente dictadas.
- Modificar registros según los permisos correspondientes.
- Calcular automáticamente el porcentaje de asistencia de cada estudiante.

El porcentaje de asistencia se calculará tomando como referencia la cantidad real de clases dictadas y no solamente el período calendario.

---

## Justificaciones de inasistencias

El sistema permite digitalizar la gestión de certificados y justificantes.

- Cargar certificados y justificantes.
- Asociar los justificantes con el estudiante correspondiente.
- Consultar las justificaciones registradas.
- Gestionar el estado de las justificaciones.

De esta manera, la documentación queda vinculada directamente con la información del estudiante y no depende de una carpeta general en formato papel.

---

## Alertas

El sistema permite generar alertas relacionadas con la asistencia de los estudiantes.

- Generar alertas por acumulación de inasistencias.
- Generar alertas ante situaciones de riesgo pedagógico.
- Asociar las alertas con los estudiantes correspondientes.
- Consultar las alertas generadas.

---

## Reportes

El sistema permite consultar información centralizada sobre las asistencias.

- Consultar el estado de asistencia de un estudiante.
- Consultar las asistencias de un curso.
- Consultar las asistencias de una comisión.
- Visualizar porcentajes de asistencia.
- Consultar alertas asociadas a los estudiantes.
- Generar reportes de asistencia según estudiante, curso, comisión y período.

---

# Requerimientos funcionales

### RF1. Gestión de usuarios

El sistema deberá permitir registrar, consultar, modificar y deshabilitar usuarios, así como asignar y modificar sus roles.

### RF2. Gestión de entidades educativas

El sistema deberá permitir registrar, consultar, modificar y deshabilitar entidades educativas.

### RF3. Gestión de cursos

El sistema deberá permitir administrar cursos, comisiones, docentes y nóminas de estudiantes.

### RF4. Gestión de asignaturas

El sistema deberá permitir registrar y administrar asignaturas y asociarlas con cursos y comisiones.

### RF5. Gestión del calendario académico

El sistema deberá permitir establecer el ciclo lectivo, definir las fechas válidas y registrar las clases dictadas.

### RF6. Gestión de asistencias

El sistema deberá permitir registrar asistencias, inasistencias y retiros anticipados, vinculándolos con las clases efectivamente dictadas.

### RF7. Gestión de justificaciones

El sistema deberá permitir cargar, asociar y consultar certificados y justificantes correspondientes a las inasistencias.

### RF8. Generación de alertas

El sistema deberá generar alertas ante acumulación de inasistencias y situaciones de riesgo pedagógico.

### RF9. Gestión de reportes de asistencia

El sistema deberá permitir consultar y generar reportes relacionados con la asistencia de estudiantes, cursos y comisiones.

### RF10. Gestión de estados

El sistema deberá gestionar los estados correspondientes a las asistencias y justificaciones.

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
