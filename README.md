# Sistema de Control de Asistencias Escolares

## Resumen

El Sistema de Control de Asistencias Escolares es una plataforma web orientada a sistematizar y centralizar la gestión de asistencias en instituciones educativas.

Repositorio: [github.com/JasmineSaavedra28/isft151-pp3](https://github.com/JasmineSaavedra28/isft151-pp3)

El sistema busca reemplazar el uso de registros en papel y planillas de cálculo realizadas de forma manual, permitiendo administrar de manera centralizada la información académica y la asistencia de los estudiantes.

El alcance previsto contempla la gestión de entidades educativas, cursos, asignaturas, comisiones, docentes y estudiantes. También define el calendario académico, el registro de clases y la asociación de las asistencias con las clases dictadas.

La carga digital de justificantes, las alertas ante acumulación de faltas o situaciones de riesgo pedagógico y los reportes forman parte de los objetivos del sistema; el avance implementado se detalla en la sección de estado actual.

## Estado actual

El repositorio contiene una aplicación web en desarrollo con una interfaz HTML y un backend HTTP en Node.js. Actualmente la interfaz permite iniciar sesión, administrar usuarios, estudiantes y cursos, inscribir estudiantes, configurar calendarios académicos, registrar asistencias y consultar reportes.

Los requerimientos funcionales incluidos más abajo describen el alcance previsto; no todas esas funcionalidades están implementadas todavía en la interfaz.

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

# Objetivos y alcance

Los objetivos funcionales y los requerimientos no funcionales se encuentran en [srs/README.md](srs/README.md). El alcance funcional actual sigue separando claramente las rutas implementadas de las propuestas.

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
- La documentación y los textos de interfaz se redactan en español. Los identificadores técnicos de la API están en inglés según el contrato actual; esta excepción debe confirmarse con la cátedra frente a la regla de idioma único.
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
    ├── levantar_apache.sh
    ├── levantar_node.sh
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
    │   ├── package.json
    │   └── package-lock.json
    └── frontend/
        ├── README.md
        ├── index.html
        └── WebComponentes(LoginyForms)/

La carpeta `backend/node_modules` y `backend/db.sqlite3` se generan localmente y no se versionan.

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

## Versión en desarrollo

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

**En desarrollo**
