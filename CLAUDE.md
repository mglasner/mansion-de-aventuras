# La Mansión de Aventuras

Videojuego web creado como proyecto familiar para aprender HTML, CSS y JavaScript.

## Estructura del proyecto

```
mansion-de-aventuras/
├── assets/
│   └── img/
│       └── personajes/      # Avatares de los personajes
│           ├── lina.png
│           ├── rose.png
│           └── pandajuro.png
├── js/
│   ├── entidades.js          # Clases base: Entidad, Personaje, Enemigo
│   ├── personajes.js         # Definición de personajes jugables (datos/stats)
│   ├── enemigos.js           # Definición de enemigos (datos/stats)
│   ├── juego.js              # Lógica principal, coordina componentes y game loop
│   ├── componentes/          # Componentes UI (crean su propio HTML desde JS)
│   │   ├── barraSuperior.js  # Barra de estado: avatar, vida, inventario
│   │   ├── modalPuerta.js    # Modal de confirmación para entrar a habitaciones
│   │   └── modalDerrota.js   # Modal de game over (reutilizable en todas las etapas)
│   └── habitaciones/         # Cada habitación crea su propia pantalla
│       └── habitacion1.js    # Habitación 1: El Laberinto (buscar la llave)
├── index.html                # Estructura de las pantallas del juego
├── estilos.css               # Estilos visuales y animaciones
└── CLAUDE.md
```

## Stack

- HTML, CSS y JavaScript puro (ES modules)
- Build de producción: esbuild (bundle + minificación)
- Deploy: GitHub Actions → GitHub Pages

## Personajes

| Nombre        | Descripción                                    | Paleta    |
| ------------- | ---------------------------------------------- | --------- |
| **Lina**      | 13 años. Valiente e inteligente                | Morado    |
| **Rosé**      | 10 años. Inteligente, valiente, nunca se rinde | Verde     |
| **PandaJuro** | Panda samurái. Furioso, leal y honorable       | Azul/Rojo |

## Pantallas implementadas

1. **Selección de personaje** - Elegir entre Lina, Rosé o PandaJuro con animaciones al seleccionar
2. **Pasillo** - Pasillo con 4 puertas, movimiento con flechas y modal de confirmación
3. **Habitación 1: El Laberinto** - Grid 15x13 donde el jugador busca una llave y vuelve a la salida

## Diseño de villanos

El juego es apto para niños desde 7 años. Los villanos deben seguir estas reglas:

- **Estilo visual**: cartoon/fantasía/aventura, sin sangre ni gore. Colores variados y estilizados
- **Descripciones**: tono de aventura, fantasía y misterio, divertido, nunca violento ni gráfico (nada de "asesino", "sangre", "muerte", "infierno")
- **Ataques**: nombres de magia/sombras/misterio/aventura en vez de violencia explícita (ej: "Hechizo sombrío" en vez de "Corte maldito")
- **Imagen**: generada con estilo semi-cartoon, apta para niños, circular para avatar de juego
- **Paleta CSS**: cada villano tiene su clase `.villano-nombre` con colores de borde, fondo, h3, avatar img, barra de vida y ataque-dano
- **Datos**: definidos en `js/enemigos.js` como instancias de `Enemigo(nombre, vidaMax, ataques[], descripcion)`
- **Imágenes**: van en `assets/img/enemigos/`

## Linting y formateo

El proyecto usa ESLint v9 (flat config), Prettier y Stylelint. Todas son devDependencies en `package.json`.

| Comando                | Qué hace                            |
| ---------------------- | ----------------------------------- |
| `npm run lint`         | Verificar calidad JS con ESLint     |
| `npm run lint:fix`     | Auto-corregir problemas JS          |
| `npm run lint:css`     | Verificar calidad CSS con Stylelint |
| `npm run lint:css:fix` | Auto-corregir problemas CSS         |
| `npm run format:check` | Verificar formateo con Prettier     |
| `npm run format`       | Auto-formatear JS, CSS, HTML y JSON |

**Orden recomendado para corregir todo:**

```bash
npm run lint:fix && npm run lint:css:fix && npm run format
```

Primero los linters (que pueden cambiar lógica como `let` → `const`), luego Prettier (que solo ajusta formato).

**Configuración:**

- `eslint.config.js` — reglas: `prefer-const`, `eqeqeq`, `no-var`, `no-console` (warn)
- `.prettierrc` — 4 espacios, single quotes, printWidth 100
- `.stylelintrc.json` — extiende `stylelint-config-standard`

## Entornos: desarrollo y producción

### Desarrollo (`npm run dev`)

BrowserSync sirve los archivos fuente directamente (hot-reload en http://localhost:3000). No hay build, se usan los ES modules originales:

- `index.html` carga `estilos.css` y `js/juego.js`
- Los 25+ módulos JS se cargan individualmente por el navegador
- Editar cualquier archivo recarga el navegador automáticamente

### Producción (`npm run build`)

esbuild genera la carpeta `dist/` con todo optimizado:

| Paso         | Entrada                           | Salida                                                             |
| ------------ | --------------------------------- | ------------------------------------------------------------------ |
| `build:js`   | `js/juego.js` + todos sus imports | `dist/juego.min.js` (~54 KB, 1 archivo)                            |
| `build:css`  | `estilos.css`                     | `dist/estilos.min.css` (~34 KB)                                    |
| `build:html` | `index.html`, `assets/`, `sw.js`  | `dist/index.html` (rutas reescritas), `dist/assets/`, `dist/sw.js` |

El script `scripts/build-html.js` reescribe las rutas en el HTML:

- `estilos.css` → `estilos.min.css`
- `js/juego.js` → `juego.min.js`

La carpeta `dist/` está en `.gitignore` — nunca se commitea.

### Deploy (GitHub Actions → GitHub Pages)

Archivo: `.github/workflows/deploy.yml`

```
Push a main → GitHub Actions ejecuta npm run build → dist/ se despliega a GitHub Pages
```

**Configuración requerida en GitHub**: Settings → Pages → Source: **GitHub Actions**

- **URL**: https://mglasner.github.io/mansion-de-aventuras/
- **Redirect**: `mglasner.github.io` redirige al juego (repo `mglasner.github.io` con meta refresh)
- **Repo público**: requerido por GitHub Pages en plan gratuito

### Service Worker (`sw.js`)

Estrategias diferenciadas de cache para segunda visita instantánea:

- **Assets estáticos** (JS, CSS, fuentes, imágenes): cache-first
- **HTML** (navegación): network-first con fallback a cache
- **`/api/**`\*\* (futuro backend): network-only, nunca cachear

Incrementar `CACHE_NAME` en `sw.js` para invalidar el cache en actualizaciones.

## Sprites del platformer (Habitación 4)

La Habitación 4 (El Abismo) es un platformer 2D en canvas 480×270. Los personajes usan sprite sheets PNG generados con IA, con fallback a sprites procedurales para personajes sin sheet.

### Archivos

- **Sprite sheets finales**: `assets/img/sprites-plat/{nombre}.png` — strip horizontal PNG con transparencia, frames de 32×40 px
- **Imágenes fuente (IA)**: `assets/img/generadas/spritesheet_{nombre}_vN.jpg` — no se commitean, solo para reprocesar
- **Scripts**: `scripts/procesar-sprites.cjs` (extrae frames) y `scripts/ensamblar-sprites.cjs` (ensambla strip final)

### Layouts de sprite sheet

Existen dos layouts según si el personaje tiene ataques:

**Layout 9 frames** (sin ataques): `[idle×2, run×4, jump, fall, hit]`

| Índice | Estado | Frames |
|--------|--------|--------|
| 0-1 | idle | 2 |
| 2-5 | correr | 4 |
| 6 | saltar | 1 |
| 7 | caer | 1 |
| 8 | golpeado | 1 |

**Layout 15 frames** (con ataques): `[idle×2, run×6, jump, fall, hit, atk1×2, atk2×2]`

| Índice | Estado | Frames |
|--------|--------|--------|
| 0-1 | idle | 2 |
| 2-7 | correr | 6 |
| 8 | saltar | 1 |
| 9 | caer | 1 |
| 10 | golpeado | 1 |
| 11-12 | ataque1 | 2 (wind-up + golpe) |
| 13-14 | ataque2 | 2 (wind-up + golpe) |

### Procedimiento para agregar un personaje nuevo

#### Paso 1: Generar sprite sheet con IA

Usar la tool `generate_image` con estos parámetros clave:

- **aspectRatio**: `3:2` (para 15 frames en 3×5) o `21:9` (para 9 frames en 2×5)
- **Fondo**: verde chroma key `#00ff00`
- **Estilo**: pixel art, chibi, 16-bit retro platformer

**Estructura del prompt (15 frames):**

```
Pixel art sprite sheet for a 2D platformer game. Character: [DESCRIPCIÓN FÍSICA
DEL PERSONAJE - antropomorfo/humano, ropa, colores, proporciones chibi, rasgos
distintivos].

Show exactly 15 frames arranged in 3 rows of 5 frames each, on a solid bright
green background (#00ff00 chroma key). Side view facing right.

Row 1: Frame 1 = idle standing still. Frame 2 = idle with slight breathing
movement. Frame 3 = running with LEFT LEG stepping forward and RIGHT ARM forward.
Frame 4 = running with both legs under body (passing position). Frame 5 = running
with RIGHT LEG stepping forward and LEFT ARM forward.

Row 2: Frame 6 = running with LEFT LEG far forward in a stride. Frame 7 = running
with RIGHT LEG far forward in a stride. Frame 8 = running with both legs under
body again. Frame 9 = jumping upward with both arms raised and legs tucked
together. Frame 10 = falling downward with arms and legs spread wide.

Row 3: Frame 11 = hurt/recoiling in pain. Frame 12 = [ATAQUE 1 WIND-UP]. Frame
13 = [ATAQUE 1 GOLPE]. Frame 14 = [ATAQUE 2 WIND-UP]. Frame 15 = [ATAQUE 2
GOLPE].

IMPORTANT: In the running frames, alternate which leg is in front - frames 3 and
6 show LEFT leg forward, frames 5 and 7 show RIGHT leg forward.

Clean pixel art style, 16-bit retro platformer aesthetic, crisp pixels, consistent
character across all frames.
```

**Lecciones aprendidas:**
- Ser EXPLÍCITO sobre alternancia de piernas izquierda/derecha en cada frame de carrera
- Para personajes animales, especificar "anthropomorphic, bipedal, walks on two legs like a human"
- Si la IA genera frames con la misma pierna siempre adelante, regenerar con prompt más explícito
- NO usar espejo horizontal para simular alternancia: voltea todo el cuerpo, no solo las piernas

#### Paso 2: Procesar — extraer frames individuales

1. Agregar entrada en `SHEETS` de `scripts/procesar-sprites.cjs`:
   ```js
   { input: 'spritesheet_{nombre}_vN.jpg', output: '{nombre}.png', name: 'Nombre' },
   ```
2. Ejecutar: `node scripts/procesar-sprites.cjs`
3. Inspeccionar frames ampliados (el script genera `{nombre}_frame{N}.png` y `{nombre}_frame{N}_4x.png`)
4. Verificar: alternancia de piernas en run, poses claras de jump/fall/hit/ataques

#### Paso 3: Mapear frames y ensamblar

1. Identificar visualmente qué frame detectado corresponde a cada estado de animación
2. Agregar mapeo en `PERSONAJES` de `scripts/ensamblar-sprites.cjs`:
   ```js
   nombre: {
       // idle(2) + run(6) + jump + fall + hit + atk1(2) + atk2(2) = 15
       frames: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15],
   },
   ```
   - Saltar frames de ruido (ej: frame de 1×3 px)
   - El script soporta `{ idx: N, flip: true }` para espejo horizontal (usar con cautela)
3. Ejecutar: `node scripts/ensamblar-sprites.cjs`
4. Verificar preview generado en `assets/img/sprites-plat/{nombre}_preview.png`

#### Paso 4: Registrar en el código

Agregar entrada en `SPRITE_SHEETS` de `js/habitaciones/habitacion4/spritesPlat.js`:
```js
const SPRITE_SHEETS = {
    nombre: { src: 'assets/img/sprites-plat/nombre.png', frames: 15 },
};
```

El valor de `frames` (9 o 15) determina qué layout usa el código automáticamente.

#### Paso 5: Limpiar temporales

```bash
rm assets/img/sprites-plat/*_frame*.png assets/img/sprites-plat/*_preview.png
rm assets/img/generadas/*_preview.png
```

### Integración en el juego

- `spritesPlat.js` carga el sheet por nombre del personaje (`jugadorRef.nombre`), con fallback procedural inmediato
- El sprite 32×40 se renderiza centrado sobre el hitbox de 12×14 (pies alineados abajo)
- Personajes sin sprite sheet usan sprites procedurales de 12×14 generados pixel a pixel
- Los frames de ataque (ataque1, ataque2) están almacenados pero aún no se usan en el gameplay

## Convenciones

- Archivos e IDs en español (ej: `estilos.css`, `#seleccion-personaje`, `#btn-jugar`)
- Comentarios en español
- Cada personaje tiene su clase CSS propia (`personaje-lina`, `personaje-rose`, `personaje-pandajuro`) con colores y animaciones individuales
- Imágenes de personajes van en `assets/img/personajes/`
- Código simple y comentado para fines educativos
- **Componentes**: Módulos JS que crean su propio HTML con DOM API, exportan una función `crear*(contenedor)` que retorna un objeto con métodos (mostrar, ocultar, actualizar, etc.)
- **Habitaciones**: Módulos autocontenidos que crean/destruyen su pantalla al entrar/salir. Se comunican con juego.js mediante callbacks y eventos custom (`document.dispatchEvent`)
- **Heroario ↔ Habitaciones**: El Heroario (`js/componentes/libroHeroes.js`) contiene descripciones de cada habitación en `HABITACIONES_HEROARIO`. Al modificar la mecánica o contenido de una habitación, verificar que las descripciones del Heroario sigan siendo consistentes
- **Revisión pre-commit**: Después de escribir o refactorizar código, ejecutar primero los linters (`npm run lint:fix && npm run lint:css:fix && npm run format`) y luego la skill `/review-code` antes de hacer commit
