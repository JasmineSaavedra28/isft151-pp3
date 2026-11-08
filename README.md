# Sistema de Control de Asistencias Escolares

## Resumen

El Sistema de Control de Asistencias Escolares —MiRegistro— es una plataforma web orientada a sistematizar y centralizar la gestión de asistencias en instituciones educativas.

Repositorio: [github.com/JasmineSaavedra28/isft151-pp3](https://github.com/JasmineSaavedra28/isft151-pp3)

El sistema busca reemplazar el uso de registros en papel y planillas de cálculo realizadas de forma manual, permitiendo administrar de manera centralizada la información académica y la asistencia de los estudiantes.

El alcance previsto contempla la gestión de entidades educativas, cursos, asignaturas, comisiones, docentes y estudiantes. También define el calendario académico, el registro de clases y la asociación de las asistencias con las clases dictadas.

La carga digital de justificantes, las alertas ante acumulación de faltas o situaciones de riesgo pedagógico y los reportes forman parte de los objetivos del sistema. La sección [Alcance implementado y pendiente](#alcance-implementado-y-pendiente) detalla qué se alcanzó a construir en esta entrega y qué quedó fuera.

## Estado actual

El repositorio contiene una aplicación web funcional con una interfaz HTML, CSS y JavaScript, y un backend HTTP en Node.js. La versión actual incluye:

- Inicio y cierre de sesión con permisos por rol.
- Administración de usuarios, estudiantes y cursos.
- Inscripción de estudiantes en cursos.
- Configuración de calendarios académicos.
- Toma de asistencia por curso y fecha.
- Consulta de reportes de asistencia.
- Panel de resumen con datos reales para Administrador y Docente.
- Portada de bienvenida previa al inicio de sesión.
- Diseño responsive para escritorio y celular.

El frontend fue reorganizado en módulos de CSS y JavaScript para separar estilos, componentes de interfaz, formularios y lógica funcional. El detalle de esa estructura está en [frontend/README.md](frontend/README.md).

## Alcance implementado y pendiente

### Implementado en esta entrega

- **Autenticación y roles:** ingreso y cierre de sesión; acceso diferenciado para Administrador y Docente.
- **Usuarios:** alta, modificación, baja, eliminación y cambio de rol.
- **Estudiantes:** alta, modificación, baja y listado.
- **Cursos e inscripciones:** creación y modificación de cursos; inscripción y baja de estudiantes.
- **Calendarios académicos:** configuración y consulta.
- **Asistencias:** registro por curso y fecha, con estados de presente, ausente y tardanza, y retiros anticipados.
- **Reportes:** consulta por curso con totales, porcentajes y detalle por estudiante.
- **Panel de resumen:** estado de la asistencia del día, indicadores generales y accesos rápidos según el rol.
- **Experiencia de usuario:** nueva portada, navegación móvil, reportes adaptados a celular, páginas legales responsive y footer institucional.
- **Documentación:** README general, documentación de API, SRS, pruebas, release y frontend.

### Pendiente o fuera de esta entrega

- **Asignaturas, comisiones y horarios:** las rutas propuestas no están implementadas.
- **Justificaciones digitales y certificados:** la carga y gestión de justificantes sigue siendo parte del alcance planificado.
- **Alertas pedagógicas:** la configuración de umbrales y la generación de alertas quedaron fuera de esta entrega.
- **Gestión completa de clases:** falta definir operaciones, actores y su relación con calendarios, horarios y asistencias.
- **Rol Preceptor:** puede registrarse como usuario, pero no tiene una vista propia en la interfaz actual.
- **Pruebas automatizadas:** no hay una suite ejecutable; `npm test` todavía requiere corrección.
- **Despliegue en producción:** no se definió sistema operativo, hosting, dominio, secretos ni estrategia de copias de seguridad.

### Desvíos respecto de la planificación inicial

- Se priorizó el rediseño visual y la experiencia de uso del frontend.
- El panel de resumen se construyó con los endpoints existentes (`/listCourses`, `/listStudents` y `/getAttendanceReport`), sin modificar el contrato del backend.
- No se implementaron asignaturas, comisiones, horarios, justificaciones ni alertas.
- No se agregó una suite de pruebas automatizadas.
- El despliegue de producción quedó sin definir.
- El rol Preceptor puede registrarse, pero no tiene una vista propia.

### Trazabilidad por requerimiento

| Requerimiento | Estado | Resumen de la entrega |
| --- | --- | --- |
| 1. Usuarios | Parcial | Registro, deshabilitación y cambio de rol; falta una asignación separada de roles. |
| 2. Estudiantes | Parcial | Alta, modificación y baja lógica individual; faltan carga masiva y movimiento entre cursos. |
| 3. Cursos | Parcial | Alta/modificación e inscripción individual; falta asignación masiva de estudiantes. |
| 4. Asignaturas | No implementado | Sin entidad de asignatura. |
| 5. Calendario académico | Parcial | Fechas válidas y feriados; faltan horarios de cursos y asignaturas. |
| 6. Asistencias | Parcial | Registro de estudiantes y porcentajes; faltan asistencia docente y vínculo con clases. |
| 7. Inasistencias | Parcial | La ausencia se registra dentro de la asistencia; faltan justificaciones y certificados. |
| 8. Configuración de alertas | No implementado | Sin umbrales configurables. |
| 9. Alertas | No implementado | Sin generación ni asociación de alertas. |
| 10. Reportes y estados | Parcial | Reportes por curso y porcentajes; faltan filtros, alertas y estados de justificaciones. |
| 11. Clases | No implementado | No hay entidad de clase; las asistencias se agrupan por curso y fecha. |

El detalle de cada subrequerimiento está en [srs/README.md](srs/README.md#trazabilidad-de-requerimientos).

Los requerimientos funcionales incluidos más abajo describen el alcance previsto; la implementación efectiva es la resumida en esta sección.

## Inicio rápido en Windows

Hay dos lanzadores de desarrollo local, según el sistema operativo: `levantar_servidores.ps1` para Windows y `levantar_servidores.sh` para Linux. Usá solo el correspondiente a tu entorno.

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

La base SQLite se crea localmente en `backend/db.sqlite3` al iniciar el backend; está excluida de Git. Para crear el usuario administrador inicial y configurar los permisos, ejecutá una vez desde la raíz:

```powershell
Set-Location .\backend
node .\seed.mjs
Set-Location ..
```

El usuario inicial es `admin` y su contraseña es `1234`. Cambiá esa contraseña y no uses estas credenciales en un entorno publicado. El script de inicio levanta los dos servidores, pero no ejecuta la carga inicial.

### Base de datos de prueba

Para crear una base independiente con usuarios, cursos, estudiantes y asistencias de prueba:

```powershell
Set-Location .\backend
node .\seed-test.mjs
```

El script crea `backend/db-test.sqlite3` y no modifica `backend/db.sqlite3`. Todos los usuarios de prueba usan la contraseña `1234`: `pablo` y `jazmin` son administradores, `carlos` es preceptor, `jose` tiene el curso `Algoritmos 1`, `matias` tiene `Seminario` y `Practicas 3`, y `gabriel` no tiene cursos.

También se crea el usuario `admin` con rol Administrador y contraseña `1234`.

Para iniciar el backend usando la base de prueba, ejecutá:

```powershell
Set-Location .\backend
$env:DB_PATH = '.\db-test.sqlite3'
node .\main.mjs
```

En Linux, usá:

```bash
cd backend
DB_PATH=./db-test.sqlite3 node main.mjs
```

También podés iniciar el backend de prueba directamente desde la raíz:

```bash
./usarbdtest.sh
```

En Windows PowerShell:

```powershell
.\usarbdtest.ps1
```

Estos lanzadores usan `backend/db-test.sqlite3`. El frontend continúa iniciándose en otra terminal con el comando indicado en [Inicio manual](#inicio-manual).

Para iniciar backend y frontend de prueba juntos:

```bash
./levantar_servidores_test.sh
```

En Windows PowerShell:

```powershell
.\levantar_servidores_test.ps1
```

Usá `levantar_servidores.sh` o `levantar_servidores.ps1` cuando quieras iniciar la aplicación con la base normal.

Volver a ejecutar `seed-test.mjs` borra y recrea todos los datos de prueba.

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
- Panel de resumen con saludo, fecha, rol, asistencia del día, indicadores y accesos rápidos.
- Administración de usuarios: alta, modificación, baja, eliminación y cambio de rol.
- Gestión de estudiantes: alta, modificación, baja y listado.
- Gestión de cursos e inscripciones de estudiantes.
- Calendarios académicos.
- Registro de asistencia por curso y fecha, con estados y retiros anticipados.
- Reportes de asistencia por curso, con totales y porcentaje por estudiante.
- Acceso docente a sus cursos, toma de asistencia, “Mis alumnos” y reportes.
- Portada de bienvenida con acceso al inicio de sesión y descripción de funciones.
- Navegación lateral en escritorio y navegación inferior en celular, filtradas por rol.
- Reporte de asistencias móvil como lista de clases accionable.
- Páginas de términos y condiciones y política de privacidad responsive.
- Footer institucional con el logo del ISFT N.º 151.

Las justificaciones digitales, las alertas pedagógicas, las asignaturas, las comisiones y los horarios forman parte del alcance planteado, pero no están disponibles todavía en la interfaz actual.

---

# Objetivos y alcance

Los objetivos funcionales y los requerimientos no funcionales se encuentran en [srs/README.md](srs/README.md). La especificación conserva el alcance planeado y diferencia lo implementado de lo no alcanzado. Las alertas forman parte de los requerimientos, pero quedaron fuera de esta entrega.

---

# Planificación

El seguimiento se gestiona en la [planilla de supervisión y avance](https://docs.google.com/spreadsheets/d/1_nh5zMnrUbhaEw9PTOLw36pfdZt3iTiIUrgg5JzhuA0/edit?gid=0#gid=0).

---

# Requerimientos funcionales y no funcionales

La especificación completa está organizada en [srs/README.md](srs/README.md). Incluye objetivos, RF1-RF11 y criterios de calidad.

# Documentación de la API

Las rutas implementadas, los contratos pendientes y sus decisiones abiertas están en [api/README.md](api/README.md). La lógica de servidor está en [backend/main.mjs](backend/main.mjs), [backend/handlers.js](backend/handlers.js) y [backend/model.js](backend/model.js).

---

# Testing

La carpeta y el estado de las pruebas se describen en [testing/README.md](testing/README.md). Actualmente no hay una suite ejecutable: `npm test` falla porque intenta cargar `backend/run`, que no existe.

---

# Release

La carpeta [release/](release/README.md) documenta los lanzadores actuales y los datos que faltan para definir un despliegue de producción.

---

# Media

La carpeta [media/](media/README.md) está preparada para incorporar material de difusión institucional aprobado.

---

# Reglas de desarrollo

El proyecto seguirá las siguientes reglas de desarrollo establecidas por la cátedra:

- No se utilizarán ramas de trabajo salvo que sean gestionadas correctamente.
- No se incorporarán archivos de configuración específicos de cada integrante.
- Se utilizará `.gitignore` para excluir archivos propios del entorno de desarrollo.
- No se incorporarán archivos binarios de ejecución ni dependencias instaladas localmente. `node_modules` y la base SQLite local se excluyen mediante `.gitignore`; `package-lock.json` se conserva para reproducir la instalación.
- El código del repositorio no deberá contener comentarios.
- La documentación y los textos de interfaz se redactan en español; los nombres técnicos existentes se mantienen en inglés únicamente cuando forman parte del código o del contrato de API.
- Se utilizará una indentación uniforme de 4 espacios.
- Se respetará una única convención de nombres en todo el proyecto.
- Los cambios deberán registrarse mediante commits periódicos.
- Cada integrante será responsable de mantener sus configuraciones propias fuera del repositorio.

---

# Convención de nombres

Las clases usan `UpperCamelCase` (por ejemplo, `Menu`). Las funciones, variables y rutas de API usan `lowerCamelCase` (por ejemplo, `getAttendanceReport`, `attendancePercentage`). Se mantienen los nombres del contrato API para evitar incompatibilidades.

---

# Estructura del repositorio

    isft151-pp3/
    │
    ├── README.md
    ├── LICENSE
    ├── .gitignore
    ├── levantar_servidores.ps1
    ├── levantar_servidores.sh
    ├── levantar_servidores_test.ps1
    ├── levantar_servidores_test.sh
    ├── levantar_apache.sh
    ├── levantar_node.sh
    ├── usarbdtest.ps1
    ├── usarbdtest.sh
    ├── api/
    │   └── README.md
    ├── srs/
    │   └── README.md
    ├── media/
    │   └── README.md
    ├── testing/
    │   └── README.md
    ├── release/
    │   └── README.md
    ├── backend/
    │   ├── README.md
    │   ├── main.mjs
    │   ├── handlers.js
    │   ├── model.js
    │   ├── database.js
    │   ├── config.json
    │   ├── seed.mjs
    │   ├── seed-test.mjs
    │   ├── package.json
    │   └── package-lock.json
    └── frontend/
        ├── README.md
        ├── index.html
        ├── terminos.html
        ├── privacidad.html
        ├── logo-isft151.png
        ├── css/
        │   ├── styles.css
        │   ├── base.css
        │   ├── layout.css
        │   ├── navigation.css
        │   ├── components.css
        │   ├── welcome.css
        │   ├── dashboard.css
        │   ├── attendance.css
        │   ├── auth.css
        │   └── legal.css
        └── js/
            ├── core/
            │   ├── api.js
            │   └── helpers.js
            ├── ui/
            │   ├── navigation.js
            │   ├── welcome.js
            │   ├── dashboard.js
            │   └── footer.js
            ├── modals/
            │   ├── auth.js
            │   ├── forms.js
            │   └── attendance.js
            ├── features/
            │   ├── session.js
            │   ├── users.js
            │   ├── students.js
            │   ├── courses.js
            │   ├── calendar.js
            │   ├── attendance.js
            │   └── attendance-report.js
            ├── menu.js
            └── app.js

La carpeta `backend/node_modules`, `backend/db.sqlite3` y `backend/db-test.sqlite3` se generan localmente y no se versionan.

# Tecnologías

- Backend: Node.js con módulos ES y servidor HTTP nativo.
- Persistencia: SQLite mediante `node:sqlite`.
- Frontend: HTML, CSS y JavaScript clásico; servidor estático de desarrollo de Python.
- Dependencia del backend: `sqlite3`.
- Interfaz: CSS modular, iconografía Material Symbols y diseño responsive.

---

# Instalación

Para requisitos e instrucciones de inicio, consultá [Inicio rápido en Windows](#inicio-rápido-en-windows). El script de Windows instala las dependencias de Node cuando no existe `backend/node_modules`.

---

# Despliegue

Los scripts disponibles levantan el sistema para desarrollo local; todavía no hay un destino ni un procedimiento de producción configurados.

### Windows

Desde la raíz, iniciar ambos servicios con:

```powershell
.\levantar_servidores.ps1
```

El backend queda en `http://localhost:3000` y el frontend en `http://localhost:8081`. Requiere Node.js 22 o superior y Python 3. Para más detalles, consultar [Inicio rápido en Windows](#inicio-rápido-en-windows).

### Linux

En un escritorio Linux compatible con el emulador de terminal configurado, iniciar con:

```bash
./levantar_servidores.sh
```

`levantar_servidores.sh` coordina las dos terminales: ejecuta `levantar_node.sh` para iniciar el backend con Node.js y `levantar_apache.sh` para servir el frontend en el puerto 8081. Requiere Node.js 22 o superior, Apache instalado y un emulador de terminal gráfico. `levantar_apache.sh` detiene el servicio `apache2` del sistema y requiere permisos `sudo`; revisar ese efecto antes de ejecutarlo.

### Producción

El despliegue de producción queda pendiente de definir el sistema operativo, servidor/hosting, dominio, gestión de secretos, persistencia y estrategia de copias de seguridad. No ejecutar los lanzadores de desarrollo como si fueran configuración de producción. Ver [release/README.md](release/README.md).

---

# Ejecución de pruebas

El estado y las instrucciones de pruebas están en [testing/README.md](testing/README.md). La suite todavía no existe y el comando `test` de `backend/package.json` requiere una corrección antes de utilizarse.

---

# Change Log

## Versión presentada (entrega de la cursada)

- Se rediseñó la pantalla de bienvenida con hero, tarjetas de funciones y llamada a la acción.
- Se incorporó el panel de resumen con datos reales: asistencia del día, indicadores y accesos rápidos.
- Se movieron los accesos rápidos del panel debajo del contenido en escritorio.
- Se mejoró la navegación móvil con barra inferior y accesos filtrados por rol.
- Se convirtió el reporte de asistencias móvil en una lista de clases accionable.
- Se incorporaron páginas legales responsive y el footer institucional con el logo del ISFT N.º 151.
- Se reorganizaron los estilos y scripts del frontend en módulos por responsabilidad.
- Se documentó la estructura del frontend y los criterios de diseño.
- Se agregó la trazabilidad de requerimientos con estados implementado, parcial y no implementado.

## Versión base

- Se incorporó inicio y cierre de sesión con control de acceso por rol.
- Se incorporó administración básica de usuarios: registro, modificación, deshabilitación, eliminación y cambio de rol.
- Se incorporó alta, modificación, baja y consulta de estudiantes.
- Se incorporó creación y modificación de cursos, inscripción y baja de inscripción de estudiantes.
- Se incorporó configuración y consulta de calendarios académicos.
- Se incorporó toma de asistencia por curso y fecha, con estados y retiros anticipados.
- Se incorporó consulta de reportes de asistencia por curso con totales y porcentajes.
- Se añadieron lanzadores locales para Windows y Linux y documentación para `api`, `srs`, `media`, `testing` y `release`.

Las funciones de nóminas, asignaturas, justificaciones, alertas y gestión de clases siguen en el alcance propuesto y no están implementadas en el backend actual.

---

# Integrantes

- Jazmín Saavedra
- Pablo Curtti
- Carlos Guariglia

## Gestor del proyecto

El rol de Gestor de proyecto será definido por el grupo.

---

# Estado del proyecto

**Versión presentada para la entrega de la cursada.** El sistema queda funcional para desarrollo local; el despliegue en producción y los requerimientos pendientes se detallan en las secciones anteriores.
