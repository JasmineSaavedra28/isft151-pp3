# Backend

Backend HTTP desarrollado con Node.js (version 22 o superior), modulos ES y SQLite.

## Desarrollo local

Desde esta carpeta, instalar dependencias y levantar el servidor:

```powershell
npm install
node .\main.mjs
```

La API escucha en `http://localhost:3000`. La base SQLite se crea localmente al iniciar el backend. Para cargar el usuario inicial y los permisos, ejecutar una vez:

```powershell
node .\seed.mjs
```

El detalle de rutas implementadas y propuestas esta en [Documentacion de la API](../api/README.md).
