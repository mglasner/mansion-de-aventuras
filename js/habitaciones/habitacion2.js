// Habitación 2 — El Laberinto 3D
// Vista pseudo-3D con raycasting estilo Doom
// El jugador debe encontrar la llave y volver a la salida

import { generarMapa, encontrarPuntoLejano } from '../laberinto.js';
import { lanzarToast } from '../componentes/toast.js';

// --- Constantes ---

let ANCHO_CANVAS = 640;
let ALTO_CANVAS = 400;
let ANCHO_MINIMAPA = 150;
let ALTO_MINIMAPA = 150;
const FOV = Math.PI / 3; // 60 grados
let NUM_RAYOS = 320;
let ANCHO_FRANJA = 2;

// Calcula dimensiones del canvas según el viewport
function calcularDimensionesCanvas() {
    const contenedor = document.getElementById('juego');
    ANCHO_CANVAS = Math.min(640, contenedor.clientWidth - 20);
    ALTO_CANVAS = Math.round(ANCHO_CANVAS * 0.625);
    NUM_RAYOS = Math.max(160, Math.round(ANCHO_CANVAS / 2));
    ANCHO_FRANJA = ANCHO_CANVAS / NUM_RAYOS;
    ANCHO_MINIMAPA = Math.min(150, Math.round(ANCHO_CANVAS * 0.23));
    ALTO_MINIMAPA = ANCHO_MINIMAPA;
}

// Dimensiones del laberinto (impares para el algoritmo de generación)
const FILAS = 13;
const COLS = 13;
const ATAJOS = 6;

// Paleta de colores (verde bosque encantado)
const COLORES = {
    // Paredes 3D (RGB base, se escalan por brillo/distancia)
    paredNS: { r: 26, g: 62, b: 30 }, // caras N/S más oscuras
    paredEO: { r: 37, g: 85, b: 42 }, // caras E/O más claras
    // Gradientes cielo y suelo
    cieloArriba: '#050f05',
    cieloAbajo: '#0a1a0f',
    sueloArriba: '#0d240d',
    sueloAbajo: '#050a05',
    // Minimapa
    minimapaFondo: '#0d1a0d',
    minimapaParedes: '#1a3e1a',
};

// Movimiento del jugador
const VELOCIDAD_MOV = 0.06;
const VELOCIDAD_GIRO = 0.04;
const RADIO_COLISION = 0.2;

// --- Estado del módulo ---

let mapa = null;
let llaveFila = 0;
let llaveCol = 0;
let entradaFila = 0;
let entradaCol = 0;

let jugador = null;
let callbackSalir = null;
let jugadorX = 0;
let jugadorY = 0;
let angulo = 0;
let tieneLlave = false;
let animacionId = null;
let activo = false;
const teclas = {};

// Referencias DOM
let pantalla = null;
let canvas3D = null;
let ctx3D = null;
let canvasMini = null;
let ctxMini = null;
let minimapBase = null;
let gradCielo = null;
let gradSuelo = null;
let avatarImg = null;
let indicador = null;
let mensajeExito = null;

// --- Crear pantalla HTML ---

function crearPantalla(esTouch) {
    pantalla = document.createElement('div');
    pantalla.id = 'pantalla-habitacion2';
    pantalla.className = 'habitacion-2';

    // Cabecera: botón huir + título
    const cabecera = document.createElement('div');
    cabecera.className = 'cabecera-habitacion';

    const btnHuir = document.createElement('button');
    btnHuir.className = 'btn-huir';
    btnHuir.innerHTML = '<span class="btn-huir-flecha">←</span> 🚪';
    btnHuir.title = 'Huir al pasillo (Esc)';
    btnHuir.addEventListener('click', function () {
        limpiarHabitacion2();
        callbackSalir();
    });

    const titulo = document.createElement('h2');
    titulo.className = 'titulo-habitacion';
    titulo.textContent = 'Habitación 2 — El Laberinto 3D';

    cabecera.appendChild(btnHuir);
    cabecera.appendChild(titulo);

    indicador = document.createElement('p');
    indicador.id = 'laberinto3d-indicador';

    // Contenedor para canvas 3D + minimapa
    const contenedor = document.createElement('div');
    contenedor.id = 'contenedor-3d';

    canvas3D = document.createElement('canvas');
    canvas3D.id = 'canvas-3d';
    canvas3D.width = ANCHO_CANVAS;
    canvas3D.height = ALTO_CANVAS;
    ctx3D = canvas3D.getContext('2d');

    canvasMini = document.createElement('canvas');
    canvasMini.id = 'canvas-minimapa';
    canvasMini.width = ANCHO_MINIMAPA;
    canvasMini.height = ALTO_MINIMAPA;
    ctxMini = canvasMini.getContext('2d');

    contenedor.appendChild(canvas3D);
    contenedor.appendChild(canvasMini);

    // Pre-crear gradientes (no cambian entre frames)
    gradCielo = ctx3D.createLinearGradient(0, 0, 0, ALTO_CANVAS / 2);
    gradCielo.addColorStop(0, COLORES.cieloArriba);
    gradCielo.addColorStop(1, COLORES.cieloAbajo);

    gradSuelo = ctx3D.createLinearGradient(0, ALTO_CANVAS / 2, 0, ALTO_CANVAS);
    gradSuelo.addColorStop(0, COLORES.sueloArriba);
    gradSuelo.addColorStop(1, COLORES.sueloAbajo);

    mensajeExito = document.createElement('p');
    mensajeExito.id = 'laberinto3d-mensaje';
    mensajeExito.classList.add('oculto');

    pantalla.appendChild(cabecera);
    pantalla.appendChild(indicador);
    pantalla.appendChild(contenedor);
    pantalla.appendChild(mensajeExito);

    if (!esTouch) {
        const hint = document.createElement('p');
        hint.className = 'laberinto-hint';
        hint.textContent = '↑↓ avanzar/retroceder — ←→ girar · Esc para huir';
        pantalla.appendChild(hint);
    }

    document.getElementById('juego').appendChild(pantalla);
}

// --- Raycasting (algoritmo DDA) ---

function renderizar3D() {
    // Cielo
    ctx3D.fillStyle = gradCielo;
    ctx3D.fillRect(0, 0, ANCHO_CANVAS, ALTO_CANVAS / 2);

    // Suelo
    ctx3D.fillStyle = gradSuelo;
    ctx3D.fillRect(0, ALTO_CANVAS / 2, ANCHO_CANVAS, ALTO_CANVAS / 2);

    // Z-buffer para sprites
    const zBuffer = new Array(NUM_RAYOS);

    // Lanzar un rayo por cada columna
    for (let i = 0; i < NUM_RAYOS; i++) {
        const anguloRayo = angulo - FOV / 2 + (i / NUM_RAYOS) * FOV;

        const rayDirX = Math.cos(anguloRayo);
        const rayDirY = Math.sin(anguloRayo);

        // Celda actual del mapa
        let mapX = Math.floor(jugadorX);
        let mapY = Math.floor(jugadorY);

        // Distancia entre líneas de grid consecutivas a lo largo del rayo
        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistY = Math.abs(1 / rayDirY);

        // Dirección de paso y distancia al primer borde
        let stepX, stepY, sideDistX, sideDistY;

        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (jugadorX - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1 - jugadorX) * deltaDistX;
        }

        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (jugadorY - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1 - jugadorY) * deltaDistY;
        }

        // DDA: avanzar celda a celda hasta golpear una pared
        let hit = false;
        let lado = 0; // 0 = pared vertical (E/O), 1 = pared horizontal (N/S)
        let iter = 0;

        while (!hit && iter < 50) {
            iter++;
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                lado = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                lado = 1;
            }

            if (mapY >= 0 && mapY < FILAS && mapX >= 0 && mapX < COLS) {
                if (mapa[mapY][mapX] === 1) hit = true;
            } else {
                hit = true;
            }
        }

        // Distancia euclídea a lo largo del rayo
        let distRayo;
        if (lado === 0) {
            distRayo = sideDistX - deltaDistX;
        } else {
            distRayo = sideDistY - deltaDistY;
        }

        // Corrección de ojo de pez (proyección perpendicular al plano de cámara)
        let distPerp = distRayo * Math.cos(anguloRayo - angulo);
        if (distPerp < 0.01) distPerp = 0.01;

        zBuffer[i] = distPerp;

        // Altura de la franja de pared en pantalla
        const alturaPared = ALTO_CANVAS / distPerp;
        const inicioY = Math.floor((ALTO_CANVAS - alturaPared) / 2);
        const finY = Math.floor((ALTO_CANVAS + alturaPared) / 2);

        // Color con efecto de profundidad (más lejos = más oscuro)
        const brillo = Math.min(1, 1.5 / distPerp);
        const color = lado === 1 ? COLORES.paredNS : COLORES.paredEO;
        const r = Math.floor(color.r * brillo);
        const g = Math.floor(color.g * brillo);
        const b = Math.floor(color.b * brillo);

        ctx3D.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx3D.fillRect(i * ANCHO_FRANJA, inicioY, ANCHO_FRANJA, finY - inicioY);
    }

    return zBuffer;
}

// --- Sprites 3D (llave y salida visibles en el mundo 3D) ---

function renderizarSprites(zBuffer) {
    const sprites = [];

    if (!tieneLlave) {
        sprites.push({
            x: llaveCol + 0.5,
            y: llaveFila + 0.5,
            emoji: '\uD83D\uDD11',
            color: '#ffd700',
        });
    }

    sprites.push({
        x: entradaCol + 0.5,
        y: entradaFila + 0.5,
        emoji: '\uD83D\uDEAA',
        color: tieneLlave ? '#44ff44' : '#444444',
    });

    // Ordenar por distancia (más lejanos primero para overlap correcto)
    sprites.sort(function (a, b) {
        const da = (a.x - jugadorX) * (a.x - jugadorX) + (a.y - jugadorY) * (a.y - jugadorY);
        const db = (b.x - jugadorX) * (b.x - jugadorX) + (b.y - jugadorY) * (b.y - jugadorY);
        return db - da;
    });

    for (let i = 0; i < sprites.length; i++) {
        dibujarSprite(sprites[i], zBuffer);
    }
}

function dibujarSprite(sprite, zBuffer) {
    const dx = sprite.x - jugadorX;
    const dy = sprite.y - jugadorY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.3) return;

    // Ángulo del sprite relativo al jugador
    const anguloSprite = Math.atan2(dy, dx);
    let anguloRel = anguloSprite - angulo;

    // Normalizar a [-PI, PI]
    while (anguloRel > Math.PI) anguloRel -= 2 * Math.PI;
    while (anguloRel < -Math.PI) anguloRel += 2 * Math.PI;

    // Fuera del campo de visión
    if (Math.abs(anguloRel) > FOV / 2 + 0.15) return;

    // Posición horizontal en pantalla
    const screenX = (0.5 + anguloRel / FOV) * ANCHO_CANVAS;

    // Distancia perpendicular para tamaño correcto
    const distPerp = dist * Math.cos(anguloRel);
    if (distPerp < 0.1) return;

    // Verificar z-buffer: si hay pared delante, no dibujar
    const colCentral = Math.floor(screenX / ANCHO_FRANJA);
    if (colCentral >= 0 && colCentral < NUM_RAYOS && distPerp >= zBuffer[colCentral]) return;

    // Tamaño del emoji según distancia
    const fontSize = Math.min(Math.max((ALTO_CANVAS / distPerp) * 0.4, 10), 60);

    ctx3D.save();
    ctx3D.font = Math.floor(fontSize) + 'px serif';
    ctx3D.textAlign = 'center';
    ctx3D.textBaseline = 'middle';
    ctx3D.shadowColor = sprite.color;
    ctx3D.shadowBlur = 15;
    ctx3D.fillText(sprite.emoji, screenX, ALTO_CANVAS / 2);
    ctx3D.shadowBlur = 0;
    ctx3D.restore();
}

// --- Minimapa ---

// Pre-renderiza las paredes en un canvas offscreen (no cambian)
function crearMinimapBase() {
    minimapBase = document.createElement('canvas');
    minimapBase.width = ANCHO_MINIMAPA;
    minimapBase.height = ALTO_MINIMAPA;
    const ctx = minimapBase.getContext('2d');

    const tamCelda = ANCHO_MINIMAPA / COLS;

    // Fondo
    ctx.fillStyle = COLORES.minimapaFondo;
    ctx.fillRect(0, 0, ANCHO_MINIMAPA, ALTO_MINIMAPA);

    // Paredes
    ctx.fillStyle = COLORES.minimapaParedes;
    for (let f = 0; f < FILAS; f++) {
        for (let c = 0; c < COLS; c++) {
            if (mapa[f][c] === 1) {
                ctx.fillRect(c * tamCelda, f * tamCelda, tamCelda + 0.5, tamCelda + 0.5);
            }
        }
    }
}

// Dibuja el minimapa cada frame: base + elementos dinámicos
function renderizarMinimapa() {
    ctxMini.drawImage(minimapBase, 0, 0);

    const tamCelda = ANCHO_MINIMAPA / COLS;

    // Salida (verde si tiene llave, gris si no)
    ctxMini.fillStyle = tieneLlave ? '#44ff44' : '#336633';
    ctxMini.beginPath();
    ctxMini.arc((entradaCol + 0.5) * tamCelda, (entradaFila + 0.5) * tamCelda, 4, 0, Math.PI * 2);
    ctxMini.fill();

    // Llave (dorada con brillo, solo si no la tiene)
    if (!tieneLlave) {
        ctxMini.save();
        ctxMini.shadowColor = '#ffd700';
        ctxMini.shadowBlur = 6;
        ctxMini.fillStyle = '#ffd700';
        ctxMini.beginPath();
        ctxMini.arc((llaveCol + 0.5) * tamCelda, (llaveFila + 0.5) * tamCelda, 4, 0, Math.PI * 2);
        ctxMini.fill();
        ctxMini.restore();
    }

    // Jugador (avatar circular con glow)
    const px = jugadorX * tamCelda;
    const py = jugadorY * tamCelda;
    const radioAvatar = 8;

    // Resplandor detrás del avatar
    ctxMini.save();
    ctxMini.shadowColor = '#ffcc00';
    ctxMini.shadowBlur = 10;
    ctxMini.fillStyle = 'rgba(255, 204, 0, 0.4)';
    ctxMini.beginPath();
    ctxMini.arc(px, py, radioAvatar + 2, 0, Math.PI * 2);
    ctxMini.fill();
    ctxMini.restore();

    // Imagen del avatar recortada en círculo
    ctxMini.save();
    ctxMini.beginPath();
    ctxMini.arc(px, py, radioAvatar, 0, Math.PI * 2);
    ctxMini.closePath();
    ctxMini.clip();
    ctxMini.drawImage(
        avatarImg,
        px - radioAvatar,
        py - radioAvatar,
        radioAvatar * 2,
        radioAvatar * 2
    );
    ctxMini.restore();

    // Borde del avatar (más grueso y brillante)
    ctxMini.strokeStyle = '#ffcc00';
    ctxMini.lineWidth = 2.5;
    ctxMini.beginPath();
    ctxMini.arc(px, py, radioAvatar, 0, Math.PI * 2);
    ctxMini.stroke();

    // Línea de dirección (más larga y gruesa)
    const linLen = 12;
    ctxMini.strokeStyle = '#ffcc00';
    ctxMini.lineWidth = 2;
    ctxMini.beginPath();
    ctxMini.moveTo(px + Math.cos(angulo) * radioAvatar, py + Math.sin(angulo) * radioAvatar);
    ctxMini.lineTo(
        px + Math.cos(angulo) * (radioAvatar + linLen),
        py + Math.sin(angulo) * (radioAvatar + linLen)
    );
    ctxMini.stroke();

    // Campo de visión (FOV) como dos líneas tenues
    const fovLen = 18;
    ctxMini.strokeStyle = 'rgba(255, 204, 0, 0.3)';
    ctxMini.lineWidth = 1;
    ctxMini.beginPath();
    ctxMini.moveTo(
        px + Math.cos(angulo - FOV / 2) * radioAvatar,
        py + Math.sin(angulo - FOV / 2) * radioAvatar
    );
    ctxMini.lineTo(
        px + Math.cos(angulo - FOV / 2) * fovLen,
        py + Math.sin(angulo - FOV / 2) * fovLen
    );
    ctxMini.moveTo(
        px + Math.cos(angulo + FOV / 2) * radioAvatar,
        py + Math.sin(angulo + FOV / 2) * radioAvatar
    );
    ctxMini.lineTo(
        px + Math.cos(angulo + FOV / 2) * fovLen,
        py + Math.sin(angulo + FOV / 2) * fovLen
    );
    ctxMini.stroke();
}

// --- Movimiento y colisiones ---

function esPared(x, y) {
    const col = Math.floor(x);
    const fila = Math.floor(y);
    if (fila < 0 || fila >= FILAS || col < 0 || col >= COLS) return true;
    return mapa[fila][col] === 1;
}

// Verifica colisión usando las 4 esquinas del radio de colisión
function hayColision(x, y) {
    return (
        esPared(x - RADIO_COLISION, y - RADIO_COLISION) ||
        esPared(x + RADIO_COLISION, y - RADIO_COLISION) ||
        esPared(x - RADIO_COLISION, y + RADIO_COLISION) ||
        esPared(x + RADIO_COLISION, y + RADIO_COLISION)
    );
}

function moverJugador() {
    // Rotación
    if (teclas['ArrowLeft']) angulo -= VELOCIDAD_GIRO;
    if (teclas['ArrowRight']) angulo += VELOCIDAD_GIRO;

    // Avanzar / retroceder
    let dx = 0,
        dy = 0;

    if (teclas['ArrowUp']) {
        dx += Math.cos(angulo) * VELOCIDAD_MOV;
        dy += Math.sin(angulo) * VELOCIDAD_MOV;
    }
    if (teclas['ArrowDown']) {
        dx -= Math.cos(angulo) * VELOCIDAD_MOV;
        dy -= Math.sin(angulo) * VELOCIDAD_MOV;
    }

    // Colisión por eje separado (permite deslizarse contra paredes)
    if (dx !== 0) {
        const nuevaX = jugadorX + dx;
        if (!hayColision(nuevaX, jugadorY)) {
            jugadorX = nuevaX;
        }
    }

    if (dy !== 0) {
        const nuevaY = jugadorY + dy;
        if (!hayColision(jugadorX, nuevaY)) {
            jugadorY = nuevaY;
        }
    }
}

// --- Detección de llave y salida ---

function detectarLlave() {
    if (tieneLlave) return;

    const celdaX = Math.floor(jugadorX);
    const celdaY = Math.floor(jugadorY);

    if (celdaY === llaveFila && celdaX === llaveCol) {
        tieneLlave = true;

        indicador.textContent = '\uD83D\uDD11 \u00A1Llave obtenida! Vuelve a la salida';
        indicador.classList.add('llave-obtenida');

        // Guardar en inventario y notificar a la barra superior
        jugador.inventario.push('llave-habitacion-3');
        document.dispatchEvent(new Event('inventario-cambio'));
        lanzarToast('¡Llave encontrada!', '🔑', 'item');
    }
}

function detectarSalida() {
    if (!tieneLlave) return;

    const celdaX = Math.floor(jugadorX);
    const celdaY = Math.floor(jugadorY);

    if (celdaY === entradaFila && celdaX === entradaCol) {
        activo = false;
        mensajeExito.textContent = '\u00A1Escapaste con la llave!';
        mensajeExito.classList.remove('oculto');
        lanzarToast('¡Escapaste con la llave!', '🚪', 'exito');

        setTimeout(function () {
            limpiarHabitacion2();
            callbackSalir();
        }, 1500);
    }
}

// --- Game loop ---

function loop() {
    if (!activo) return;

    moverJugador();
    detectarLlave();
    detectarSalida();

    const zBuffer = renderizar3D();
    renderizarSprites(zBuffer);
    renderizarMinimapa();

    animacionId = requestAnimationFrame(loop);
}

// --- Handlers de teclado ---

function onKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        teclas[e.key] = true;
    }
    if (e.key === 'Escape') {
        limpiarHabitacion2();
        callbackSalir();
    }
}

function onKeyUp(e) {
    delete teclas[e.key];
}

// --- API pública ---

export function iniciarHabitacion2(jugadorRef, callback, dpadRef) {
    jugador = jugadorRef;
    callbackSalir = callback;
    tieneLlave = false;
    activo = true;

    // Escalar canvas al viewport
    calcularDimensionesCanvas();

    // Generar laberinto aleatorio
    mapa = generarMapa(FILAS, COLS, ATAJOS);

    // Entrada en la esquina inferior izquierda
    entradaFila = FILAS - 2;
    entradaCol = 1;

    // Colocar la llave en el punto más lejano de la entrada
    const puntoLlave = encontrarPuntoLejano(mapa, FILAS, COLS, entradaFila, entradaCol);
    llaveFila = puntoLlave[0];
    llaveCol = puntoLlave[1];

    // Posición inicial del jugador (centro de la celda de entrada, mirando arriba)
    jugadorX = entradaCol + 0.5;
    jugadorY = entradaFila + 0.5;
    angulo = -Math.PI / 2;

    // Cargar imagen del avatar para el minimapa
    avatarImg = new Image();
    avatarImg.src = jugador.img;

    // Crear e insertar la pantalla
    crearPantalla(!!dpadRef);

    // Pre-renderizar minimapa base
    crearMinimapBase();

    // Resetear indicador
    indicador.textContent = '\uD83D\uDD11 Encuentra la llave';
    indicador.classList.remove('llave-obtenida');
    mensajeExito.classList.add('oculto');

    // Registrar controles
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Activar D-pad touch apuntando a las teclas del laberinto 3D
    if (dpadRef) {
        dpadRef.setTeclasRef(teclas);
        dpadRef.mostrar();
    }

    // Iniciar game loop
    animacionId = requestAnimationFrame(loop);
}

export function limpiarHabitacion2() {
    activo = false;

    if (animacionId) {
        cancelAnimationFrame(animacionId);
        animacionId = null;
    }

    // Remover handlers de teclado
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);

    // Limpiar teclas
    Object.keys(teclas).forEach(function (k) {
        delete teclas[k];
    });

    // Remover pantalla del DOM
    if (pantalla && pantalla.parentNode) {
        pantalla.parentNode.removeChild(pantalla);
        pantalla = null;
    }

    canvas3D = null;
    ctx3D = null;
    canvasMini = null;
    ctxMini = null;
    minimapBase = null;
    gradCielo = null;
    gradSuelo = null;
    avatarImg = null;
}
