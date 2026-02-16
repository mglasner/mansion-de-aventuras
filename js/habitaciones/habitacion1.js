// Habitación 1 — El Laberinto
// El jugador debe encontrar la llave y volver a la salida

// --- Constantes ---

const TAM_CELDA = 30;
const TAM_JUGADOR = 28;
const VELOCIDAD = 3;

// Grid del laberinto: 1 = pared, 0 = camino, 2 = llave, 3 = entrada/salida
// 15 filas x 13 columnas
const MAPA = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,2,1],
    [1,0,1,0,1,0,1,0,0,0,1,0,1],
    [1,0,1,0,0,0,1,1,1,0,1,0,1],
    [1,0,1,1,1,0,0,0,1,0,1,0,1],
    [1,0,0,0,1,1,1,0,1,0,0,0,1],
    [1,1,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,1,1,1,0,0,0,1],
    [1,0,1,1,1,0,0,0,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,0,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,1],
    [1,0,1,1,1,1,1,0,0,0,1,0,1],
    [1,3,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Posición de la llave y la entrada (en celdas)
const LLAVE_FILA = 1;
const LLAVE_COL = 11;
const ENTRADA_FILA = 13;
const ENTRADA_COL = 1;

// --- Estado del módulo ---

let jugador = null;
let callbackSalir = null;
let posX = 0;
let posY = 0;
let tieneLlave = false;
let animacionId = null;
let activo = false;
const teclas = {};

// Referencias a elementos del DOM (se crean dinámicamente)
let pantalla = null;
let contenedorLaberinto = null;
let elementoJugador = null;
let elementoLlave = null;
let indicador = null;
let mensajeExito = null;

// --- Crear pantalla HTML ---

function crearPantalla() {
    pantalla = document.createElement("div");
    pantalla.id = "pantalla-habitacion1";

    var titulo = document.createElement("h2");
    titulo.className = "titulo-habitacion";
    titulo.textContent = "Habitación 1 — El Laberinto";

    indicador = document.createElement("p");
    indicador.id = "laberinto-indicador";

    contenedorLaberinto = document.createElement("div");
    contenedorLaberinto.id = "laberinto";

    // Jugador dentro del laberinto
    elementoJugador = document.createElement("div");
    elementoJugador.className = "jugador-laberinto";
    var img = document.createElement("img");
    img.src = jugador.img;
    img.alt = jugador.nombre;
    elementoJugador.appendChild(img);
    elementoJugador.classList.add(jugador.clase);

    mensajeExito = document.createElement("p");
    mensajeExito.id = "laberinto-mensaje";
    mensajeExito.classList.add("oculto");

    var hint = document.createElement("p");
    hint.className = "laberinto-hint";
    hint.textContent = "Usa las flechas ← ↑ ↓ → para moverte";

    var btnHuir = document.createElement("button");
    btnHuir.id = "btn-huir";
    btnHuir.textContent = "← Huir al pasillo";
    btnHuir.addEventListener("click", function () {
        limpiarHabitacion1();
        callbackSalir();
    });

    pantalla.appendChild(titulo);
    pantalla.appendChild(indicador);
    pantalla.appendChild(contenedorLaberinto);
    pantalla.appendChild(mensajeExito);
    pantalla.appendChild(hint);
    pantalla.appendChild(btnHuir);

    document.getElementById("juego").appendChild(pantalla);
}

// --- Funciones principales ---

export function iniciarHabitacion1(jugadorRef, callback) {
    jugador = jugadorRef;
    callbackSalir = callback;
    tieneLlave = false;
    activo = true;

    // Crear e insertar la pantalla
    crearPantalla();

    // Renderizar el laberinto
    renderizarLaberinto();

    // Posicionar jugador en la entrada
    posX = ENTRADA_COL * TAM_CELDA + (TAM_CELDA - TAM_JUGADOR) / 2;
    posY = ENTRADA_FILA * TAM_CELDA + (TAM_CELDA - TAM_JUGADOR) / 2;
    actualizarPosicion();

    // Resetear indicador
    indicador.textContent = "🔑 Encuentra la llave";
    indicador.classList.remove("llave-obtenida");
    mensajeExito.classList.add("oculto");

    // Registrar controles
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    // Iniciar game loop
    animacionId = requestAnimationFrame(loopLaberinto);
}

function renderizarLaberinto() {
    for (var fila = 0; fila < MAPA.length; fila++) {
        for (var col = 0; col < MAPA[fila].length; col++) {
            if (MAPA[fila][col] === 1) {
                var pared = document.createElement("div");
                pared.className = "laberinto-pared";
                pared.style.left = col * TAM_CELDA + "px";
                pared.style.top = fila * TAM_CELDA + "px";
                pared.style.width = TAM_CELDA + "px";
                pared.style.height = TAM_CELDA + "px";
                contenedorLaberinto.appendChild(pared);
            }
        }
    }

    // Llave
    elementoLlave = document.createElement("div");
    elementoLlave.className = "laberinto-llave";
    elementoLlave.textContent = "🔑";
    elementoLlave.style.left = LLAVE_COL * TAM_CELDA + "px";
    elementoLlave.style.top = LLAVE_FILA * TAM_CELDA + "px";
    elementoLlave.style.width = TAM_CELDA + "px";
    elementoLlave.style.height = TAM_CELDA + "px";
    contenedorLaberinto.appendChild(elementoLlave);

    // Salida
    var salida = document.createElement("div");
    salida.className = "laberinto-salida";
    salida.textContent = "🚪";
    salida.style.left = ENTRADA_COL * TAM_CELDA + "px";
    salida.style.top = ENTRADA_FILA * TAM_CELDA + "px";
    salida.style.width = TAM_CELDA + "px";
    salida.style.height = TAM_CELDA + "px";
    contenedorLaberinto.appendChild(salida);

    // Jugador
    contenedorLaberinto.appendChild(elementoJugador);
}

// --- Movimiento con colisiones ---

function esPared(pixelX, pixelY) {
    var col = Math.floor(pixelX / TAM_CELDA);
    var fila = Math.floor(pixelY / TAM_CELDA);

    if (fila < 0 || fila >= MAPA.length || col < 0 || col >= MAPA[0].length) {
        return true;
    }
    return MAPA[fila][col] === 1;
}

function moverEnLaberinto(dx, dy) {
    var margen = 1;

    // Mover por eje X
    if (dx !== 0) {
        var nuevaX = posX + dx;
        var bloqueaX =
            esPared(nuevaX + margen, posY + margen) ||
            esPared(nuevaX + TAM_JUGADOR - margen, posY + margen) ||
            esPared(nuevaX + margen, posY + TAM_JUGADOR - margen) ||
            esPared(nuevaX + TAM_JUGADOR - margen, posY + TAM_JUGADOR - margen);

        if (!bloqueaX) {
            posX = nuevaX;
        }
    }

    // Mover por eje Y
    if (dy !== 0) {
        var nuevaY = posY + dy;
        var bloqueaY =
            esPared(posX + margen, nuevaY + margen) ||
            esPared(posX + TAM_JUGADOR - margen, nuevaY + margen) ||
            esPared(posX + margen, nuevaY + TAM_JUGADOR - margen) ||
            esPared(posX + TAM_JUGADOR - margen, nuevaY + TAM_JUGADOR - margen);

        if (!bloqueaY) {
            posY = nuevaY;
        }
    }

    actualizarPosicion();
}

function actualizarPosicion() {
    elementoJugador.style.left = posX + "px";
    elementoJugador.style.top = posY + "px";
}

// --- Detección de llave y salida ---

function getCeldaJugador() {
    var centroX = posX + TAM_JUGADOR / 2;
    var centroY = posY + TAM_JUGADOR / 2;
    return {
        fila: Math.floor(centroY / TAM_CELDA),
        col: Math.floor(centroX / TAM_CELDA),
    };
}

function detectarLlave() {
    if (tieneLlave) return;

    var celda = getCeldaJugador();
    if (celda.fila === LLAVE_FILA && celda.col === LLAVE_COL) {
        tieneLlave = true;

        // Animación de absorción
        elementoLlave.classList.add("llave-recogida");

        // Actualizar indicador
        indicador.textContent = "🔑 ¡Llave obtenida! Vuelve a la salida";
        indicador.classList.add("llave-obtenida");

        // Guardar en inventario y notificar a la barra superior
        jugador.inventario.push("llave-habitacion-2");
        document.dispatchEvent(new Event("inventario-cambio"));
    }
}

function detectarSalida() {
    if (!tieneLlave) return;

    var celda = getCeldaJugador();
    if (celda.fila === ENTRADA_FILA && celda.col === ENTRADA_COL) {
        activo = false;
        mensajeExito.textContent = "¡Escapaste con la llave!";
        mensajeExito.classList.remove("oculto");

        setTimeout(function () {
            limpiarHabitacion1();
            callbackSalir();
        }, 1500);
    }
}

// --- Game loop ---

function loopLaberinto() {
    if (!activo) return;

    var dx = 0;
    var dy = 0;

    if (teclas["ArrowUp"])    dy -= VELOCIDAD;
    if (teclas["ArrowDown"])  dy += VELOCIDAD;
    if (teclas["ArrowLeft"])  dx -= VELOCIDAD;
    if (teclas["ArrowRight"]) dx += VELOCIDAD;

    if (dx !== 0 || dy !== 0) {
        moverEnLaberinto(dx, dy);
    }

    detectarLlave();
    detectarSalida();

    animacionId = requestAnimationFrame(loopLaberinto);
}

// --- Handlers de teclado ---

function onKeyDown(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        teclas[e.key] = true;
    }
}

function onKeyUp(e) {
    delete teclas[e.key];
}

// --- Limpieza ---

function limpiarHabitacion1() {
    activo = false;

    if (animacionId) {
        cancelAnimationFrame(animacionId);
        animacionId = null;
    }

    // Remover handlers de teclado
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);

    // Limpiar teclas
    Object.keys(teclas).forEach(function (k) {
        delete teclas[k];
    });

    // Remover pantalla del DOM
    if (pantalla && pantalla.parentNode) {
        pantalla.parentNode.removeChild(pantalla);
        pantalla = null;
    }
}
