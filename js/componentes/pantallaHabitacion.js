// Componente reutilizable para crear la pantalla base de una habitacion
// Encapsula el boilerplate comun: div pantalla, cabecera con boton huir y titulo

import { crearElemento } from '../utils.js';

/**
 * Crea la estructura base de una pantalla de habitacion.
 * @param {string} id - ID del div pantalla (ej: 'pantalla-habitacion1')
 * @param {string} clase - Clase CSS del div (ej: 'habitacion-1')
 * @param {string} titulo - Texto del titulo h2
 * @param {Function} onHuir - Callback al pulsar boton huir o Esc
 * @returns {{ pantalla: HTMLElement }}
 */
export function crearPantallaHabitacion(id, clase, titulo, onHuir) {
    const pantalla = document.createElement('div');
    pantalla.id = id;
    pantalla.className = clase;

    // Cabecera: boton huir + titulo
    const cabecera = crearElemento('div', 'cabecera-habitacion');

    const btnHuir = document.createElement('button');
    btnHuir.className = 'btn-huir';
    btnHuir.title = 'Huir al pasillo (Esc)';
    btnHuir.setAttribute('aria-label', 'Huir al pasillo');
    const imgHuir = document.createElement('img');
    imgHuir.src = 'assets/img/icons/btn-salir.webp';
    imgHuir.alt = '';
    imgHuir.className = 'btn-huir-icono';
    btnHuir.appendChild(imgHuir);
    btnHuir.addEventListener('click', onHuir);

    const tituloEl = crearElemento('h2', 'titulo-habitacion', titulo);

    cabecera.appendChild(btnHuir);
    cabecera.appendChild(tituloEl);
    pantalla.appendChild(cabecera);

    return { pantalla };
}
