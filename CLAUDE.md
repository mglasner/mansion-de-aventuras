# La Casa del Terror

Videojuego web creado como proyecto familiar para aprender HTML, CSS y JavaScript.

## Estructura del proyecto

```
la-casa-del-terror/
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
│   │   └── modalPuerta.js    # Modal de confirmación para entrar a habitaciones
│   └── habitaciones/         # Cada habitación crea su propia pantalla
│       └── habitacion1.js    # Habitación 1: El Laberinto (buscar la llave)
├── index.html                # Estructura de las pantallas del juego
├── estilos.css               # Estilos visuales y animaciones
└── CLAUDE.md
```

## Stack

- HTML, CSS y JavaScript puro (ES modules, sin frameworks ni bundlers)
- Servidor de desarrollo: `npx live-server`

## Personajes

| Nombre | Descripción | Paleta |
|--------|-------------|--------|
| **Lina** | 13 años. Valiente e inteligente | Morado |
| **Rosé** | 10 años. Inteligente, valiente, nunca se rinde | Verde |
| **PandaJuro** | Panda samurái. Furioso, leal y honorable | Azul/Rojo |

## Pantallas implementadas

1. **Selección de personaje** - Elegir entre Lina, Rosé o PandaJuro con animaciones al seleccionar
2. **Pasillo** - Pasillo con 4 puertas, movimiento con flechas y modal de confirmación
3. **Habitación 1: El Laberinto** - Grid 15x13 donde el jugador busca una llave y vuelve a la salida

## Convenciones

- Archivos e IDs en español (ej: `estilos.css`, `#seleccion-personaje`, `#btn-jugar`)
- Comentarios en español
- Cada personaje tiene su clase CSS propia (`personaje-lina`, `personaje-rose`, `personaje-pandajuro`) con colores y animaciones individuales
- Imágenes de personajes van en `assets/img/personajes/`
- Código simple y comentado para fines educativos
- **Componentes**: Módulos JS que crean su propio HTML con DOM API, exportan una función `crear*(contenedor)` que retorna un objeto con métodos (mostrar, ocultar, actualizar, etc.)
- **Habitaciones**: Módulos autocontenidos que crean/destruyen su pantalla al entrar/salir. Se comunican con juego.js mediante callbacks y eventos custom (`document.dispatchEvent`)
