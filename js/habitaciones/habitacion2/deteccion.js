// Habitación 2 — Detección de llave y salida

import { CFG } from './config.js';
import { est, actualizarHUDInventarioLocal } from './estado.js';
import { lanzarToast } from '../../componentes/toast.js';

export function detectarLlave() {
    if (est.tieneLlave) return;

    const celdaX = Math.floor(est.posicion.x);
    const celdaY = Math.floor(est.posicion.y);

    if (celdaY === est.llaveFila && celdaX === est.llaveCol) {
        est.tieneLlave = true;
        est.indicador.replaceChildren();
        const imgObtenida = document.createElement('img');
        imgObtenida.src = 'assets/img/llaves/llave-laberinto3d.webp';
        imgObtenida.alt = '';
        imgObtenida.className = 'indicador-llave-img';
        est.indicador.appendChild(imgObtenida);
        est.indicador.appendChild(document.createTextNode(' ' + CFG.textos.indicadorLlaveObtenida));
        est.indicador.classList.add('llave-obtenida');

        actualizarHUDInventarioLocal();
        lanzarToast(CFG.textos.toastLlave, '\uD83D\uDD11', 'item');
    }
}

export function detectarSalida(limpiarHabitacion2) {
    if (!est.tieneLlave) return;

    const celdaX = Math.floor(est.posicion.x);
    const celdaY = Math.floor(est.posicion.y);

    if (celdaY === est.entradaFila && celdaX === est.entradaCol) {
        est.activo = false;
        est.mensajeExito.textContent = CFG.textos.mensajeExito;
        est.mensajeExito.classList.remove('oculto');
        lanzarToast(CFG.textos.mensajeExito, '\uD83D\uDEAA', 'exito');

        setTimeout(function () {
            limpiarHabitacion2();
            est.callbackSalir();
        }, CFG.meta.timeoutExito);
    }
}
