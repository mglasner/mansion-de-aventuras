# Plan: El Ajedrez — 5to juego de la Biblioteca de Aventuras

## Resumen

Nuevo juego de ajedrez completo donde el equipo rival está formado por los
villanos del juego y el personaje seleccionado ocupa el rol central (Rey o
Reina según género). El jugador elige héroe desde el Libro de Juegos (modal
de selección existente) y entra al tablero.

---

## 1. Nuevos villanos pesadilla

Crear dos villanos nuevos para los roles de Rey y Reina del equipo enemigo.

### 1.1 El Monstruo Comelón (Rey enemigo)

| Stat | Valor |
|------|-------|
| Tier | pesadilla |
| Vida | 240 |
| Edad | 5.000.000 |
| Estatura | 99.999,9 m |
| Velocidad | 3 |
| Vel. Ataque | 4 |

**Ataques:**

- Bocado estelar (24 dmg) — Mordisco cósmico que hace temblar el espacio
- Gran Mascada (30 dmg) — Abre sus fauces y tritura todo a su paso

**Descripción:**

> El Monstruo Comelón es la criatura más grande y hambrienta que jamás ha flotado
> por el espacio. Su boca es tan descomunal que podría tragarse la Luna de un solo
> mordisco... y repetir con la Tierra de postre. Lleva eones vagando entre las
> estrellas, devorando todo lo que encuentra: planetas, asteroides, cometas e
> incluso alguna que otra estrella despistada. Los científicos del universo lo
> llaman "Evento Gastronómico de Nivel Cósmico". Él se llama a sí mismo "un
> poquito antojadizo".
>
> Lo curioso es que El Comelón no es malvado... solo tiene un hambre infinita y
> cero autocontrol. Cuando La Nebulosa le señala un nuevo mundo, sus ojitos
> brillan como supernovas y empieza a salivar asteroides. Su estómago retumba con
> tal fuerza que los planetas cercanos tiemblan en sus órbitas. Dicen que en algún
> lugar de su panza gigante hay un planeta entero que se salvó porque El Comelón
> se distrajo con otro más sabroso.

### 1.2 La Nebulosa (Reina enemiga)

| Stat | Valor |
|------|-------|
| Tier | pesadilla |
| Vida | 230 |
| Edad | 3.000.000 |
| Estatura | 500,0 m |
| Velocidad | 5 |
| Vel. Ataque | 5 |

**Ataques:**

- Niebla cósmica (20 dmg) — Envuelve al rival en oscuridad helada
- Vórtice de sombra (26 dmg) — Remolino de sombras que arrastra todo

**Descripción:**

> La Nebulosa es una nube viviente de gas y polvo estelar que flota por el cosmos
> con una curiosidad insaciable. Sus ojos — dos luces brillantes que parpadean
> entre la bruma — son lo único constante en su forma siempre cambiante: a veces
> parece un remolino de colores, otras veces una cortina de humo con garras, y
> cuando está contenta se expande hasta cubrir lunas enteras.
>
> Es la compañera perfecta del Monstruo Comelón: mientras él devora, ella prepara
> el terreno envolviendo planetas en una oscuridad tan espesa que nadie ve venir
> lo que se acerca. Lo hace por diversión, no por maldad: para La Nebulosa,
> envolver un mundo en sombras es como jugar a las escondidas a escala cósmica.
> Su risa es un eco lejano que resuena entre las estrellas, y cuando se aburre,
> crea vórtices de sombra solo para ver cómo giran.

### 1.3 Pasos de creación (skill crear-personaje)

Para cada villano, seguir el flujo estándar:

1. Generar avatar con `mcp__image-gen__generate_image` (1:1, semi-cartoon)
2. Convertir a webp: `npx cwebp-bin -q 80 <png> -o assets/img/enemigos/<nombre>.webp`
3. Agregar entrada en `datos/enemigos.yaml`
4. Agregar paleta CSS en `css/libros/entidades.css` (sección de villanos)
5. Ejecutar `node scripts/build-datos.js`
6. Verificar con `npm run lint`

**Paletas sugeridas (no repetir existentes):**

| Villano | Color propuesto | Descripción |
|---------|----------------|-------------|
| El Monstruo Comelón | `#f0a030` | naranja/dorado cósmico |
| La Nebulosa | `#7b68ee` | azul-violeta nebuloso |

---

## 2. Motor de ajedrez

### 2.1 Librería elegida: js-chess-engine

| Aspecto | Detalle |
|---------|---------|
| Repo | [github.com/josefjadrny/js-chess-engine](https://github.com/josefjadrny/js-chess-engine) |
| Licencia | MIT |
| Tamaño | ~pocos KB |
| Dependencias | Zero |
| Incluye | Validación de movimientos + IA con 5 niveles |

**Instalación:**

```bash
npm install js-chess-engine
```

Se importa como ES module y esbuild lo incluirá en el bundle de producción.

### 2.2 Niveles de dificultad

| Etiqueta en juego | Nivel engine | Comportamiento |
|-------------------|-------------|----------------|
| Fácil | 1 | Comete errores obvios, ideal para principiantes |
| Normal | 2 | Juega como un principiante casual |
| Difícil | 3 | Reto real, requiere pensar |

Se presenta un selector de dificultad al entrar al juego, antes de que empiece
la partida.

### 2.3 API principal

```javascript
import { Game } from 'js-chess-engine';

const game = new Game();
game.move('E2', 'E4');           // jugador mueve
const aiMove = game.aiMove(2);   // IA juega (nivel 2)
game.exportJson();               // estado actual del tablero
```

---

## 3. Campo `genero` en personajes y enemigos

Agregar el campo `genero` (`masculino` / `femenino`) a **todos** los personajes
y enemigos en sus respectivos YAML. Esto se usa para asignar roles de Rey/Reina
en el ajedrez, y queda disponible para futuros usos.

### 3.1 datos/personajes.yaml — agregar `genero`

| Personaje | Género |
|-----------|--------|
| Lina | femenino |
| Rosé | femenino |
| Hana | femenino |
| DonBu | masculino |
| Kira | femenino |
| PandaJuro | masculino |
| PomPom | femenino |
| Orejas | masculino |

### 3.2 datos/enemigos.yaml — agregar `genero`

| Enemigo | Tier | Género |
|---------|------|--------|
| Trasgo | esbirro | masculino |
| Topete | esbirro | femenino |
| Pototo | esbirro | femenino |
| Siniestra | elite | femenino |
| El Errante | elite | masculino |
| El Profano | elite | masculino |
| La Grotesca | pesadilla | femenino |
| El Disonante | pesadilla | masculino |
| El Monstruo Comelón | pesadilla | masculino |
| La Nebulosa | pesadilla | femenino |

### 3.3 Actualizar build-datos.js

Agregar `'genero'` a `CAMPOS_PERSONAJE` y `CAMPOS_ENEMIGO` para que el build
valide que el campo exista en todas las entradas.

---

## 4. Mapeo de piezas — selección aleatoria por tier

Cada partida arma un tablero enemigo distinto eligiendo villanos al azar
según su tier. Esto le da rejugabilidad: nunca sabes a quién te enfrentarás.

### 4.1 Equipo enemigo (piezas negras) — aleatorio por tier

| Pieza | Tier requerido | Criterio |
|-------|---------------|----------|
| **Peones** (×8) | esbirro | 1 esbirro al azar, mismo para los 8 peones |
| **Torres** (×2) | elite | 1 elite al azar (mismo para ambas torres) |
| **Caballos** (×2) | elite | 1 elite al azar, distinto al de torres |
| **Alfiles** (×2) | elite | 1 elite al azar, distinto a torres y caballos |
| **Rey** | pesadilla | 1 pesadilla masculino al azar |
| **Reina** | pesadilla | 1 pesadilla femenino al azar |

**Reglas:**

- Cada rol de pieza usa el **mismo** villano para todas las instancias de esa
  pieza (ej: las 2 torres son el mismo villano, los 8 peones son el mismo)
- Torres, caballos y alfiles deben ser **villanos distintos** entre sí (se
  barajan los elite disponibles y se asignan 3 roles)
- Si hay menos elite disponibles que roles (actualmente hay 3, justo), se usan
  todos. Si hubiera más, se eligen 3 al azar
- Rey siempre masculino, Reina siempre femenina (filtrado por `genero`)
- Cada pieza usa el **avatar webp** del villano como imagen

**Ejemplo de un posible tablero:**

| Pieza | Villano elegido |
|-------|----------------|
| Peones | Pototo |
| Torres | El Errante |
| Caballos | Siniestra |
| Alfiles | El Profano |
| Rey | El Monstruo Comelón |
| Reina | La Grotesca |

**Otro posible tablero (siguiente partida):**

| Pieza | Villano elegido |
|-------|----------------|
| Peones | Trasgo |
| Torres | Siniestra |
| Caballos | El Profano |
| Alfiles | El Errante |
| Rey | El Disonante |
| Reina | La Nebulosa |

### 4.2 Pseudocódigo de piezas.js

```javascript
import { ENEMIGOS } from '../../enemigos.js';

function barajar(arr) {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

export function generarEquipoEnemigo() {
    const esbirros = ENEMIGOS.filter(e => e.tier === 'esbirro');
    const elites = ENEMIGOS.filter(e => e.tier === 'elite');
    const pesadillasM = ENEMIGOS.filter(e => e.tier === 'pesadilla' && e.genero === 'masculino');
    const pesadillasF = ENEMIGOS.filter(e => e.tier === 'pesadilla' && e.genero === 'femenino');

    // Peones: 1 esbirro al azar
    const peon = barajar(esbirros)[0];

    // Torres, caballos, alfiles: 3 elite distintos al azar
    const [torre, caballo, alfil] = barajar(elites);

    // Rey y Reina: pesadilla por género
    const rey = barajar(pesadillasM)[0];
    const reina = barajar(pesadillasF)[0];

    return { peon, torre, caballo, alfil, rey, reina };
}
```

### 4.3 Equipo del jugador (piezas blancas)

| Pieza | Imagen |
|-------|--------|
| Rey/Reina (según género) | Avatar del personaje seleccionado |
| Resto de piezas | Diseño clásico de ajedrez (iconos/SVG) |

**Lógica de asignación (usa campo `genero` del personaje):**

- Personajes con `genero: femenino` → ocupan el rol de **Reina**
- Personajes con `genero: masculino` → ocupan el rol de **Rey**
- La pieza complementaria (Rey si jugador es Reina, y viceversa) usa diseño clásico

---

## 4. Diseño de UI

### 4.1 Enfoque: DOM con CSS Grid

El tablero se renderiza como una grilla CSS 8x8 de `<div>`, consistente con el
patrón del memorice. Las piezas son `<img>` dentro de cada celda.

**Razones:**

- Un tablero de ajedrez es una grilla estática — no necesita canvas
- CSS Grid resuelve el layout naturalmente
- Permite hover, selección, drag-and-drop con CSS y eventos DOM
- Consistente con la arquitectura del proyecto (componentes DOM)

### 4.2 Layout de pantalla

```text
┌──────────────────────────────────────────┐
│ [Huir]    El Ajedrez                     │
├──────────────────────────────────────────┤
│                                          │
│    Turno: Jugador  |  Dificultad: Normal │
│                                          │
│   ┌──┬──┬──┬──┬──┬──┬──┬──┐             │
│   │♜ │♞ │♝ │♛ │♚ │♝ │♞ │♜ │  8         │
│   ├──┼──┼──┼──┼──┼──┼──┼──┤             │
│   │♟ │♟ │♟ │♟ │♟ │♟ │♟ │♟ │  7         │
│   ├──┼──┼──┼──┼──┼──┼──┼──┤             │
│   │  │  │  │  │  │  │  │  │  6          │
│   ├──┼──┼──┼──┼──┼──┼──┼──┤             │
│   │  │  │  │  │  │  │  │  │  5          │
│   ├──┼──┼──┼──┼──┼──┼──┼──┤             │
│   │  │  │  │  │  │  │  │  │  4          │
│   ├──┼──┼──┼──┼──┼──┼──┼──┤             │
│   │  │  │  │  │  │  │  │  │  3          │
│   ├──┼──┼──┼──┼──┼──┼──┼──┤             │
│   │♙ │♙ │♙ │♙ │♙ │♙ │♙ │♙ │  2         │
│   ├──┼──┼──┼──┼──┼──┼──┼──┤             │
│   │♖ │♘ │♗ │♕ │♔ │♗ │♘ │♖ │  1         │
│   └──┴──┴──┴──┴──┴──┴──┴──┘             │
│    a   b   c   d   e   f   g   h        │
│                                          │
│  Piezas capturadas: ♟♟♞                  │
│                                          │
└──────────────────────────────────────────┘
```

### 4.3 Interacción

1. Jugador hace clic en una pieza propia → se resalta y se muestran movimientos
   válidos (celdas con borde/color)
2. Clic en celda válida → mueve la pieza, animación CSS de traslado
3. Turno de la IA → breve pausa (~500ms), luego la IA mueve con animación
4. Indicadores visuales para: jaque (rey parpadea), último movimiento (celdas
   marcadas), piezas capturadas

**Flag `bloqueado`:** Un único flag booleano a nivel de módulo que deshabilita
toda interacción del usuario (clics, hover) durante el turno de la IA y durante
animaciones de movimiento. Previene doble jugada y clicks accidentales.

### 4.4 Responsividad

- Desktop: tablero centrado con tamaño fijo (~480px)
- Mobile: tablero ocupa el ancho disponible, celdas se escalan proporcionalmente
- Touch: tap para seleccionar/mover (no drag-and-drop en mobile)
- Zona táctil: celdas de mínimo 48px en mobile (recomendación Material Design)

---

## 5. Mecánicas de juego

### 5.1 Reglas

Ajedrez completo estándar:

- Todos los movimientos legales (incluido enroque, captura al paso, promoción)
- Jaque, jaque mate y tablas (ahogado, repetición, 50 movimientos)
- El jugador siempre juega con blancas (mueve primero)

### 5.2 Promoción de peón

Cuando un peón del jugador llega a la fila 8, se muestra un modal para elegir
la pieza de promoción (Reina, Torre, Alfil, Caballo). La IA siempre promociona
a Reina.

### 5.3 Condiciones de victoria/derrota

| Resultado | Condición | Acción |
|-----------|-----------|--------|
| Victoria | Jaque mate al rey enemigo (Comelón) | Toast de victoria + volver al Libro de Juegos |
| Derrota | Jaque mate al jugador | Toast de derrota + volver al Libro de Juegos |
| Tablas | Ahogado, repetición, 50 mov, material insuficiente | Modal informativo + volver al Libro de Juegos |

> **Nota:** El sistema de inventario/llaves está neutralizado (`ITEMS_INFO = {}`,
> `TOTAL_SLOTS = 0`). No se otorga llave al ganar. Los juegos son independientes,
> sin progresión secuencial. La victoria simplemente usa el callback para volver
> al Libro de Juegos.

### 5.4 Flujo de victoria

```javascript
// Al ganar:
lanzarToast(CFG.textos.toastVictoria, '♟', 'item');
setTimeout(() => { limpiarAjedrez(); callbackSalir(); }, CFG.meta.tiempoVictoria);
```

---

## 6. Arquitectura de archivos

### 6.1 Archivos nuevos

```text
js/juegos/ajedrez/
├── index.js          # Punto de entrada: iniciarAjedrez / limpiarAjedrez
├── config.js         # ⚙️ Generado desde datos/ajedrez.yaml
├── tablero.js        # Renderizado del tablero DOM, manejo de clics, animaciones
├── motor.js          # Wrapper sobre js-chess-engine: turnos, IA, estado
└── piezas.js         # Lee CFG.piezas.enemigo, resuelve villanos desde enemigos.js

datos/ajedrez.yaml                   # Configuración del juego
assets/img/juegos/ajedrez.webp       # Ilustración para el Libro de Juegos
assets/img/enemigos/comelon.webp     # Avatar del Monstruo Comelón
assets/img/enemigos/nebulosa.webp    # Avatar de La Nebulosa
css/juegos/ajedrez.css               # Estilos específicos del ajedrez
```

### 6.2 Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `datos/personajes.yaml` | Agregar campo `genero` a todos los personajes |
| `datos/enemigos.yaml` | Agregar campo `genero` a todos + 2 villanos nuevos |
| `scripts/build-datos.js` | `genero` en schemas + `{ slug: 'ajedrez', schema: SCHEMA_AJEDREZ }` |
| `js/juego.js` | Import `iniciarAjedrez`/`limpiarAjedrez` + entrada en `juegos{}` |
| `js/componentes/libroJuegos.js` | Agregar entrada `ajedrez` en `JUEGOS` |
| `css/libros/entidades.css` | Paletas de los 2 villanos nuevos |
| `css/juegos/comun.css` | Paleta `.juego-ajedrez` (variables CSS) |
| `estilos.css` | Agregar `@import url('css/juegos/ajedrez.css')` |

### 6.3 Estructura de módulos

```text
index.js
  ├── importa config.js (CFG)
  ├── importa motor.js (lógica de juego)
  ├── importa tablero.js (UI del tablero)
  ├── importa piezas.js (mapeo de piezas)
  ├── importa pantallaJuego.js (componente compartido)
  ├── importa toast.js (notificaciones)
  └── importa eventos.js (comunicación con juego.js)

motor.js
  └── importa js-chess-engine (Game)

tablero.js
  └── importa piezas.js (para renderizar imágenes)
```

### 6.4 Patrón de entry point (siguiendo memorice/abismo)

```javascript
// js/juegos/ajedrez/index.js
import { CFG } from './config.js';
import { crearPantallaJuego } from '../../componentes/pantallaJuego.js';
import { lanzarToast } from '../../componentes/toast.js';

let jugador = null;
let callbackSalir = null;

export function iniciarAjedrez(jugadorRef, callback, dpadRef) {
    jugador = jugadorRef;
    callbackSalir = callback;

    // Ocultar D-pad (no se usa en ajedrez)
    if (dpadRef) dpadRef.ocultar();

    const { pantalla } = crearPantallaJuego(
        'pantalla-ajedrez',
        'juego-ajedrez',
        CFG.meta.titulo,
        huir
    );

    // ... crear tablero, motor, etc.
    document.getElementById('juego').appendChild(pantalla);
}

export function limpiarAjedrez() {
    // Remover DOM, limpiar event listeners, nullificar estado
}
```

---

## 7. Configuración YAML

```yaml
# datos/ajedrez.yaml — El Ajedrez
meta:
    titulo: "El Ajedrez"
    tiempoVictoria: 2500

# El equipo enemigo se arma aleatoriamente por tier en runtime (ver piezas.js).
# No se configura aquí — se lee directamente de ENEMIGOS filtrado por tier/genero.

dificultad:
    opciones:
        - nombre: Fácil
          nivel: 1
        - nombre: Normal
          nivel: 2
        - nombre: Difícil
          nivel: 3
    default: 1                    # índice (Normal)

ia:
    retardoMovimiento: 500        # ms de pausa antes de que la IA mueva
    retardoJaque: 300             # ms de flash en jaque

tablero:
    tamCelda: 60                  # px por celda (desktop)
    tamCeldaMobile: 48            # px por celda (mobile, mínimo recomendado)

textos:
    turnoJugador: "Tu turno"
    turnoIA: "Turno del rival..."
    toastJaque: "¡Jaque!"
    toastMate: "¡Jaque mate!"
    toastTablas: "Tablas"
    toastVictoria: "¡Has derrotado al ejército de villanos!"
    toastDerrota: "El Monstruo Comelón ha ganado..."
    promocion: "Elige una pieza"

curacion:
    victoriaMin: 10
    victoriaMax: 15
```

**Cómo funciona el equipo enemigo en runtime:**

El módulo `piezas.js` importa `ENEMIGOS` desde `js/enemigos.js` y arma el
equipo al azar por tier (ver sección 4). Cada partida llama a
`generarEquipoEnemigo()` que devuelve un objeto con el villano asignado a
cada rol. Para agregar más variedad basta con crear nuevos villanos en
`datos/enemigos.yaml` con el tier y género apropiados.

---

## 8. Integración con el Libro de Juegos

### 8.1 Entrada en JUEGOS (libroJuegos.js)

Agregar la 5ta entrada en el objeto `JUEGOS` de `js/componentes/libroJuegos.js`:

```javascript
ajedrez: {
    nombre: 'El Ajedrez',
    img: 'assets/img/juegos/ajedrez.webp',
    accent: '#f0a030',
    parrafos: [
        '¡Un tablero de ajedrez mágico donde los villanos cobran vida como piezas! El Monstruo Comelón lidera el ejército oscuro como Rey, mientras La Nebulosa maniobra como Reina.',
        'Mueve tus piezas con estrategia para dar jaque mate. Cada pieza enemiga es un villano con su propio avatar.',
        'Elige tu nivel de dificultad y demuestra que tu mente es más poderosa que cualquier ejército.',
    ],
    tip: 'Piensa antes de mover. Protege a tu rey y busca debilidades en el rival.',
},
```

El `adaptarJuegos()` existente convertirá esto automáticamente al formato de
`crearLibro()`, con `juegoId: 'ajedrez'` y `clase: 'juego-ajedrez'`.

La selección de héroe ocurre en el modal existente (`crearModalHeroe()`). No
hay cambios en ese flujo.

### 8.2 Registro en juego.js

```javascript
// Import nuevo
import { iniciarAjedrez, limpiarAjedrez } from './juegos/ajedrez/index.js';

// Agregar al objeto juegos
const juegos = {
    laberinto: { iniciar: iniciarLaberinto, limpiar: limpiarLaberinto },
    laberinto3d: { iniciar: iniciarLaberinto3d, limpiar: limpiarLaberinto3d },
    memorice: { iniciar: iniciarMemorice, limpiar: limpiarMemorice },
    abismo: { iniciar: iniciarAbismo, limpiar: limpiarAbismo },
    ajedrez: { iniciar: iniciarAjedrez, limpiar: limpiarAjedrez },
};
```

---

## 9. CSS del juego

### 9.1 Paleta en css/juegos/comun.css

```css
.juego-ajedrez {
    --juego-pared: #3e2e0a;
    --juego-pared-medio: #2e1e08;
    --juego-pared-oscuro: #1e1005;
    --juego-borde: rgb(240 160 48 / 20%);
    --juego-accent: #f0a030;
}
```

### 9.2 Archivo css/juegos/ajedrez.css

Estilos específicos del tablero, celdas, piezas, indicadores y animaciones.
Se importa desde `estilos.css` con `@import url('css/juegos/ajedrez.css')`.

### 9.3 Import en estilos.css

Agregar después de `css/juegos/abismo.css`:

```css
@import url('css/juegos/ajedrez.css');
```

---

## 10. build-datos.js

Agregar schema y entrada en la tabla de juegos:

```javascript
const SCHEMA_AJEDREZ = {
    meta: ['titulo', 'tiempoVictoria'],
    dificultad: ['default'],
    ia: ['retardoMovimiento', 'retardoJaque'],
    tablero: ['tamCelda', 'tamCeldaMobile'],
    textos: ['turnoJugador', 'turnoIA', 'toastJaque', 'toastMate',
             'toastTablas', 'toastVictoria', 'toastDerrota', 'promocion'],
    curacion: ['victoriaMin', 'victoriaMax'],
};

const JUEGOS = [
    { slug: 'laberinto', schema: SCHEMA_LABERINTO },
    { slug: 'laberinto3d', schema: SCHEMA_LABERINTO3D },
    { slug: 'memorice', schema: SCHEMA_MEMORICE },
    { slug: 'abismo', schema: SCHEMA_ABISMO },
    { slug: 'ajedrez', schema: SCHEMA_AJEDREZ },
];
```

---

## 11. Fases de implementación

### Fase 1: Campo `genero` + villanos nuevos

- [ ] Agregar `genero` a todos los personajes en `datos/personajes.yaml`
- [ ] Agregar `genero` a todos los enemigos en `datos/enemigos.yaml`
- [ ] Agregar `'genero'` a `CAMPOS_PERSONAJE` y `CAMPOS_ENEMIGO` en `build-datos.js`
- [ ] Generar avatares (El Monstruo Comelón + La Nebulosa) con skill `/crear-personaje`
- [ ] Agregar datos de ambos villanos nuevos a `datos/enemigos.yaml`
- [ ] Agregar paletas CSS en `css/libros/entidades.css`
- [ ] Ejecutar build-datos + lint

### Fase 2: Infraestructura del juego

- [ ] Crear `datos/ajedrez.yaml`
- [ ] Agregar schema `SCHEMA_AJEDREZ` + entrada en `JUEGOS` de `build-datos.js`
- [ ] Crear directorio `js/juegos/ajedrez/` con `index.js` (esqueleto)
- [ ] Registrar juego en `js/juego.js` (import + entrada en `juegos{}`)
- [ ] Agregar entrada `ajedrez` en `JUEGOS` de `js/componentes/libroJuegos.js`
- [ ] Crear `css/juegos/ajedrez.css` e importar desde `estilos.css`
- [ ] Agregar paleta `.juego-ajedrez` en `css/juegos/comun.css`
- [ ] Generar ilustración `assets/img/juegos/ajedrez.webp`

### Fase 3: Motor de ajedrez

- [ ] Instalar `js-chess-engine` (`npm install js-chess-engine`)
- [ ] Crear `motor.js` — wrapper con manejo de turnos, IA, y estado
- [ ] Implementar selector de dificultad
- [ ] Conectar victoria/derrota con callback de salida

### Fase 4: Tablero y UI

- [ ] Crear `tablero.js` — grilla CSS 8x8, renderizado de piezas
- [ ] Crear `piezas.js` — selección aleatoria por tier/género desde ENEMIGOS
- [ ] Implementar selección de pieza + movimientos válidos resaltados
- [ ] Animaciones de movimiento (CSS transitions)
- [ ] Indicadores de jaque, último movimiento
- [ ] Panel de piezas capturadas
- [ ] Modal de promoción de peón

### Fase 5: Integración y pulido

- [ ] Conectar turno del jugador → motor → turno IA → tablero
- [ ] Implementar flujo completo: selección héroe → selector dificultad → partida → resultado
- [ ] Responsividad mobile
- [ ] Linting + review (`npm run lint:fix && npm run lint:css:fix && npm run format`)

---

## 12. Decisiones pendientes

| # | Decisión | Opciones |
|---|----------|----------|
| 1 | Sonidos/música | ¿Agregar efectos de sonido al mover piezas? |
| 2 | Piezas clásicas del jugador | Iconos SVG, Unicode chess symbols, o sprites propios |

---

## Apéndice: Cambios respecto al plan original

Este plan fue actualizado para reflejar la transformación de "La Mansión de
Aventuras" a "Biblioteca de Aventuras" (febrero 2026). Cambios principales:

| Aspecto | Plan original | Plan actualizado |
|---------|---------------|------------------|
| Nombre del juego | Habitación 5 | El Ajedrez (slug `ajedrez`) |
| Directorio | `js/habitaciones/habitacion5/` | `js/juegos/ajedrez/` |
| YAML | `datos/habitacion5.yaml` | `datos/ajedrez.yaml` |
| Registro | `registrarHabitacion('5', ...)` | Entrada en `juegos{}` de `juego.js` |
| Navegación | 5ta puerta en el pasillo | Entrada en `JUEGOS` de `libroJuegos.js` |
| Inventario/llaves | Llave + slot 5 | Eliminado (inventario neutralizado) |
| Victoria | Llave + toast + volver al pasillo | Toast + callback al Libro de Juegos |
| CSS de villanos | En `estilos.css` monolítico | En `css/libros/entidades.css` |
| CSS del juego | Sección en `estilos.css` | `css/juegos/ajedrez.css` + paleta en `comun.css` |
| Heroario | Agregar descripción en libroHeroes.js | No necesario (ya no hay sección de juegos ahí) |
| Entry point | `pantallaHabitacion.js` | `pantallaJuego.js` |
| Equipo enemigo | Fijo en YAML (`piezas.enemigo`) | Aleatorio por tier/género en runtime |
| Campo `genero` | No existía | Agregado a todos los personajes y enemigos |
| Decisiones eliminadas | Ubicación puerta, nombre llave, función narrativa llave | Ya no aplican |
