// Motor 3D — Trampas de fuego
// Trampas en el suelo que ciclan on/off y dañan al jugador al pisarlas
// Activa: cruz de 5 llamas nítidas. Inactiva: chispas tenues en el suelo.

import { mezclar } from '../laberinto.js';
import { lanzarToast } from '../componentes/toast.js';

// --- Estado del módulo ---

let trampas = [];
const COOLDOWN = 1000; // 1 segundo entre golpes
const RADIO_CULLING = 6;

// Offsets para las llamas alrededor del centro (patrón cruz)
const OFFSETS_FUEGO = [
    [0.25, 0],
    [-0.25, 0],
    [0, 0.25],
    [0, -0.25],
];

// --- Generación ---

// Coloca 6-10 trampas en corredores del laberinto
export function generarTrampas3D(mapa, filas, cols, entradaFila, entradaCol, llaveFila, llaveCol) {
    const numTrampas = 6 + Math.floor(Math.random() * 5);
    const celdasLibres = [];

    for (let f = 1; f < filas - 1; f++) {
        for (let c = 1; c < cols - 1; c++) {
            if (mapa[f][c] !== 0) continue;
            if (f === entradaFila && c === entradaCol) continue;
            if (f === llaveFila && c === llaveCol) continue;
            if (Math.abs(f - entradaFila) + Math.abs(c - entradaCol) <= 2) continue;
            celdasLibres.push([f, c]);
        }
    }

    mezclar(celdasLibres);
    trampas = [];

    for (let i = 0; i < Math.min(numTrampas, celdasLibres.length); i++) {
        trampas.push({
            fila: celdasLibres[i][0],
            col: celdasLibres[i][1],
            periodo: 1500 + Math.floor(Math.random() * 2000),
            desfase: Math.floor(Math.random() * 3000),
            ultimoGolpe: 0,
        });
    }
}

// --- Lógica de ciclo on/off ---

function esTrampaActiva(trampa) {
    return Math.floor((Date.now() + trampa.desfase) / trampa.periodo) % 2 === 0;
}

// --- Detección y daño ---

// Detecta si el jugador pisa una trampa activa y aplica daño
// Retorna el daño aplicado (0 si no hubo)
export function detectarTrampas3D(jugadorX, jugadorY, jugador) {
    const celdaX = Math.floor(jugadorX);
    const celdaY = Math.floor(jugadorY);
    const ahora = Date.now();

    for (let i = 0; i < trampas.length; i++) {
        const t = trampas[i];
        if (celdaY === t.fila && celdaX === t.col && esTrampaActiva(t)) {
            if (ahora - t.ultimoGolpe >= COOLDOWN) {
                const dano = 5 + Math.floor(Math.random() * 6);
                t.ultimoGolpe = ahora;
                jugador.recibirDano(dano);
                document.dispatchEvent(new Event('vida-cambio'));

                if (!jugador.estaVivo()) {
                    document.dispatchEvent(new Event('jugador-muerto'));
                }

                lanzarToast('Trampa de fuego (-' + dano + ')', '\uD83D\uDD25', 'dano');
                return dano;
            }
        }
    }

    return 0;
}

// --- Sprites para renderizado 3D ---

// Pool: max 10 trampas × 5 sprites (centro + 4 llamas) = 50
const MAX_TRAMPAS_SPRITES = 50;
const _spritesPool = Array.from({ length: MAX_TRAMPAS_SPRITES }, () => ({
    x: 0,
    y: 0,
    z: 0,
    emoji: '',
    color: '',
    sinBrillo: false,
}));
const _spritesResult = { sprites: _spritesPool, count: 0 };

// Retorna sprites de trampas visibles (con culling por distancia)
// Activa: 🔥 centro + 4× 🔥 en cruz = 5 sprites nítidos (sin glow)
// Inactiva: 1× ✨ en el suelo (chispas tenues, con glow)
export function obtenerSpritesTrampas3D(jugadorX, jugadorY) {
    let idx = 0;
    const radioSq = RADIO_CULLING * RADIO_CULLING;

    for (let i = 0; i < trampas.length; i++) {
        const t = trampas[i];
        const cx = t.col + 0.5;
        const cy = t.fila + 0.5;
        const dx = cx - jugadorX;
        const dy = cy - jugadorY;
        if (dx * dx + dy * dy > radioSq) continue;

        const activa = esTrampaActiva(t);

        if (activa) {
            // Llama central
            const centro = _spritesPool[idx++];
            centro.x = cx;
            centro.y = cy;
            centro.z = 0.2;
            centro.emoji = '\uD83D\uDD25';
            centro.color = '#ff4400';
            centro.sinBrillo = true;

            // 4 llamas en cruz alrededor
            for (let j = 0; j < OFFSETS_FUEGO.length; j++) {
                const s = _spritesPool[idx++];
                s.x = cx + OFFSETS_FUEGO[j][0];
                s.y = cy + OFFSETS_FUEGO[j][1];
                s.z = 0.15;
                s.emoji = '\uD83D\uDD25';
                s.color = '#ff4400';
                s.sinBrillo = true;
            }
        } else {
            // Inactiva: chispas sutiles en el suelo
            const s = _spritesPool[idx++];
            s.x = cx;
            s.y = cy;
            s.z = 0.05;
            s.emoji = '\u2728';
            s.color = '#664400';
            s.sinBrillo = false;
        }
    }

    _spritesResult.count = idx;
    return _spritesResult;
}

// --- Limpieza ---

export function limpiarTrampas3D() {
    trampas = [];
}
