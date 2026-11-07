MiRegistro - frontend separado

Estructura:
- index.html: estructura base y referencias a recursos.
- css/styles.css: estilos de la aplicación.
- js/app.js: lógica actual de la aplicación.



Importante:
En esta primera separación se extrajeron CSS y JavaScript sin reescribir la lógica. 
El JavaScript permanece en un único app.js para preservar el orden y el alcance de funciones/variables globales. 
La siguiente etapa puede dividir app.js por módulos (API, autenticación, navegación y vistas) con pruebas entre cada cambio.
