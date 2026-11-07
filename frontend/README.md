# Frontend

Interfaz web de MiRegistro desarrollada con HTML, CSS y JavaScript clásico.

## Ejecutar

Desde esta carpeta:

```powershell
py -m http.server 8081
```

Luego abrir `http://localhost:8081`. El backend debe estar activo en `http://localhost:3000`.

## Estructura

```text
frontend/
├── index.html          # aplicación
├── terminos.html       # página legal responsive
├── privacidad.html     # página legal responsive
├── logo-isft151.png    # logo institucional (se muestra en el footer)
├── css/
│   ├── styles.css      # entrada que importa los módulos
│   ├── base.css        # tokens, reset y tipografía
│   ├── layout.css      # shell, sidebar, header y footer
│   ├── navigation.css  # menú lateral, menú móvil y cuenta
│   ├── components.css  # botones, tarjetas, formularios, tablas, etc.
│   ├── welcome.css     # pantalla de bienvenida
│   ├── dashboard.css   # panel de resumen con datos reales
│   ├── attendance.css  # asistencia y reportes
│   ├── auth.css        # ingreso y alta de cuenta
│   └── legal.css       # páginas legales
└── js/
    ├── core/
    │   ├── api.js          # sesión, notificaciones y llamadas RPC
    │   └── helpers.js      # utilidades, tablas y badges
    ├── ui/
    │   ├── navigation.js   # navegación y tarjetas
    │   ├── welcome.js      # bienvenida
    │   ├── dashboard.js    # panel de resumen
    │   └── footer.js       # footer institucional
    ├── modals/
    │   ├── auth.js         # ingreso / alta
    │   ├── forms.js        # formularios genéricos
    │   └── attendance.js   # toma de asistencia
    ├── features/
    │   ├── session.js
    │   ├── users.js
    │   ├── students.js
    │   ├── courses.js
    │   ├── calendar.js
    │   ├── attendance.js
    │   └── attendance-report.js
    ├── menu.js            # componente principal
    └── app.js             # punto de entrada
```

Los scripts son clásicos y comparten el ámbito global. **Respetar el orden de carga de `index.html`**; no agregar `type="module"` sin refactorizar las dependencias.

## Dónde tocar cada cosa

| Necesidad | Archivo |
| --- | --- |
| Colores, tipografía, sombras | `css/base.css` |
| Ancho del menú, cabecera, footer | `css/layout.css` |
| Botones, tarjetas, tablas, diálogos | `css/components.css` |
| Menú lateral y navegación móvil | `css/navigation.css` |
| Pantalla de inicio | `css/welcome.css` y `js/ui/welcome.js` |
| Panel de resumen | `css/dashboard.css` y `js/ui/dashboard.js` |
| Asistencia y reportes | `css/attendance.css` y `js/features/` |
| Login y alta de cuenta | `css/auth.css` y `js/modals/auth.js` |
| Textos legales | `terminos.html` y `privacidad.html` |

## Criterios de diseño

- Paleta institucional azul con acentos suaves y fondo neutro.
- Sidebar oscuro con estado activo visible.
- Tarjetas con jerarquía de acciones: primaria, secundaria y peligrosa.
- En celular: navegación inferior flotante, modales tipo *bottom sheet* y reporte de asistencias como **lista de clases accionable** (sin tablas anchas ni scroll horizontal): cada fecha muestra los conteos P/A/T/R y abre el formulario de esa clase.
- Footer institucional con el logo del ISFT N.º 151 siempre abajo.
- Se respeta `prefers-reduced-motion` para animaciones.
