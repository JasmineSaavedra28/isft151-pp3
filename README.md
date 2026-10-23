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
