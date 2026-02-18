# Plan: Libro de Villanos

## Contexto

Actualmente los villanos se muestran como tarjetas en un carrusel horizontal en la pantalla de selección de personaje. Queremos reemplazar esto con un **"Libro de Villanos"**: un libro abierto con dos páginas (índice a la izquierda, detalle a la derecha) con animación crossfade al cambiar de villano.

## Archivos a modificar/crear

| Archivo                             | Acción        | Qué cambia                                                          |
| ----------------------------------- | ------------- | ------------------------------------------------------------------- |
| `js/utils.js`                       | **Crear**     | Extraer `crearElemento()` como utilidad compartida                  |
| `js/componentes/stats.js`           | **Crear**     | Extraer `llenarStats()` y `TIERS` como módulo compartido            |
| `js/componentes/libroVillanos.js`   | **Crear**     | Componente completo del libro                                       |
| `estilos.css`                       | **Modificar** | Agregar estilos del libro (~180 líneas)                             |
| `js/juego.js`                       | **Modificar** | Extraer funciones, reemplazar carrusel por libro, eliminar h2 título |

No se modifica `index.html` — el `<div class="villanos">` existente sirve como punto de montaje.

---

## Paso 1: Extraer utilidades compartidas

### `js/utils.js`

Mover `crearElemento(tag, clase, texto)` (líneas 42-47 de juego.js) a un módulo independiente.

```javascript
export function crearElemento(tag, clase, texto) { ... }
```

### `js/componentes/stats.js`

Mover `llenarStats(tarjeta, datos)` (líneas 50-111) y el objeto `TIERS` (líneas 31-38) desde juego.js.

```javascript
import { crearElemento } from '../utils.js';

export const TIERS = { ... };
export function llenarStats(tarjeta, datos) { ... }
```

### Actualizar `js/juego.js`

Reemplazar las definiciones eliminadas con imports:

```javascript
import { crearElemento } from './utils.js';
import { TIERS, llenarStats } from './componentes/stats.js';
```

El resto de juego.js sigue funcionando igual — es un refactor mecánico (cortar/pegar + export/import).

---

## Paso 2: Crear `js/componentes/libroVillanos.js`

Componente con patrón `crearLibroVillanos(contenedor)` que retorna API.

### Estructura DOM generada

```
div.libro-villanos
├── div.libro-pagina.libro-pagina-izq        ← Índice
│   ├── h3.libro-titulo  "Libro de Villanos"
│   ├── div.libro-ornamento
│   ├── ul.libro-indice
│   │   └── li.libro-indice-item[data-villano] × 4
│   └── div.libro-ornamento
├── div.libro-lomo                            ← Lomo decorativo
└── div.libro-pagina.libro-pagina-der         ← Detalle
    ├── div.libro-detalle-contenido           ← Contenido con crossfade
    └── div.libro-navegacion
        ├── button ‹ anterior
        ├── span "1 / 4"
        └── button › siguiente
```

### Contenido de cada página de villano

- Avatar circular con imagen (`datos.img`)
- Nombre (h3, fuente Creepster) + badge de tier
- Descripción
- Stats: barra vida, barra velocidad, atributos (edad/estatura), ataques

### Imports del componente

```javascript
import { crearElemento } from '../utils.js';
import { TIERS, llenarStats } from './stats.js';
import { ENEMIGOS } from '../enemigos.js';
```

Sin duplicación de código — reutiliza las funciones extraídas en el paso 1.

### Orden de villanos

Orden fijo por tier (esbirro → terror → pesadilla → leyenda), coherente con el concepto de "libro/bestiario". No se usa `mezclar()`.

### Lógica de navegación

- `indiceActual` y lista ordenada de nombres de villanos
- `navegarA(nuevoIndice)`: crossfade del contenido (fadeOut → reemplazar → fadeIn, ~300ms)
- Flag `transicionEnCurso` para bloquear clicks durante animación
- Click en item del índice → `navegarA()`
- Botones ‹/› → anterior/siguiente (deshabilitados en extremos)

### Navegación por teclado

- `ArrowLeft` / `ArrowRight` para navegar entre villanos
- `Enter` en item del índice para seleccionarlo
- Items del índice con `tabindex="0"` para ser focuseables

---

## Paso 3: Agregar CSS del libro en `estilos.css`

Insertar antes de la sección `@media` (línea ~2914). Secciones:

1. **Layout del libro** — `.libro-villanos` flex horizontal, max-width 700px centrado
2. **Animación de entrada** — `fadeIn` + `scale(0.95 → 1)` al montarse, como si el libro se "abriera" sobre la mesa
3. **Páginas** — `.libro-pagina-izq/der` con gradientes oscuros tipo pergamino, min-height 380px
4. **Lomo** — `.libro-lomo` 20-24px con gradiente tipo cuero/madera y sombras inset para profundidad
5. **Índice** — `.libro-indice-item` con hover, `.libro-indice-activo` con color accent, `cursor: pointer`
6. **Contenido villano** — Avatar circular, nombre Creepster, stats reutilizando clases `.stat-vida`, `.barra-vida-relleno`, etc.
7. **Ornamentos** — Pseudo-elementos `::before/::after` en esquinas con caracteres decorativos, líneas divisorias con gradiente
8. **Crossfade** — `@keyframes libro-fadeIn/libro-fadeOut` con opacity + leve translateX (~10px), duración 0.3s
9. **Navegación** — Botones circulares con hover accent, contador de página
10. **Responsive tablet** — `@media (width <= 768px)` reducir tamaño de fuentes y padding
11. **Responsive mobile** — `@media (width <= 480px)` layout vertical: solo página de detalle visible, índice como tabs compactos horizontales arriba, navegación con botones ‹/›

### Paletas por villano

Se reutilizan las clases existentes `.villano-siniestra`, `.villano-trasgo`, etc. La clase del villano activo se aplica al contenedor de la página derecha para que h3, avatar img, barras y ataques hereden los colores correctos.

---

## Paso 4: Integrar en `juego.js`

Reemplazar las líneas 222-229 del carrusel:

```javascript
// ANTES:
const contenedorVillanos = document.querySelector('.villanos');
contenedorVillanos.replaceChildren();
mezclar(Object.keys(ENEMIGOS)).forEach(function (nombre) { ... });
crearCarrusel(contenedorVillanos);

// DESPUÉS:
import { crearLibroVillanos } from './componentes/libroVillanos.js';
const contenedorVillanos = document.querySelector('.villanos');
crearLibroVillanos(contenedorVillanos);
```

Eliminar el `<h2 class="titulo-villanos">` desde JS (el libro tiene su propio título interno "Libro de Villanos"):

```javascript
const tituloVillanos = document.querySelector('.titulo-villanos');
if (tituloVillanos) tituloVillanos.remove();
```

---

## Orden de implementación

1. **Extraer utilidades** — Crear `js/utils.js` y `js/componentes/stats.js`, actualizar imports en `juego.js`
2. **Verificar que todo sigue funcionando** — El carrusel original debe seguir intacto tras el refactor
3. **Estructura base del libro** — Crear `libroVillanos.js` con DOM completo y navegación sin animación (cambio directo de contenido)
4. **CSS base** — Layout del libro, páginas, lomo (20-24px), índice, contenido del villano, ornamentos
5. **Integración** — Reemplazar carrusel en `juego.js`, eliminar h2 título
6. **Crossfade** — Agregar keyframes CSS y lógica `navegarA()` con transición
7. **Animación de entrada** — FadeIn + scale al montar el libro
8. **Teclado** — Navegación con flechas y Enter
9. **Responsive** — Tablet (reducir) y mobile (tabs + detalle full)
10. **Lint + formato** — `npm run lint:fix && npm run lint:css:fix && npm run format`

---

## Verificación

1. `npm run dev` → abrir http://localhost:3000
2. Verificar que el libro aparece en la pantalla de selección con animación de entrada
3. Click en cada villano del índice → se muestra con crossfade y colores correctos
4. Botones ‹/› funcionan, se deshabilitan en los extremos
5. Flechas del teclado navegan entre villanos
6. Villanos aparecen en orden por tier (esbirro → leyenda)
7. Reducir ventana → responsive funciona (tablet: libro reducido, mobile: tabs + detalle)
8. `npm run build` → verificar que el bundle se genera sin errores
