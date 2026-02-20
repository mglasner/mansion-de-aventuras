// Habitacion 4 — El Abismo: Texturas procedurales de tiles
// Genera offscreen canvases de 16x16 con aspecto de piedra, plataforma, abismo

import { CFG } from './config.js';

const TAM = CFG.tiles.tamano;
const VARIANTES = 4;

// Cache de texturas: { SUELO: [canvas, ...], PLATAFORMA: [...], ABISMO: [...] }
let texturas = null;

// Ruido simple para textura
function ruido(x, y, seed) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
}

// Hash para elegir variante por posicion en el mapa
export function hashVariante(fila, col) {
    return ((fila * 37 + col * 71) & 0x7fffffff) % VARIANTES;
}

// --- Generadores ---

function generarSuelo(variante) {
    const c = document.createElement('canvas');
    c.width = TAM;
    c.height = TAM;
    const ctx = c.getContext('2d');
    const seed = variante * 17.3;

    // Base: piedra oscura con gradiente vertical
    const grad = ctx.createLinearGradient(0, 0, 0, TAM);
    grad.addColorStop(0, '#2e2e62');
    grad.addColorStop(1, '#222250');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, TAM, TAM);

    // Ruido FBM para textura de piedra
    for (let py = 0; py < TAM; py++) {
        for (let px = 0; px < TAM; px++) {
            const n = ruido(px, py, seed) * 0.12 - 0.06;
            if (n > 0) {
                ctx.fillStyle = 'rgba(255,255,255,' + n.toFixed(3) + ')';
            } else {
                ctx.fillStyle = 'rgba(0,0,0,' + (-n).toFixed(3) + ')';
            }
            ctx.fillRect(px, py, 1, 1);
        }
    }

    // Grietas (lineas oscuras aleatorias)
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    const gx = Math.floor(ruido(variante, 0, 3.3) * (TAM - 4)) + 2;
    const gy = Math.floor(ruido(variante, 1, 5.5) * (TAM - 6)) + 3;
    const largo = 3 + Math.floor(ruido(variante, 2, 7.7) * 5);
    for (let i = 0; i < largo; i++) {
        ctx.fillRect(gx + i, gy + Math.floor(ruido(i, variante, 1.1) * 2), 1, 1);
    }

    // Highlight superior (borde iluminado)
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, 0, TAM, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 2, TAM, 1);

    return c;
}

function generarPlataforma(variante) {
    const c = document.createElement('canvas');
    c.width = TAM;
    c.height = TAM;
    const ctx = c.getContext('2d');
    const seed = variante * 13.7 + 50;

    // Plataforma one-way: solo la superficie superior (5px de grosor)
    const grosor = 5;

    // Superficie de roca
    ctx.fillStyle = '#4a4a8e';
    ctx.fillRect(0, 0, TAM, grosor);

    // Textura rugosa en la superficie
    for (let py = 0; py < grosor; py++) {
        for (let px = 0; px < TAM; px++) {
            const n = ruido(px, py, seed) * 0.12 - 0.06;
            if (n > 0) {
                ctx.fillStyle = 'rgba(255,255,255,' + n.toFixed(3) + ')';
            } else {
                ctx.fillStyle = 'rgba(0,0,0,' + (-n).toFixed(3) + ')';
            }
            ctx.fillRect(px, py, 1, 1);
        }
    }

    // Highlight superior brillante (indica superficie de aterrizaje)
    ctx.fillStyle = 'rgba(180,180,255,0.25)';
    ctx.fillRect(0, 0, TAM, 1);
    ctx.fillStyle = 'rgba(140,140,220,0.15)';
    ctx.fillRect(0, 1, TAM, 1);

    // Borde inferior difuminado (fade out)
    ctx.fillStyle = 'rgba(60,60,120,0.3)';
    ctx.fillRect(0, grosor - 1, TAM, 1);

    return c;
}

function generarFuego(frame) {
    const c = document.createElement('canvas');
    c.width = TAM;
    c.height = TAM;
    const ctx = c.getContext('2d');
    const seed = frame * 17.1;

    // Fondo oscuro
    ctx.fillStyle = '#120005';
    ctx.fillRect(0, 0, TAM, TAM);

    // Resplandor base desde abajo
    const grad = ctx.createLinearGradient(0, TAM, 0, 0);
    grad.addColorStop(0, 'rgba(200,60,10,0.7)');
    grad.addColorStop(0.5, 'rgba(160,30,5,0.3)');
    grad.addColorStop(1, 'rgba(60,5,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, TAM, TAM);

    // Columnas de llamas con alturas variables
    for (let px = 0; px < TAM; px++) {
        const h = 3 + Math.floor(ruido(px, 0, seed) * (TAM - 4));
        for (let py = TAM - 1; py >= TAM - h; py--) {
            const t = (TAM - py) / h; // 0=base, 1=punta
            const n = ruido(px, py, seed);
            if (n < 0.3) continue;

            // Rojo en la base, naranja en medio, amarillo en las puntas
            let r, g, b;
            if (t < 0.4) {
                r = 180 + Math.floor(n * 60);
                g = 25 + Math.floor(t * 90);
                b = 5;
            } else if (t < 0.7) {
                r = 220 + Math.floor(n * 35);
                g = 90 + Math.floor((t - 0.4) * 340);
                b = 10;
            } else {
                r = 255;
                g = 200 + Math.floor(n * 55);
                b = 40 + Math.floor((t - 0.7) * 160);
            }
            const alpha = (0.5 + n * 0.4) * (1 - t * 0.3);
            ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(2) + ')';
            ctx.fillRect(px, py, 1, 1);
        }
    }

    return c;
}

// --- API publica ---

export function iniciarTexturas() {
    texturas = {
        SUELO: [],
        PLATAFORMA: [],
        ABISMO: [],
    };

    for (let v = 0; v < VARIANTES; v++) {
        texturas.SUELO.push(generarSuelo(v));
        texturas.PLATAFORMA.push(generarPlataforma(v));
        texturas.ABISMO.push(generarFuego(v));
    }
}

export function obtenerTextura(tipo, variante) {
    if (!texturas) return null;
    const lista = texturas[tipo];
    if (!lista) return null;
    return lista[variante % VARIANTES];
}

export function limpiarTexturas() {
    texturas = null;
}
