MiRegistro - frontend separado

Estructura:
- index.html: estructura base y referencias a recursos.
- css/styles.css: estilos de la aplicación.
- js/api-and-modals.js: comunicación HTTP con backend, utilidades y ventanas modales.
- js/ui.js: componentes y funciones de interfaz, navegación y bienvenida.
- js/menu.js: componente principal y funcionalidades de gestión.
- js/app.js: punto de entrada; crea el componente principal y arranca la aplicación.

Importante:
Los archivos JavaScript se cargan como scripts clásicos y en el orden indicado en index.html. No cambiar ese orden ni agregar type=module sin refactorizar dependencias. Se mantuvo la lógica original y se separó en límites de funciones/clase para reducir el tamaño del índice y distribuir responsabilidades.



Navegación móvil: mantiene siempre las cinco opciones.
Cuenta abre un panel contextual: sin sesión permite iniciar sesión; con sesión muestra el estado y permite cerrar sesión.
