// Habitacion 4 — El Abismo: Enemigos patrulla y boss
// Esbirros: 1 stomp = derrotado
// Boss: multiples stomps, fases de velocidad, barra de vida

import { CFG } from './config.js';
import { resolverColisionX, resolverColisionY, esSolido, enSuelo } from './fisicas.js';
import { ENEMIGOS } from '../../enemigos.js';
import {
    obtenerSpriteEnemigo,
    obtenerSpriteEnemigoSheet,
    obtenerColorBossFase,
    iniciarSpritesEnemigo,
} from './spritesPlat.js';

const TAM = CFG.tiles.tamano;
const ENE = CFG.enemigos;
const BOSS = CFG.boss;
const COL = CFG.render;

// --- Pool de esbirros disponibles ---

const ESBIRROS = Object.values(ENEMIGOS).filter(function (e) {
    return e.tier === 'esbirro';
});

// --- Clase Enemigo Platformer ---

function crearEnemigo(col, fila, esBoss) {
    const ancho = esBoss ? 18 : 12;
    const alto = esBoss ? 18 : 12;

    // Seleccionar un esbirro aleatorio o el boss
    let datos;
    let vidaMax;

    if (esBoss) {
        // Buscar un elite para el boss
        const elites = Object.values(ENEMIGOS).filter(function (e) {
            return e.tier === 'elite';
        });
        datos = elites[Math.floor(Math.random() * elites.length)];
        vidaMax = datos ? datos.vidaMax : 100;
    } else {
        datos = ESBIRROS.length > 0 ? ESBIRROS[Math.floor(Math.random() * ESBIRROS.length)] : null;
        vidaMax = 1; // 1 stomp = derrotado
    }

    // Determinar nombre legible
    let nombre = 'Esbirro';
    if (datos) {
        nombre = datos.nombre;
    } else if (esBoss) {
        nombre = 'Boss';
    }

    // Cargar sprite sheet del enemigo (si existe)
    iniciarSpritesEnemigo(nombre);

    return {
        x: col * TAM + (TAM - ancho) / 2,
        y: fila * TAM + (TAM - alto),
        ancho,
        alto,
        vx: 0,
        vy: 0,
        direccion: 1,
        velocidad: esBoss ? BOSS.velocidadBase : ENE.velocidadPatrulla,
        esBoss,
        vivo: true,
        vidaActual: vidaMax,
        vidaMax,
        datos,
        nombre,
        framesMuerte: 0,
        cooldownAtaque: 0,
        frameAnim: 0,
        contadorAnim: 0,
    };
}

let enemigos = [];
let bossVivo = true;

export function iniciarEnemigos(spawnsEnemigos, spawnBoss) {
    enemigos = [];
    bossVivo = true;

    // Crear esbirros
    for (let i = 0; i < spawnsEnemigos.length; i++) {
        const spawn = spawnsEnemigos[i];
        enemigos.push(crearEnemigo(spawn.col, spawn.fila, false));
    }

    // Crear boss
    if (spawnBoss) {
        enemigos.push(crearEnemigo(spawnBoss.col, spawnBoss.fila, true));
    }
}

export function actualizarEnemigos() {
    for (let i = 0; i < enemigos.length; i++) {
        const e = enemigos[i];
        if (!e.vivo) {
            // Animacion de muerte
            if (e.framesMuerte > 0) {
                e.framesMuerte--;
            }
            continue;
        }

        if (e.cooldownAtaque > 0) e.cooldownAtaque--;

        // Movimiento de patrulla
        let vel = e.velocidad;

        // Boss: aumentar velocidad segun fase
        if (e.esBoss && e.vidaMax > 0) {
            const ratio = e.vidaActual / e.vidaMax;
            if (ratio <= BOSS.fasesCambio[1]) {
                vel *= BOSS.velocidadFases[1];
            } else if (ratio <= BOSS.fasesCambio[0]) {
                vel *= BOSS.velocidadFases[0];
            }
        }

        e.vx = vel * e.direccion;

        // Colision horizontal
        const nuevaX = resolverColisionX(e.x, e.y, e.ancho, e.alto, e.vx);
        if (nuevaX === e.x && e.vx !== 0) {
            // Choco con pared: girar
            e.direccion *= -1;
        } else {
            // Verificar precipicio adelante
            const bordeX = e.direccion > 0 ? nuevaX + e.ancho + 2 : nuevaX - 2;
            const pieY = e.y + e.alto + 2;
            if (!esSolido(bordeX, pieY) && enSuelo(e.x, e.y, e.ancho, e.alto)) {
                // Precipicio: girar
                e.direccion *= -1;
            } else {
                e.x = nuevaX;
            }
        }

        // Gravedad
        e.vy += CFG.fisicas.gravedad;
        if (e.vy > CFG.fisicas.velocidadMaxCaida) e.vy = CFG.fisicas.velocidadMaxCaida;

        const resY = resolverColisionY(e.x, e.y, e.ancho, e.alto, e.vy);
        e.y = resY.y;
        e.vy = resY.vy;

        // Animacion (ciclo de 12 para soportar 2 y 4 frames)
        e.contadorAnim++;
        if (e.contadorAnim >= 10) {
            e.contadorAnim = 0;
            e.frameAnim = (e.frameAnim + 1) % 12;
        }
    }
}

// Constantes de sprite sheet para centrado (48×60 sobre hitbox)
const SPRITE_W = 48;
const SPRITE_H = 60;

export function renderizarEnemigos(ctx, camaraX) {
    for (let i = 0; i < enemigos.length; i++) {
        const e = enemigos[i];

        // Animacion de muerte: encogimiento
        if (!e.vivo) {
            if (e.framesMuerte > 0) {
                const escala = e.framesMuerte / 20;
                ctx.globalAlpha = escala;

                // Si tiene sprite sheet, encoger el sprite completo
                const sheetSprite = obtenerSpriteEnemigoSheet(e.nombre, 'golpeado', 0);
                if (sheetSprite) {
                    const sw = Math.round(SPRITE_W * escala);
                    const sh = Math.round(SPRITE_H * escala);
                    const sx = Math.round(
                        e.x - camaraX - (SPRITE_W - e.ancho) / 2 + (SPRITE_W * (1 - escala)) / 2
                    );
                    const sy = Math.round(e.y - (SPRITE_H - e.alto) + SPRITE_H * (1 - escala));
                    ctx.drawImage(sheetSprite, sx, sy, sw, sh);
                } else {
                    const drawX = Math.round(e.x - camaraX + (e.ancho * (1 - escala)) / 2);
                    const drawY = Math.round(e.y + e.alto * (1 - escala));
                    const w = Math.round(e.ancho * escala);
                    const h = Math.round(e.alto * escala);
                    ctx.fillStyle = e.esBoss ? COL.colorBoss : COL.colorEnemigo;
                    ctx.fillRect(drawX, drawY, w, h);
                }
                ctx.globalAlpha = 1;
            }
            continue;
        }

        const hitboxX = Math.round(e.x - camaraX);
        const hitboxY = Math.round(e.y);

        // Estado de animacion
        const estadoAnim = Math.abs(e.vx) > 0.1 ? 'patrulla' : 'idle';

        // Intentar sprite sheet primero
        const spriteSheet = obtenerSpriteEnemigoSheet(e.nombre, estadoAnim, e.frameAnim);
        if (spriteSheet) {
            // Centrar sprite 48×60 sobre hitbox (pies alineados, centrado horizontal)
            const offX = hitboxX - (SPRITE_W - e.ancho) / 2;
            const offY = hitboxY - (SPRITE_H - e.alto);
            ctx.save();
            if (e.direccion < 0) {
                ctx.translate(offX + SPRITE_W, offY);
                ctx.scale(-1, 1);
                ctx.drawImage(spriteSheet, 0, 0);
            } else {
                ctx.drawImage(spriteSheet, offX, offY);
            }
            ctx.restore();
            continue;
        }

        // Fallback: sprite procedural
        let colorActual = e.esBoss ? COL.colorBoss : COL.colorEnemigo;
        if (e.esBoss && e.vidaMax > 0) {
            colorActual = obtenerColorBossFase(e.vidaActual / e.vidaMax);
        }

        const sprite = obtenerSpriteEnemigo(
            colorActual,
            e.ancho,
            e.alto,
            e.esBoss,
            estadoAnim,
            e.frameAnim
        );

        if (sprite) {
            ctx.save();
            if (e.direccion < 0) {
                ctx.translate(hitboxX + e.ancho, hitboxY);
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, 0, 0);
            } else {
                ctx.drawImage(sprite, hitboxX, hitboxY);
            }
            ctx.restore();
        } else {
            // Fallback ultimo: rectangulo basico
            ctx.fillStyle = colorActual;
            ctx.fillRect(hitboxX, hitboxY, e.ancho, e.alto);

            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(hitboxX, hitboxY, e.ancho, 2);

            const ojoY = hitboxY + (e.esBoss ? 5 : 3);
            ctx.fillStyle = '#fff';
            if (e.direccion > 0) {
                ctx.fillRect(hitboxX + e.ancho - 5, ojoY, 2, 2);
                ctx.fillRect(hitboxX + e.ancho - 9, ojoY, 2, 2);
            } else {
                ctx.fillRect(hitboxX + 3, ojoY, 2, 2);
                ctx.fillRect(hitboxX + 7, ojoY, 2, 2);
            }
        }
    }
}

// Obtener enemigos vivos para deteccion de colisiones
export function obtenerEnemigosVivos() {
    const vivos = [];
    for (let i = 0; i < enemigos.length; i++) {
        if (enemigos[i].vivo) vivos.push(enemigos[i]);
    }
    return vivos;
}

// Danar enemigo por stomp — retorna { bossDestruido, cambioFase }
export function stomperEnemigo(enemigo, dano) {
    if (!enemigo.vivo) return { bossDestruido: false, cambioFase: false };

    if (enemigo.esBoss) {
        // Detectar fase actual antes del dano
        const ratioAntes = enemigo.vidaActual / enemigo.vidaMax;
        let faseAntes = 0;
        if (ratioAntes <= BOSS.fasesCambio[1]) faseAntes = 2;
        else if (ratioAntes <= BOSS.fasesCambio[0]) faseAntes = 1;

        enemigo.vidaActual -= dano;
        if (enemigo.vidaActual <= 0) {
            enemigo.vidaActual = 0;
            enemigo.vivo = false;
            enemigo.framesMuerte = 20;
            bossVivo = false;
            return { bossDestruido: true, cambioFase: false };
        }

        // Detectar cambio de fase
        const ratioDespues = enemigo.vidaActual / enemigo.vidaMax;
        let faseDespues = 0;
        if (ratioDespues <= BOSS.fasesCambio[1]) faseDespues = 2;
        else if (ratioDespues <= BOSS.fasesCambio[0]) faseDespues = 1;

        return { bossDestruido: false, cambioFase: faseDespues > faseAntes };
    }

    // Esbirro: 1 stomp = derrotado
    enemigo.vivo = false;
    enemigo.framesMuerte = 20;
    return { bossDestruido: false, cambioFase: false };
}

export function esBossVivo() {
    return bossVivo;
}

export function obtenerDanoEnemigo(enemigo) {
    if (!enemigo.datos || !enemigo.datos.ataques || enemigo.datos.ataques.length === 0) {
        return 10;
    }
    return enemigo.datos.ataques[0].dano;
}

// Obtener info del boss para el HUD
export function obtenerInfoBoss() {
    for (let i = 0; i < enemigos.length; i++) {
        const e = enemigos[i];
        if (e.esBoss && e.vivo) {
            return {
                nombre: e.nombre,
                vidaActual: e.vidaActual,
                vidaMax: e.vidaMax,
                x: e.x,
                y: e.y,
                ancho: e.ancho,
                alto: e.alto,
            };
        }
    }
    return null;
}

export function limpiarEnemigos() {
    enemigos = [];
    bossVivo = true;
}
