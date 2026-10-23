# Preparacion y despliegue

Los scripts actuales (`levantar_servidores.ps1` y `levantar_servidores.sh`) son para desarrollo local; no realizan un despliegue de produccion.

El destino de produccion, el sistema operativo, el servidor web, la configuracion de Node.js, la gestion de secretos y el mecanismo de persistencia aun deben definirse. No se agrega un script de despliegue hasta contar con esos datos, para evitar presentar una configuracion local como si fuera de produccion.

Para iniciar localmente, seguir las instrucciones de [Despliegue en el README principal](../README.md#despliegue).
