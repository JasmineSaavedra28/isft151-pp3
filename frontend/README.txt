MiRegistro - frontend separado

Estructura:
- index.html: estructura base y referencias a recursos.
- css/styles.css: estilos de la aplicación.
- js/api-and-modals.js: comunicación HTTP con backend, utilidades y ventanas modales.
- js/ui.js: componentes y funciones de interfaz, navegación y bienvenida.
- js/menu.js: componente principal y funcionalidades de gestión.
- js/app.js: punto de entrada; crea el componente principal y arranca la aplicación.

Importante:
Los archivos JavaScript se cargan como scripts clásicos y en el orden indicado en index.html. 
No cambiar ese orden ni agregar type=module sin refactorizar dependencias. 
Se mantuvo la lógica original y se separó en límites de funciones/clase para reducir el tamaño del índice y distribuir responsabilidades.

Navegación móvil: mantiene siempre las cinco opciones. Cuenta abre un panel contextual: sin sesión permite iniciar sesión; con sesión muestra el estado y permite cerrar sesión.

Flujo de acceso (estado de esta entrega):
- Implementado: modal de inicio de sesión con usuario, contraseña, mostrar/ocultar contraseña y aceptación requerida de Términos y Política de privacidad.
- Implementado: enlaces a los documentos legales y ayuda visual para solicitar acceso.
- Pendiente de backend: recuperación/restablecimiento de contraseña (no existe endpoint verificado).
- Pendiente de backend/configuración: OAuth de Google (botón visible pero deshabilitado para no simular una autenticación funcional).
- Las cuentas siguen siendo provisionadas por Administración mediante el endpoint existente; no se habilitó autorregistro público.
- La aceptación se exige en la interfaz, pero aún debe registrarse en backend con fecha, versión del documento e identidad del usuario para tener constancia verificable.

Cambios de esta revisión:
- El inicio de sesión NO solicita aceptar términos en cada ingreso.
- El formulario de alta de usuario incluye casilla obligatoria de aceptación y contraseña inicial.
- Los campos de contraseña usan un icono de ojo para mostrar/ocultar.
- Importante: el backend actual de /registerUser no registra evidencia de aceptación; el checkbox es una validación de interfaz para el proceso de alta y no sustituye un registro legal persistente. Para evidencia auditable se debe ampliar API/base de datos con versión, fecha y usuario que aceptó.
