// Componente: Modal de preview de libro
// Muestra portada, título, subtítulo y botón "Abrir" antes de abrir el libro completo

import { crearElemento } from '../utils.js';

/**
 * Crea el modal de preview.
 * @param {HTMLElement} contenedor - Elemento donde montar el modal
 * @returns {{ mostrar: Function, cerrar: Function, estaAbierto: Function, onAbrir: Function }}
 */
export function crearModalPrevia(contenedor) {
    let callbackAbrir = null;
    let libroActivo = null;

    // --- Estructura DOM ---
    const overlay = crearElemento('div', 'modal-previa oculto');

    const fondo = crearElemento('div', 'modal-previa-fondo');
    overlay.appendChild(fondo);

    const caja = crearElemento('div', 'modal-previa-caja');

    const imgPortada = document.createElement('img');
    imgPortada.className = 'modal-previa-portada';
    imgPortada.alt = '';
    caja.appendChild(imgPortada);

    const tituloEl = crearElemento('h2', 'modal-previa-titulo');
    caja.appendChild(tituloEl);

    const subtituloEl = crearElemento('p', 'modal-previa-subtitulo');
    caja.appendChild(subtituloEl);

    const btnAbrir = crearElemento('button', 'modal-previa-btn', 'Abrir');
    btnAbrir.type = 'button';
    caja.appendChild(btnAbrir);

    overlay.appendChild(caja);
    contenedor.appendChild(overlay);

    // --- Funciones ---

    function mostrar(datos) {
        libroActivo = datos.id;
        imgPortada.src = datos.portada || '';
        imgPortada.alt = datos.titulo || '';
        tituloEl.textContent = datos.titulo || '';
        subtituloEl.textContent = datos.subtitulo || '';
        overlay.classList.remove('oculto');
        document.addEventListener('keydown', manejarTeclado);
    }

    function cerrar() {
        overlay.classList.add('oculto');
        libroActivo = null;
        document.removeEventListener('keydown', manejarTeclado);
    }

    function manejarTeclado(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            cerrar();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            btnAbrir.click();
        }
    }

    // --- Eventos ---

    fondo.addEventListener('click', cerrar);

    btnAbrir.addEventListener('click', function () {
        const id = libroActivo;
        cerrar();
        if (callbackAbrir) callbackAbrir(id);
    });

    return {
        mostrar: mostrar,
        cerrar: cerrar,
        estaAbierto: function () {
            return !overlay.classList.contains('oculto');
        },
        onAbrir: function (cb) {
            callbackAbrir = cb;
        },
    };
}
