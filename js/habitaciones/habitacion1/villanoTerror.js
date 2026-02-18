// Villano Terror — Enemigo de tier "terror" que aparece tras un countdown
// Persigue al jugador usando el mismo pathfinding BFS que el Trasgo

import { ENEMIGOS } from '../../enemigos.js';
import { mezclar } from '../../laberinto.js';
import { CONFIG, est, getCeldaJugador, aplicarDanoJugador } from './estado.js';
import { calcularCamino } from './trasgo.js';
import { lanzarToast } from '../../componentes/toast.js';

// Filtra enemigos de tier terror
function obtenerEnemigosTerror() {
    const lista = [];
    for (const key in ENEMIGOS) {
        if (ENEMIGOS[key].tier === 'terror') {
            lista.push(ENEMIGOS[key]);
        }
    }
    return lista;
}

// Posición aleatoria lejos del jugador (50-80% de distancia máxima)
function posicionInicialTerror() {
    const celdaJ = getCeldaJugador();
    const cola = [[celdaJ.fila, celdaJ.col, 0]];
    let idx = 0;
    const distancias = {};
    distancias[celdaJ.fila + ',' + celdaJ.col] = 0;
    const dirs = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
    ];
    let maxDist = 0;

    while (idx < cola.length) {
        const actual = cola[idx++];
        const f = actual[0],
            c = actual[1],
            d = actual[2];
        if (d > maxDist) maxDist = d;

        for (let i = 0; i < dirs.length; i++) {
            const nf = f + dirs[i][0],
                nc = c + dirs[i][1];
            const key = nf + ',' + nc;
            if (
                nf >= 0 &&
                nf < CONFIG.FILAS &&
                nc >= 0 &&
                nc < CONFIG.COLS &&
                est.mapa[nf][nc] === 0 &&
                !(key in distancias)
            ) {
                distancias[key] = d + 1;
                cola.push([nf, nc, d + 1]);
            }
        }
    }

    // Elegir celdas a 50-80% de la distancia máxima (más lejos que el Trasgo)
    const distMin = Math.floor(maxDist * 0.5);
    const distMax = Math.floor(maxDist * 0.8);
    const candidatas = [];

    // Celda del Trasgo para evitarla
    const trasgoF = est.trasgo
        ? Math.floor((est.trasgo.posY + CONFIG.TAM_TRASGO / 2) / CONFIG.TAM_CELDA)
        : -1;
    const trasgoC = est.trasgo
        ? Math.floor((est.trasgo.posX + CONFIG.TAM_TRASGO / 2) / CONFIG.TAM_CELDA)
        : -1;

    for (const key in distancias) {
        const dist = distancias[key];
        if (dist >= distMin && dist <= distMax) {
            const partes = key.split(',');
            const f = parseInt(partes[0]),
                c = parseInt(partes[1]);
            if (f % 2 === 1 && c % 2 === 1) {
                // Evitar entrada, llave y posición del Trasgo
                if (f === est.entradaFila && c === est.entradaCol) continue;
                if (f === est.llaveFila && c === est.llaveCol) continue;
                if (f === trasgoF && c === trasgoC) continue;
                candidatas.push([f, c]);
            }
        }
    }

    mezclar(candidatas);
    return candidatas.length > 0 ? candidatas[0] : [1, CONFIG.COLS - 2];
}

// Inicializa el villano terror
function iniciarVillanoTerror() {
    const enemigos = obtenerEnemigosTerror();
    if (enemigos.length === 0) return;

    mezclar(enemigos);
    const datos = enemigos[0];
    const pos = posicionInicialTerror();

    // Escala visual según estatura del villano (misma referencia que el jugador)
    const ESCALA_BASE = 1.45;
    const ESTATURA_REF = 1.55;
    const escalaVisual = ESCALA_BASE * (datos.estatura / ESTATURA_REF);

    est.villanoTerror = {
        datos: datos,
        posX: pos[1] * CONFIG.TAM_CELDA + (CONFIG.TAM_CELDA - CONFIG.TAM_TERROR) / 2,
        posY: pos[0] * CONFIG.TAM_CELDA + (CONFIG.TAM_CELDA - CONFIG.TAM_TERROR) / 2,
        camino: [],
        ultimoGolpe: 0,
        ultimoPathfinding: 0,
        escalaVisual: escalaVisual,
        elemento: null,
    };

    // Renderizar el villano
    renderizarVillanoTerror();

    // Toast de alerta
    lanzarToast('¡' + datos.nombre + ' ha aparecido!', '💀', 'dano');
}

// Renderiza el villano terror en el laberinto
function renderizarVillanoTerror() {
    if (!est.villanoTerror) return;

    const datos = est.villanoTerror.datos;
    const elem = document.createElement('div');
    elem.className = 'terror-laberinto terror-aparicion';
    elem.style.width = CONFIG.TAM_TERROR + 'px';
    elem.style.height = CONFIG.TAM_TERROR + 'px';
    elem.style.transform =
        'translate(' +
        est.villanoTerror.posX +
        'px, ' +
        est.villanoTerror.posY +
        'px) scale(' +
        est.villanoTerror.escalaVisual +
        ')';

    const img = document.createElement('img');
    img.src = datos.img;
    img.alt = datos.nombre;
    elem.appendChild(img);
    est.contenedorLaberinto.appendChild(elem);
    est.villanoTerror.elemento = elem;

    // Quitar clase de animación de aparición después de que termine
    setTimeout(function () {
        elem.classList.remove('terror-aparicion');
    }, 500);
}

// Actualiza pathfinding, movimiento y colisión del villano terror (cada frame)
export function actualizarVillanoTerror() {
    if (!est.villanoTerror) return;

    const ahora = Date.now();

    // Recalcular ruta periódicamente
    if (ahora - est.villanoTerror.ultimoPathfinding >= CONFIG.INTERVALO_PATHFINDING_TERROR) {
        est.villanoTerror.ultimoPathfinding = ahora;

        const celdaV = {
            fila: Math.floor((est.villanoTerror.posY + CONFIG.TAM_TERROR / 2) / CONFIG.TAM_CELDA),
            col: Math.floor((est.villanoTerror.posX + CONFIG.TAM_TERROR / 2) / CONFIG.TAM_CELDA),
        };
        const celdaJ = getCeldaJugador();
        est.villanoTerror.camino = calcularCamino(celdaV.fila, celdaV.col, celdaJ.fila, celdaJ.col);
    }

    // Velocidad escalada por atributo del enemigo (6 = referencia del Trasgo)
    const velocidad = CONFIG.VELOCIDAD_TERROR * (est.villanoTerror.datos.velocidad / 6);

    // Mover hacia el siguiente punto del camino
    if (est.villanoTerror.camino.length > 0) {
        const objetivo = est.villanoTerror.camino[0];
        const targetX = objetivo[1] * CONFIG.TAM_CELDA + (CONFIG.TAM_CELDA - CONFIG.TAM_TERROR) / 2;
        const targetY = objetivo[0] * CONFIG.TAM_CELDA + (CONFIG.TAM_CELDA - CONFIG.TAM_TERROR) / 2;

        const dx = targetX - est.villanoTerror.posX;
        const dy = targetY - est.villanoTerror.posY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= velocidad) {
            est.villanoTerror.posX = targetX;
            est.villanoTerror.posY = targetY;
            est.villanoTerror.camino.shift();
        } else {
            est.villanoTerror.posX += (dx / dist) * velocidad;
            est.villanoTerror.posY += (dy / dist) * velocidad;
        }

        est.villanoTerror.elemento.style.transform =
            'translate(' +
            est.villanoTerror.posX +
            'px, ' +
            est.villanoTerror.posY +
            'px) scale(' +
            est.villanoTerror.escalaVisual +
            ')';
    }

    // Detectar colisión con jugador
    detectarColisionTerror();
}

// Si el villano toca al jugador, ataca con uno de sus ataques
function detectarColisionTerror() {
    const ahora = Date.now();
    if (ahora - est.villanoTerror.ultimoGolpe < CONFIG.COOLDOWN_TERROR) return;

    const solapan =
        est.villanoTerror.posX < est.posX + CONFIG.TAM_JUGADOR &&
        est.villanoTerror.posX + CONFIG.TAM_TERROR > est.posX &&
        est.villanoTerror.posY < est.posY + CONFIG.TAM_JUGADOR &&
        est.villanoTerror.posY + CONFIG.TAM_TERROR > est.posY;

    if (solapan) {
        const ataques = est.villanoTerror.datos.ataques;
        const ataque = ataques[Math.floor(Math.random() * ataques.length)];
        est.villanoTerror.ultimoGolpe = ahora;
        aplicarDanoJugador(ataque.dano);
        lanzarToast(
            est.villanoTerror.datos.nombre + ' — ' + ataque.nombre + ' (-' + ataque.dano + ')',
            '💀',
            'dano'
        );
    }
}

// --- Countdown: anillo arcano ---

const CIRCUNFERENCIA = 2 * Math.PI * 42; // r=42 en el SVG viewBox 0 0 100 100
const SVG_NS = 'http://www.w3.org/2000/svg';

// Crea la estructura DOM del countdown con anillo SVG
function crearCountdownDOM() {
    const contenedor = document.createElement('div');
    contenedor.className = 'countdown-terror';

    // Wrapper del anillo
    const wrap = document.createElement('div');
    wrap.className = 'countdown-anillo-wrap';

    // SVG con dos círculos: pista + progreso
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'countdown-anillo');
    svg.setAttribute('viewBox', '0 0 100 100');

    const pista = document.createElementNS(SVG_NS, 'circle');
    pista.setAttribute('class', 'countdown-pista');
    pista.setAttribute('cx', '50');
    pista.setAttribute('cy', '50');
    pista.setAttribute('r', '42');

    const progreso = document.createElementNS(SVG_NS, 'circle');
    progreso.setAttribute('class', 'countdown-progreso');
    progreso.setAttribute('cx', '50');
    progreso.setAttribute('cy', '50');
    progreso.setAttribute('r', '42');
    progreso.style.strokeDasharray = CIRCUNFERENCIA;
    progreso.style.strokeDashoffset = '0';

    svg.appendChild(pista);
    svg.appendChild(progreso);
    wrap.appendChild(svg);

    // Número central
    const numero = document.createElement('div');
    numero.className = 'countdown-numero';

    wrap.appendChild(numero);
    contenedor.appendChild(wrap);

    // Subtítulo
    const texto = document.createElement('div');
    texto.className = 'countdown-texto';
    texto.textContent = 'Amenaza inminente';
    contenedor.appendChild(texto);

    est.contenedorLaberinto.appendChild(contenedor);
    return contenedor;
}

// Actualiza el anillo y el número
function actualizarCountdownVisual(elem) {
    const numero = elem.querySelector('.countdown-numero');
    const progreso = elem.querySelector('.countdown-progreso');

    // Actualizar número con animación de tick
    numero.textContent = est.tiempoRestante;
    numero.classList.remove('countdown-tick');
    void numero.offsetWidth; // forzar reflow
    numero.classList.add('countdown-tick');

    // Deplecionar anillo: de 0 (lleno) a CIRCUNFERENCIA (vacío)
    const fraccionRestante = est.tiempoRestante / CONFIG.COUNTDOWN_TERROR;
    progreso.style.strokeDashoffset = CIRCUNFERENCIA * (1 - fraccionRestante);

    // Últimos 3 segundos: modo urgente
    if (est.tiempoRestante <= 3) {
        elem.classList.add('countdown-urgente');
    }
}

// Inicia el countdown que libera un villano terror
export function iniciarCountdown() {
    est.tiempoRestante = CONFIG.COUNTDOWN_TERROR;
    const elem = crearCountdownDOM();
    actualizarCountdownVisual(elem);

    est.countdownTerror = setInterval(function () {
        est.tiempoRestante--;

        if (est.tiempoRestante <= 0) {
            clearInterval(est.countdownTerror);
            est.countdownTerror = null;

            // Animación de salida, luego remover
            elem.classList.add('countdown-salida');
            setTimeout(function () {
                if (elem.parentNode) elem.parentNode.removeChild(elem);
            }, 500);

            // Liberar villano terror
            if (est.activo) {
                iniciarVillanoTerror();
            }
        } else {
            actualizarCountdownVisual(elem);
        }
    }, 1000);
}

// Limpieza completa
export function limpiarVillanoTerror() {
    if (est.countdownTerror) {
        clearInterval(est.countdownTerror);
        est.countdownTerror = null;
    }
    est.villanoTerror = null;
    est.tiempoRestante = 0;
}
