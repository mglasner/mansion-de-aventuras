// Estado compartido de la Habitación 2
// Agrupa las variables de estado del laberinto 3D

import { CFG } from './config.js';

// --- Constantes del laberinto (desde config YAML) ---

export const FILAS = CFG.laberinto.filas;
export const COLS = CFG.laberinto.columnas;
export const ATAJOS = CFG.laberinto.atajos;

// --- Estado mutable ---

export const est = {
    // Mapa
    mapa: null,
    llaveFila: 0,
    llaveCol: 0,
    entradaFila: 0,
    entradaCol: 0,

    // Jugador
    jugador: null,
    callbackSalir: null,
    posicion: { x: 0, y: 0, angulo: 0 },
    tieneLlave: false,
    activo: false,
    teclas: {},

    // Referencias DOM
    pantalla: null,
    canvas3D: null,
    ctx3D: null,
    canvasMini: null,
    ctxMini: null,
    minimapBase: null,
    gradCielo: null,
    gradSuelo: null,
    avatarImg: null,
    indicador: null,
    mensajeExito: null,

    // Motor 3D
    texturas: null,
    decoraciones: null,
    mapaLuz: null,
    frameCount: 0,
    usarTexturas: true,
    ultimoFrame: 0,
    framesLentos: 0,
    flashDano: 0,

    // Landscape mobile
    modoInmersivo: null,
    dpadRef: null,
    hudJugadorContenedor: null,
    hudJugadorVida: null,
    hudJugadorVidaAnterior: -1,
    hudJugadorInventario: null,
};

/** Actualiza el HUD de inventario landscape (si existe) */
export function actualizarHUDInventarioLocal() {
    if (!est.hudJugadorInventario) return;
    est.hudJugadorInventario.actualizar(est.jugador.inventario);
}
