MiRegistro - frontend separado

Estructura actual:
- index.html: documento base y orden de carga de scripts.
- terminos.html y privacidad.html: páginas legales responsive.
- css/styles.css: hoja de entrada que importa los módulos de estilos.
- css/base.css: tokens, reset, tipografía e iconos.
- css/layout.css: estructura general, sidebar, cabecera y footer.
- css/navigation.css: navegación lateral, menú móvil y menú de cuenta.
- css/components.css: botones, tarjetas, formularios, diálogos, tablas y avisos.
- css/welcome.css: pantalla de inicio.
- css/attendance.css: modal de asistencia y reportes.
- css/auth.css: ingreso y creación de cuenta.
- css/legal.css: páginas de Términos y Privacidad.
- js/core/api.js: host, sesión, notificaciones y llamadas RPC existentes.
- js/core/helpers.js: utilidades, tablas y badges.
- js/ui/navigation.js: navegación y tarjetas de acciones.
- js/ui/welcome.js: pantalla de bienvenida.
- js/ui/footer.js: footer institucional con logo.
- js/modals/auth.js: modal de ingreso / alta.
- js/modals/forms.js: modal genérico de formularios.
- js/modals/attendance.js: modal para tomar asistencia.
- js/features/session.js: ingreso, cierre y restauración de vistas.
- js/features/users.js: usuarios y roles.
- js/features/students.js: estudiantes.
- js/features/courses.js: cursos e inscripciones.
- js/features/calendar.js: calendario académico.
- js/features/attendance.js: asistencias y reportes.
- js/features/attendance-report.js: render del reporte de asistencia.
- js/menu.js: componente principal y estructura de la aplicación.
- js/app.js: punto de entrada; crea el componente principal.

Importante:
Los archivos JavaScript se cargan como scripts clásicos y comparten el ámbito global. Respetar el orden de index.html.
No cambiar el orden ni agregar type=module sin refactorizar dependencias.
El backend no se modificó: se conservan los mismos endpoints, cabeceras y cuerpos de las llamadas existentes.

Mantenimiento:
- Para cambiar colores o tipografía: css/base.css.
- Para cambiar la estructura general: css/layout.css.
- Para cambiar botones, tarjetas, tablas o diálogos: css/components.css.
- Para agregar o modificar una acción de una sección: js/features/<seccion>.js.
- Para cambiar el reporte de asistencia: js/features/attendance-report.js.
- Para cambiar textos legales: terminos.html y privacidad.html.

Navegación móvil:
Cuenta abre un panel contextual: sin sesión permite iniciar sesión; con sesión muestra el estado y permite cerrar sesión.

Flujo de acceso (estado de esta entrega):
- Implementado: modal de inicio de sesión con usuario, contraseña, mostrar/ocultar contraseña y enlaces legales.
- Implementado: enlaces a los documentos legales y ayuda visual para solicitar acceso.
- Pendiente de backend: recuperación/restablecimiento de contraseña (no existe endpoint verificado).
- Pendiente de backend/configuración: OAuth de Google (botón visible pero deshabilitado).
- Las cuentas siguen siendo provisionadas por Administración mediante el endpoint existente; no se habilitó autorregistro público.
- La aceptación se exige en la interfaz, pero aún debe registrarse en backend con fecha, versión del documento e identidad del usuario para tener constancia verificable.
