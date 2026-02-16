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

// Referencias a elementos del DOM
let pantalla = null;
let contenedorLaberinto = null;
let elementoJugador = null;
let elementoLlave = null;
let indicador = null;
let mensajeExito = null;

// --- Funciones principales ---

export function iniciarHabitacion1(jugadorRef, callback) {
    jugador = jugadorRef;
    callbackSalir = callback;
    tieneLlave = false;
    activo = true;

    // Mostrar pantalla del laberinto
    pantalla = document.getElementById("pantalla-habitacion1");
    pantalla.classList.remove("oculto");

    contenedorLaberinto = document.getElementById("laberinto");
    elementoJugador = document.getElementById("jugador-laberinto");
    indicador = document.getElementById("laberinto-indicador");
    mensajeExito = document.getElementById("laberinto-mensaje");

    // Configurar imagen del jugador
    var imgJugador = elementoJugador.querySelector("img");
    imgJugador.src = jugador.img;
    imgJugador.alt = jugador.nombre;

    // Aplicar clase de color del personaje
    elementoJugador.className = "jugador-laberinto";
    elementoJugador.classList.add(jugador.clase);

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
    // Limpiar contenido anterior (método seguro sin innerHTML)
    contenedorLaberinto.replaceChildren();

    for (var fila = 0; fila < MAPA.length; fila++) {
        for (var col = 0; col < MAPA[fila].length; col++) {
            if (MAPA[fila][col] === 1) {
                // Pared
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

    // Crear elemento de la llave
    elementoLlave = document.createElement("div");
    elementoLlave.className = "laberinto-llave";
    elementoLlave.textContent = "🔑";
    elementoLlave.style.left = LLAVE_COL * TAM_CELDA + "px";
    elementoLlave.style.top = LLAVE_FILA * TAM_CELDA + "px";
    elementoLlave.style.width = TAM_CELDA + "px";
    elementoLlave.style.height = TAM_CELDA + "px";
    contenedorLaberinto.appendChild(elementoLlave);

    // Marcar la salida
    var salida = document.createElement("div");
    salida.className = "laberinto-salida";
    salida.textContent = "🚪";
    salida.style.left = ENTRADA_COL * TAM_CELDA + "px";
    salida.style.top = ENTRADA_FILA * TAM_CELDA + "px";
    salida.style.width = TAM_CELDA + "px";
    salida.style.height = TAM_CELDA + "px";
    contenedorLaberinto.appendChild(salida);

    // Agregar el jugador al laberinto
    contenedorLaberinto.appendChild(elementoJugador);
}

// --- Movimiento con colisiones ---

function esPared(pixelX, pixelY) {
    var col = Math.floor(pixelX / TAM_CELDA);
    var fila = Math.floor(pixelY / TAM_CELDA);

    // Fuera del mapa = pared
    if (fila < 0 || fila >= MAPA.length || col < 0 || col >= MAPA[0].length) {
        return true;
    }
    return MAPA[fila][col] === 1;
}

function moverEnLaberinto(dx, dy) {
    // Margen para evitar quedar pegado a las paredes
    var margen = 1;

    // Mover por eje X
    if (dx !== 0) {
        var nuevaX = posX + dx;
        // Verificar las 4 esquinas del jugador
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
    // Centro del jugador
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

        // Guardar en inventario del jugador
        jugador.inventario.push("llave-habitacion-2");
    }
}

function detectarSalida() {
    if (!tieneLlave) return;

    var celda = getCeldaJugador();
    if (celda.fila === ENTRADA_FILA && celda.col === ENTRADA_COL) {
        // Mostrar mensaje de éxito
        activo = false;
        mensajeExito.textContent = "¡Escapaste con la llave!";
        mensajeExito.classList.remove("oculto");

        // Volver al pasillo tras 1.5s
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

// --- Huir al pasillo ---

export function huirAlPasillo() {
    limpiarHabitacion1();
    callbackSalir();
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

    // Ocultar pantalla
    pantalla.classList.add("oculto");
}
