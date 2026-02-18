// HUD de primera persona — Brazos/manos del personaje estilo Doom
// Dibuja proceduralmente sobre el canvas 3D

import { canvas } from './config.js';

// --- Constantes ---

const DEDOS = [
    { x: -9, ancho: 5.5, largo: 16, curva: -1.5 }, // Índice
    { x: -3, ancho: 6, largo: 18, curva: -0.5 }, // Medio
    { x: 3.5, ancho: 5.5, largo: 16, curva: 0.5 }, // Anular
    { x: 9, ancho: 4.5, largo: 13, curva: 1.5 }, // Meñique
];

// --- Estado interno ---

let _config = null;
let _fase = 0;
let _faseBob = 0;
let _flinchIntensidad = 0;

// --- Helpers de color ---

function oscurecerColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const f = 1 - factor;
    return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
}

function esColorOscuro(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Luminancia relativa simplificada
    return r * 0.299 + g * 0.587 + b * 0.114 < 100;
}

// --- Subfunciones de dibujo ---

function dibujarManga(ctx, e, config) {
    const grad = ctx.createLinearGradient(0, -2 * e, 0, 8 * e);
    grad.addColorStop(0, config.colorHud);
    grad.addColorStop(1, config.colorHudClaro);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-18 * e, -2 * e);
    ctx.lineTo(18 * e, -2 * e);
    ctx.lineTo(16 * e, 8 * e);
    ctx.lineTo(-16 * e, 8 * e);
    ctx.closePath();
    ctx.fill();

    // Borde inferior decorativo
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1.5 * e;
    ctx.beginPath();
    ctx.moveTo(-16 * e, 8 * e);
    ctx.lineTo(16 * e, 8 * e);
    ctx.stroke();
}

function dibujarAntebrazo(ctx, e, config) {
    const grad = ctx.createLinearGradient(0, 8 * e, 0, 70 * e);
    grad.addColorStop(0, config.colorHudClaro);
    grad.addColorStop(1, config.colorHud);

    ctx.fillStyle = grad;
    ctx.beginPath();
    // Lado izquierdo (exterior, convexo — músculo)
    ctx.moveTo(-16 * e, 8 * e);
    ctx.bezierCurveTo(-20 * e, 25 * e, -18 * e, 50 * e, -12 * e, 70 * e);
    // Base
    ctx.lineTo(12 * e, 70 * e);
    // Lado derecho (interior, más recto)
    ctx.bezierCurveTo(16 * e, 50 * e, 17 * e, 25 * e, 16 * e, 8 * e);
    ctx.closePath();
    ctx.fill();

    // Contorno sutil
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1 * e;
    ctx.stroke();
}

function dibujarSombraAntebrazo(ctx, e) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    // Sombra en el borde interior del antebrazo
    ctx.moveTo(10 * e, 12 * e);
    ctx.bezierCurveTo(14 * e, 30 * e, 15 * e, 50 * e, 11 * e, 68 * e);
    ctx.lineTo(12 * e, 70 * e);
    ctx.bezierCurveTo(16 * e, 50 * e, 17 * e, 25 * e, 16 * e, 8 * e);
    ctx.lineTo(10 * e, 12 * e);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function dibujarMuneca(ctx, e, config) {
    const colorOscuro = oscurecerColor(config.colorPiel, 0.15);
    const grad = ctx.createRadialGradient(0, 72 * e, 2 * e, 0, 72 * e, 10 * e);
    grad.addColorStop(0, config.colorPiel);
    grad.addColorStop(1, colorOscuro);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 72 * e, 12 * e, 4 * e, 0, 0, Math.PI * 2);
    ctx.fill();
}

function dibujarPalma(ctx, e, config) {
    ctx.fillStyle = config.colorPiel;
    ctx.beginPath();
    // Trapezoide con esquinas redondeadas
    ctx.moveTo(-10 * e, 76 * e);
    ctx.quadraticCurveTo(-13 * e, 76 * e, -13 * e, 79 * e);
    ctx.lineTo(-12 * e, 86 * e);
    ctx.quadraticCurveTo(-12 * e, 89 * e, -9 * e, 89 * e);
    ctx.lineTo(9 * e, 89 * e);
    ctx.quadraticCurveTo(12 * e, 89 * e, 12 * e, 86 * e);
    ctx.lineTo(13 * e, 79 * e);
    ctx.quadraticCurveTo(13 * e, 76 * e, 10 * e, 76 * e);
    ctx.closePath();
    ctx.fill();

    // Borde sutil
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 0.8 * e;
    ctx.stroke();
}

function dibujarDedos(ctx, e, config) {
    const oscura = esColorOscuro(config.colorPiel);
    const bordeColor = oscura ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)';

    for (const dedo of DEDOS) {
        const dx = dedo.x * e;
        const w = (dedo.ancho / 2) * e;
        const h = dedo.largo * e;
        const curv = dedo.curva * e;
        const baseY = 89 * e;

        ctx.fillStyle = config.colorPiel;
        ctx.beginPath();
        // Lado izquierdo del dedo (curva)
        ctx.moveTo(dx - w, baseY);
        ctx.quadraticCurveTo(dx - w + curv * 0.3, baseY + h * 0.5, dx - w * 0.6 + curv, baseY + h);
        // Punta redondeada
        ctx.quadraticCurveTo(dx + curv, baseY + h + 3 * e, dx + w * 0.6 + curv, baseY + h);
        // Lado derecho del dedo (curva)
        ctx.quadraticCurveTo(dx + w + curv * 0.3, baseY + h * 0.5, dx + w, baseY);
        ctx.closePath();
        ctx.fill();

        // Borde del dedo
        ctx.strokeStyle = bordeColor;
        ctx.lineWidth = 0.7 * e;
        ctx.stroke();
    }

    // Sombras entre dedos
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.8 * e;
    for (let i = 0; i < DEDOS.length - 1; i++) {
        const d1 = DEDOS[i];
        const d2 = DEDOS[i + 1];
        const midX = ((d1.x + d1.ancho / 2 + d2.x - d2.ancho / 2) / 2) * e;
        ctx.beginPath();
        ctx.moveTo(midX, 89 * e);
        ctx.lineTo(midX, 93 * e);
        ctx.stroke();
    }
    ctx.restore();
}

function dibujarNudillos(ctx, e, config) {
    const oscura = esColorOscuro(config.colorPiel);
    const color = oscura ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.12)';

    ctx.fillStyle = color;
    // 3 semicírculos sobre la palma (posiciones de nudillos)
    const nudillosX = [-6, 0.5, 7];
    for (const nx of nudillosX) {
        ctx.beginPath();
        ctx.arc(nx * e, 88 * e, 2.5 * e, Math.PI, 0);
        ctx.fill();
    }
}

function dibujarHighlight(ctx, e, config) {
    const oscura = esColorOscuro(config.colorPiel);
    const alpha = oscura ? 0.15 : 0.08;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, 82 * e, 6 * e, 4 * e, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// --- Función principal de mano ---

function dibujarMano(ctx, x, y, espejo, config, escala) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(espejo, -1); // flip vertical: dedos apuntan arriba

    const e = escala * 0.75; // comprimir anatomía

    dibujarManga(ctx, e, config);
    dibujarAntebrazo(ctx, e, config);
    dibujarSombraAntebrazo(ctx, e);
    dibujarMuneca(ctx, e, config);
    dibujarPalma(ctx, e, config);
    dibujarDedos(ctx, e, config);
    dibujarNudillos(ctx, e, config);
    dibujarHighlight(ctx, e, config);

    ctx.restore();
}

function dibujarArma(ctx, x, y, config, escala) {
    const tamano = Math.min(canvas.alto * 0.08, 40) * escala;
    ctx.font = tamano + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.emojiHud, x, y);
}

// --- API pública ---

export function inicializarHUD(jugador) {
    _config = jugador.colorHud ? jugador : null;
    _fase = 0;
    _faseBob = 0;
    _flinchIntensidad = 0;
}

export function actualizarHUD(teclas, flashDano) {
    if (!_config) return;

    // deltaTime aproximado (~16ms a 60fps)
    const dt = 0.016;

    // Idle sway (siempre activo)
    _fase += dt;

    // Walk bobbing
    const camina = teclas.ArrowUp || teclas.ArrowDown;
    if (camina) {
        _faseBob += dt * 8;
    } else {
        _faseBob *= 0.9;
    }

    // Flinch de daño
    _flinchIntensidad = flashDano > 0 ? flashDano / 6 : 0;
}

export function renderizarHUD(ctx) {
    if (!_config) return;

    const escala = canvas.alto / 400;
    const centroX = canvas.ancho / 2;
    const baseY = canvas.alto;

    // Offsets de animación
    const idleY = Math.sin(_fase * 1.5) * 3 * escala;

    const bobX = Math.cos(_faseBob * 0.5) * 3 * escala;
    const bobAlterna = Math.sin(_faseBob) * 10 * escala;

    const flinchX = _flinchIntensidad * (Math.random() - 0.5) * 20 * escala;
    const flinchY = _flinchIntensidad * 15 * escala;

    const offsetX = bobX + flinchX;
    const offsetY = idleY + flinchY;

    // Posiciones de las manos (±10% del centro)
    const separacion = canvas.ancho * 0.1;
    const manoIzqX = centroX - separacion + offsetX;
    const manoDerX = centroX + separacion + offsetX;
    const manoBaseY = baseY + 15 * escala + offsetY;

    // Dibujar brazos y manos (alternando largo al caminar)
    dibujarMano(ctx, manoIzqX, manoBaseY + bobAlterna, 1, _config, escala);
    dibujarMano(ctx, manoDerX, manoBaseY - bobAlterna, -1, _config, escala);

    // Arma/objeto entre las manos
    const armaY = baseY - 45 * escala + offsetY;
    dibujarArma(ctx, centroX + offsetX, armaY, _config, escala);
}

export function limpiarHUD() {
    _config = null;
    _fase = 0;
    _faseBob = 0;
    _flinchIntensidad = 0;
}
