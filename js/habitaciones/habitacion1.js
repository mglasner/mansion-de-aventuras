// Habitación 1 — El Laberinto
// El jugador debe encontrar la llave y volver a la salida
// El laberinto se genera aleatoriamente cada vez

import { ENEMIGOS } from "../enemigos.js";
import { mezclar, generarMapa, encontrarPuntoLejano } from "../laberinto.js";

// --- Constantes ---

const TAM_CELDA = 30;
const TAM_JUGADOR = 22;
const VELOCIDAD = 3;
const MARGEN_COLISION = 2;
const TOLERANCIA_ESQUINA = 8;

// Dimensiones del laberinto (deben ser impares para el algoritmo de generación)
const FILAS = 17;
const COLS = 17;
const ATAJOS = 8; // Paredes extra que se abren para crear caminos alternativos
const COOLDOWN_TRAMPA = 1000; // ms entre golpes de la misma trampa
const COOLDOWN_TRAMPA_LENTA = 500; // ms antes de poder reactiletla trampa de lentitud

// Trasgo
const TAM_TRASGO = 20;
const VELOCIDAD_TRASGO = 2;
const COOLDOWN_TRASGO = 1500; // ms entre ataques del Trasgo
const INTERVALO_PATHFINDING = 500; // ms entre recálculos de ruta

// --- Trampas ---

// Coloca entre 3 y 5 trampas en celdas lógicas lejos de la entrada y la llave
function colocarTrampas() {
    let numTrampas = 3 + Math.floor(Math.random() * 3); // 3-5
    let celdasLibres = [];

    for (let f = 1; f < FILAS - 1; f++) {
        for (let c = 1; c < COLS - 1; c++) {
            if (mapa[f][c] !== 0) continue;
            if (f === entradaFila && c === entradaCol) continue;
            if (f === llaveFila && c === llaveCol) continue;
            // Evitar celdas muy cerca de la entrada
            if (Math.abs(f - entradaFila) + Math.abs(c - entradaCol) <= 3) continue;
            // Solo en celdas lógicas (intersecciones, más visibles)
            if (f % 2 !== 1 || c % 2 !== 1) continue;
            celdasLibres.push([f, c]);
        }
    }

    mezclar(celdasLibres);
    trampas = [];

    for (let i = 0; i < Math.min(numTrampas, celdasLibres.length); i++) {
        trampas.push({
            fila: celdasLibres[i][0],
            col: celdasLibres[i][1],
            periodo: 1500 + Math.floor(Math.random() * 2000), // 1.5-3.5s por ciclo
            desfase: Math.floor(Math.random() * 3000), // cada trampa arranca en distinto momento
            ultimoGolpe: 0,
            elemento: null,
        });
    }
}

// Determina si una trampa está activa (peligrosa) en este momento
function esTrampaActiva(trampa) {
    return Math.floor((Date.now() + trampa.desfase) / trampa.periodo) % 2 === 0;
}

// Actualiza el estado visual de cada trampa (se llama cada frame)
function actualizarTrampas() {
    for (let i = 0; i < trampas.length; i++) {
        let activa = esTrampaActiva(trampas[i]);
        if (activa) {
            trampas[i].elemento.classList.add("trampa-activa");
        } else {
            trampas[i].elemento.classList.remove("trampa-activa");
        }
    }
}

// Detecta si el jugador está sobre una trampa activa y aplica daño
function detectarTrampas() {
    let celda = getCeldaJugador();
    let ahora = Date.now();

    for (let i = 0; i < trampas.length; i++) {
        let t = trampas[i];
        if (celda.fila === t.fila && celda.col === t.col && esTrampaActiva(t)) {
            if (ahora - t.ultimoGolpe >= COOLDOWN_TRAMPA) {
                let dano = 5 + Math.floor(Math.random() * 6); // 5-10
                t.ultimoGolpe = ahora;
                aplicarDanoJugador(dano);
            }
        }
    }
}

// Aplica daño al jugador con feedback visual y verifica muerte
function aplicarDanoJugador(dano) {
    jugador.recibirDano(dano);
    document.dispatchEvent(new Event("vida-cambio"));
    mostrarDano(dano);

    elementoJugador.classList.add("jugador-golpeado");
    setTimeout(function () {
        elementoJugador.classList.remove("jugador-golpeado");
    }, 300);

    if (!jugador.estaVivo()) {
        activo = false;
        document.dispatchEvent(new Event("jugador-muerto"));
    }
}

// Muestra un número de daño flotante que sube y desaparece
function mostrarDano(dano) {
    let elem = document.createElement("div");
    elem.className = "dano-flotante";
    elem.textContent = "-" + dano;
    elem.style.left = posX + "px";
    elem.style.top = posY - 5 + "px";
    contenedorLaberinto.appendChild(elem);

    setTimeout(function () {
        if (elem.parentNode) elem.parentNode.removeChild(elem);
    }, 800);
}

// --- Trampas de lentitud ---

// Coloca 2-3 trampas que ralentizan al jugador
function colocarTrampasLentas() {
    let numTrampas = 2 + Math.floor(Math.random() * 2); // 2-3
    let celdasLibres = [];

    // Celdas ocupadas por trampas de fuego
    let ocupadas = {};
    for (let i = 0; i < trampas.length; i++) {
        ocupadas[trampas[i].fila + "," + trampas[i].col] = true;
    }

    for (let f = 1; f < FILAS - 1; f++) {
        for (let c = 1; c < COLS - 1; c++) {
            if (mapa[f][c] !== 0) continue;
            if (f === entradaFila && c === entradaCol) continue;
            if (f === llaveFila && c === llaveCol) continue;
            if (Math.abs(f - entradaFila) + Math.abs(c - entradaCol) <= 3) continue;
            if (f % 2 !== 1 || c % 2 !== 1) continue;
            if (ocupadas[f + "," + c]) continue;
            celdasLibres.push([f, c]);
        }
    }

    mezclar(celdasLibres);
    trampasLentas = [];

    for (let i = 0; i < Math.min(numTrampas, celdasLibres.length); i++) {
        trampasLentas.push({
            fila: celdasLibres[i][0],
            col: celdasLibres[i][1],
            periodo: 2000 + Math.floor(Math.random() * 2000), // 2-4s por ciclo
            desfase: Math.floor(Math.random() * 3000),
            reduccion: 0.3 + Math.random() * 0.3, // 30-60% de reducción
            duracion: 3000 + Math.floor(Math.random() * 1000), // 3-4s
            ultimoGolpe: 0,
            elemento: null,
        });
    }
}

// Determina si una trampa de lentitud está activa
function esTrampaLentaActiva(trampa) {
    return Math.floor((Date.now() + trampa.desfase) / trampa.periodo) % 2 === 0;
}

// Actualiza el estado visual de las trampas de lentitud
function actualizarTrampasLentas() {
    for (let i = 0; i < trampasLentas.length; i++) {
        let activa = esTrampaLentaActiva(trampasLentas[i]);
        if (activa) {
            trampasLentas[i].elemento.classList.add("trampa-lenta-activa");
        } else {
            trampasLentas[i].elemento.classList.remove("trampa-lenta-activa");
        }
    }
}

// Detecta si el jugador pisa una trampa de lentitud activa
function detectarTrampasLentas() {
    if (velocidadActual < VELOCIDAD) return; // Ya está lento

    let celda = getCeldaJugador();
    let ahora = Date.now();

    for (let i = 0; i < trampasLentas.length; i++) {
        let t = trampasLentas[i];
        if (celda.fila === t.fila && celda.col === t.col && esTrampaLentaActiva(t)) {
            if (ahora - t.ultimoGolpe >= COOLDOWN_TRAMPA_LENTA) {
                t.ultimoGolpe = ahora;
                aplicarLentitud(t.reduccion, t.duracion);
            }
        }
    }
}

// Aplica reducción de velocidad temporal
function aplicarLentitud(reduccion, duracion) {
    velocidadActual = VELOCIDAD * (1 - reduccion);

    // Feedback visual en el jugador
    elementoJugador.classList.add("jugador-lento");

    // Mostrar texto flotante
    let elem = document.createElement("div");
    elem.className = "efecto-flotante efecto-lentitud";
    elem.textContent = "🕸️ Lento!";
    elem.style.left = posX + "px";
    elem.style.top = posY - 5 + "px";
    contenedorLaberinto.appendChild(elem);
    setTimeout(function () {
        if (elem.parentNode) elem.parentNode.removeChild(elem);
    }, 1000);

    // Restaurar velocidad tras la duración
    if (timerLentitud) clearTimeout(timerLentitud);
    timerLentitud = setTimeout(function () {
        velocidadActual = VELOCIDAD;
        elementoJugador.classList.remove("jugador-lento");
        timerLentitud = null;
    }, duracion);
}

// --- Trasgo (enemigo con IA) ---

// Busca una celda a distancia media de la entrada para colocar al Trasgo
function posicionInicialTrasgo() {
    // BFS desde la entrada para calcular distancias
    let cola = [[entradaFila, entradaCol, 0]];
    let idx = 0;
    let distancias = {};
    distancias[entradaFila + "," + entradaCol] = 0;
    let dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    let maxDist = 0;

    while (idx < cola.length) {
        let actual = cola[idx++];
        let f = actual[0], c = actual[1], d = actual[2];
        if (d > maxDist) maxDist = d;

        for (let i = 0; i < dirs.length; i++) {
            let nf = f + dirs[i][0], nc = c + dirs[i][1];
            let key = nf + "," + nc;
            if (nf >= 0 && nf < FILAS && nc >= 0 && nc < COLS && mapa[nf][nc] === 0 && !(key in distancias)) {
                distancias[key] = d + 1;
                cola.push([nf, nc, d + 1]);
            }
        }
    }

    // Elegir celdas lógicas a 40-70% de la distancia máxima
    let distMin = Math.floor(maxDist * 0.4);
    let distMax = Math.floor(maxDist * 0.7);
    let candidatas = [];

    for (let key in distancias) {
        let dist = distancias[key];
        if (dist >= distMin && dist <= distMax) {
            let partes = key.split(",");
            let f = parseInt(partes[0]), c = parseInt(partes[1]);
            if (f % 2 === 1 && c % 2 === 1) {
                if (f === llaveFila && c === llaveCol) continue;
                candidatas.push([f, c]);
            }
        }
    }

    mezclar(candidatas);
    return candidatas.length > 0 ? candidatas[0] : [1, 1];
}

// Pathfinding BFS: calcula el camino más corto entre dos celdas
function calcularCamino(origenF, origenC, destinoF, destinoC) {
    let cola = [[origenF, origenC]];
    let idx = 0;
    let previo = {};
    previo[origenF + "," + origenC] = null;
    let dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]];

    while (idx < cola.length) {
        let actual = cola[idx++];
        let f = actual[0], c = actual[1];

        if (f === destinoF && c === destinoC) {
            // Reconstruir camino
            let camino = [];
            let pos = [f, c];
            while (pos) {
                camino.unshift(pos);
                pos = previo[pos[0] + "," + pos[1]];
            }
            camino.shift(); // Quitar posición actual
            return camino;
        }

        for (let d = 0; d < dirs.length; d++) {
            let nf = f + dirs[d][0], nc = c + dirs[d][1];
            let key = nf + "," + nc;
            if (nf >= 0 && nf < FILAS && nc >= 0 && nc < COLS && mapa[nf][nc] === 0 && !(key in previo)) {
                previo[key] = [f, c];
                cola.push([nf, nc]);
            }
        }
    }

    return []; // Sin camino (no debería pasar en laberinto conectado)
}

// Inicializa el Trasgo en el laberinto
function iniciarTrasgo() {
    let pos = posicionInicialTrasgo();
    trasgo = {
        datos: ENEMIGOS.Trasgo,
        posX: pos[1] * TAM_CELDA + (TAM_CELDA - TAM_TRASGO) / 2,
        posY: pos[0] * TAM_CELDA + (TAM_CELDA - TAM_TRASGO) / 2,
        camino: [],
        ultimoGolpe: 0,
        ultimoPathfinding: 0,
        elemento: null,
    };
}

// Actualiza pathfinding, movimiento y colisión del Trasgo (cada frame)
function actualizarTrasgo() {
    if (!trasgo) return;

    // Recalcular ruta periódicamente
    let ahora = Date.now();
    if (ahora - trasgo.ultimoPathfinding >= INTERVALO_PATHFINDING) {
        trasgo.ultimoPathfinding = ahora;

        let celdaT = {
            fila: Math.floor((trasgo.posY + TAM_TRASGO / 2) / TAM_CELDA),
            col: Math.floor((trasgo.posX + TAM_TRASGO / 2) / TAM_CELDA),
        };
        let celdaJ = getCeldaJugador();
        trasgo.camino = calcularCamino(celdaT.fila, celdaT.col, celdaJ.fila, celdaJ.col);
    }

    // Mover hacia el siguiente punto del camino
    if (trasgo.camino.length > 0) {
        let objetivo = trasgo.camino[0];
        let targetX = objetivo[1] * TAM_CELDA + (TAM_CELDA - TAM_TRASGO) / 2;
        let targetY = objetivo[0] * TAM_CELDA + (TAM_CELDA - TAM_TRASGO) / 2;

        let dx = targetX - trasgo.posX;
        let dy = targetY - trasgo.posY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= VELOCIDAD_TRASGO) {
            trasgo.posX = targetX;
            trasgo.posY = targetY;
            trasgo.camino.shift();
        } else {
            trasgo.posX += (dx / dist) * VELOCIDAD_TRASGO;
            trasgo.posY += (dy / dist) * VELOCIDAD_TRASGO;
        }

        trasgo.elemento.style.left = trasgo.posX + "px";
        trasgo.elemento.style.top = trasgo.posY + "px";
    }

    // Detectar colisión con jugador
    detectarColisionTrasgo();
}

// Si el Trasgo toca al jugador, ataca con uno de sus ataques
function detectarColisionTrasgo() {
    let ahora = Date.now();
    if (ahora - trasgo.ultimoGolpe < COOLDOWN_TRASGO) return;

    // Colisión AABB entre Trasgo y jugador
    let solapan =
        trasgo.posX < posX + TAM_JUGADOR &&
        trasgo.posX + TAM_TRASGO > posX &&
        trasgo.posY < posY + TAM_JUGADOR &&
        trasgo.posY + TAM_TRASGO > posY;

    if (solapan) {
        let ataques = trasgo.datos.ataques;
        let ataque = ataques[Math.floor(Math.random() * ataques.length)];
        trasgo.ultimoGolpe = ahora;
        aplicarDanoJugador(ataque.dano);
    }
}

// --- Estado del módulo ---

let mapa = null;
let llaveFila = 0;
let llaveCol = 0;
let entradaFila = 0;
let entradaCol = 0;
let trampas = [];
let trampasLentas = [];
let trasgo = null;
let velocidadActual = VELOCIDAD;
let timerLentitud = null;

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

    let titulo = document.createElement("h2");
    titulo.className = "titulo-habitacion";
    titulo.textContent = "Habitación 1 — El Laberinto";

    indicador = document.createElement("p");
    indicador.id = "laberinto-indicador";

    contenedorLaberinto = document.createElement("div");
    contenedorLaberinto.id = "laberinto";
    contenedorLaberinto.style.width = COLS * TAM_CELDA + "px";
    contenedorLaberinto.style.height = FILAS * TAM_CELDA + "px";

    // Jugador dentro del laberinto
    elementoJugador = document.createElement("div");
    elementoJugador.className = "jugador-laberinto";
    let img = document.createElement("img");
    img.src = jugador.img;
    img.alt = jugador.nombre;
    elementoJugador.appendChild(img);
    elementoJugador.classList.add(jugador.clase);

    mensajeExito = document.createElement("p");
    mensajeExito.id = "laberinto-mensaje";
    mensajeExito.classList.add("oculto");

    let hint = document.createElement("p");
    hint.className = "laberinto-hint";
    hint.textContent = "Usa las flechas ← ↑ ↓ → para moverte";

    let btnHuir = document.createElement("button");
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

    // Generar laberinto aleatorio
    mapa = generarMapa(FILAS, COLS, ATAJOS);

    // Entrada en la esquina inferior izquierda
    entradaFila = FILAS - 2;
    entradaCol = 1;

    // Colocar la llave en el punto más lejano de la entrada
    const puntoLlave = encontrarPuntoLejano(mapa, FILAS, COLS, entradaFila, entradaCol);
    llaveFila = puntoLlave[0];
    llaveCol = puntoLlave[1];

    // Colocar trampas aleatorias
    colocarTrampas();
    colocarTrampasLentas();

    // Resetear velocidad
    velocidadActual = VELOCIDAD;
    if (timerLentitud) { clearTimeout(timerLentitud); timerLentitud = null; }

    // Colocar al Trasgo
    iniciarTrasgo();

    // Crear e insertar la pantalla
    crearPantalla();

    // Renderizar el laberinto
    renderizarLaberinto();

    // Posicionar jugador en la entrada
    posX = entradaCol * TAM_CELDA + (TAM_CELDA - TAM_JUGADOR) / 2;
    posY = entradaFila * TAM_CELDA + (TAM_CELDA - TAM_JUGADOR) / 2;
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
    // Paredes
    for (let fila = 0; fila < mapa.length; fila++) {
        for (let col = 0; col < mapa[fila].length; col++) {
            if (mapa[fila][col] === 1) {
                let pared = document.createElement("div");
                pared.className = "laberinto-pared";
                pared.style.left = col * TAM_CELDA + "px";
                pared.style.top = fila * TAM_CELDA + "px";
                pared.style.width = TAM_CELDA + "px";
                pared.style.height = TAM_CELDA + "px";
                contenedorLaberinto.appendChild(pared);
            }
        }
    }

    // Trampas
    for (let i = 0; i < trampas.length; i++) {
        let t = trampas[i];
        let elemTrampa = document.createElement("div");
        elemTrampa.className = "laberinto-trampa";
        elemTrampa.style.left = t.col * TAM_CELDA + "px";
        elemTrampa.style.top = t.fila * TAM_CELDA + "px";
        elemTrampa.style.width = TAM_CELDA + "px";
        elemTrampa.style.height = TAM_CELDA + "px";
        contenedorLaberinto.appendChild(elemTrampa);
        t.elemento = elemTrampa;
    }

    // Trampas de lentitud
    for (let i = 0; i < trampasLentas.length; i++) {
        let tl = trampasLentas[i];
        let elemTrampaLenta = document.createElement("div");
        elemTrampaLenta.className = "laberinto-trampa-lenta";
        elemTrampaLenta.style.left = tl.col * TAM_CELDA + "px";
        elemTrampaLenta.style.top = tl.fila * TAM_CELDA + "px";
        elemTrampaLenta.style.width = TAM_CELDA + "px";
        elemTrampaLenta.style.height = TAM_CELDA + "px";
        contenedorLaberinto.appendChild(elemTrampaLenta);
        tl.elemento = elemTrampaLenta;
    }

    // Trasgo
    if (trasgo) {
        let elemTrasgo = document.createElement("div");
        elemTrasgo.className = "trasgo-laberinto";
        elemTrasgo.style.width = TAM_TRASGO + "px";
        elemTrasgo.style.height = TAM_TRASGO + "px";
        elemTrasgo.style.left = trasgo.posX + "px";
        elemTrasgo.style.top = trasgo.posY + "px";
        let imgTrasgo = document.createElement("img");
        imgTrasgo.src = "assets/img/enemigos/trasgo.png";
        imgTrasgo.alt = "Trasgo";
        elemTrasgo.appendChild(imgTrasgo);
        contenedorLaberinto.appendChild(elemTrasgo);
        trasgo.elemento = elemTrasgo;
    }

    // Llave
    elementoLlave = document.createElement("div");
    elementoLlave.className = "laberinto-llave";
    elementoLlave.textContent = "🔑";
    elementoLlave.style.left = llaveCol * TAM_CELDA + "px";
    elementoLlave.style.top = llaveFila * TAM_CELDA + "px";
    elementoLlave.style.width = TAM_CELDA + "px";
    elementoLlave.style.height = TAM_CELDA + "px";
    contenedorLaberinto.appendChild(elementoLlave);

    // Salida
    let salida = document.createElement("div");
    salida.className = "laberinto-salida";
    salida.textContent = "🚪";
    salida.style.left = entradaCol * TAM_CELDA + "px";
    salida.style.top = entradaFila * TAM_CELDA + "px";
    salida.style.width = TAM_CELDA + "px";
    salida.style.height = TAM_CELDA + "px";
    contenedorLaberinto.appendChild(salida);

    // Jugador (siempre al final para que quede encima)
    contenedorLaberinto.appendChild(elementoJugador);
}

// --- Movimiento con colisiones y corner sliding ---

function esPared(pixelX, pixelY) {
    let col = Math.floor(pixelX / TAM_CELDA);
    let fila = Math.floor(pixelY / TAM_CELDA);

    if (fila < 0 || fila >= FILAS || col < 0 || col >= COLS) {
        return true;
    }
    return mapa[fila][col] === 1;
}

// Verifica colisión del jugador en una posición dada
function hayColision(x, y) {
    return esPared(x + MARGEN_COLISION, y + MARGEN_COLISION) ||
           esPared(x + TAM_JUGADOR - MARGEN_COLISION, y + MARGEN_COLISION) ||
           esPared(x + MARGEN_COLISION, y + TAM_JUGADOR - MARGEN_COLISION) ||
           esPared(x + TAM_JUGADOR - MARGEN_COLISION, y + TAM_JUGADOR - MARGEN_COLISION);
}

function moverEnLaberinto(dx, dy) {
    // Mover por eje X
    if (dx !== 0) {
        let nuevaX = posX + dx;
        if (!hayColision(nuevaX, posY)) {
            posX = nuevaX;
        } else {
            // Corner sliding: intentar deslizar en Y para doblar esquinas
            for (let i = 1; i <= TOLERANCIA_ESQUINA; i++) {
                if (!hayColision(nuevaX, posY - i)) {
                    posY -= i;
                    posX = nuevaX;
                    break;
                }
                if (!hayColision(nuevaX, posY + i)) {
                    posY += i;
                    posX = nuevaX;
                    break;
                }
            }
        }
    }

    // Mover por eje Y
    if (dy !== 0) {
        let nuevaY = posY + dy;
        if (!hayColision(posX, nuevaY)) {
            posY = nuevaY;
        } else {
            // Corner sliding: intentar deslizar en X para doblar esquinas
            for (let i = 1; i <= TOLERANCIA_ESQUINA; i++) {
                if (!hayColision(posX - i, nuevaY)) {
                    posX -= i;
                    posY = nuevaY;
                    break;
                }
                if (!hayColision(posX + i, nuevaY)) {
                    posX += i;
                    posY = nuevaY;
                    break;
                }
            }
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
    let centroX = posX + TAM_JUGADOR / 2;
    let centroY = posY + TAM_JUGADOR / 2;
    return {
        fila: Math.floor(centroY / TAM_CELDA),
        col: Math.floor(centroX / TAM_CELDA),
    };
}

function detectarLlave() {
    if (tieneLlave) return;

    let celda = getCeldaJugador();
    if (celda.fila === llaveFila && celda.col === llaveCol) {
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

    let celda = getCeldaJugador();
    if (celda.fila === entradaFila && celda.col === entradaCol) {
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

    let dx = 0;
    let dy = 0;

    if (teclas["ArrowUp"])    dy -= velocidadActual;
    if (teclas["ArrowDown"])  dy += velocidadActual;
    if (teclas["ArrowLeft"])  dx -= velocidadActual;
    if (teclas["ArrowRight"]) dx += velocidadActual;

    if (dx !== 0 || dy !== 0) {
        moverEnLaberinto(dx, dy);
    }

    actualizarTrampas();
    detectarTrampas();
    actualizarTrampasLentas();
    detectarTrampasLentas();
    actualizarTrasgo();
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

export function limpiarHabitacion1() {
    activo = false;
    trampas = [];
    trampasLentas = [];
    trasgo = null;
    velocidadActual = VELOCIDAD;
    if (timerLentitud) { clearTimeout(timerLentitud); timerLentitud = null; }

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
