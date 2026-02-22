// Modal reutilizable para mostrar un libro con overlay, fondo click-to-close y botón cerrar

import { crearElemento } from '../utils.js';

// Crea un modal con overlay, fondo click-to-close, botón cerrar y libro dentro
export function crearModalLibro(libro, manejarTecladoLibro) {
    const overlay = crearElemento('div', 'libro-modal oculto');

    const fondo = crearElemento('div', 'libro-modal-fondo');
    overlay.appendChild(fondo);

    const cuerpo = crearElemento('div', 'libro-modal-cuerpo');

    const btnCerrar = crearElemento('button', 'libro-modal-cerrar', '\u00D7');
    btnCerrar.type = 'button';
    cuerpo.appendChild(btnCerrar);

    cuerpo.appendChild(libro);
    overlay.appendChild(cuerpo);

    let tecladoActivo = false;
    let callbackCerrar = null;

    function manejarTeclado(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            cerrar();
        }
    }

    function abrir() {
        overlay.classList.remove('oculto');
        document.addEventListener('keydown', manejarTeclado);
        document.addEventListener('keydown', manejarTecladoLibro);
        tecladoActivo = true;
    }

    function cerrar() {
        overlay.classList.add('oculto');
        if (tecladoActivo) {
            document.removeEventListener('keydown', manejarTeclado);
            document.removeEventListener('keydown', manejarTecladoLibro);
            tecladoActivo = false;
        }
        if (callbackCerrar) callbackCerrar();
    }

    function estaAbierto() {
        return !overlay.classList.contains('oculto');
    }

    function onCerrar(cb) {
        callbackCerrar = cb;
    }

    fondo.addEventListener('click', cerrar);
    btnCerrar.addEventListener('click', cerrar);

    return { overlay, abrir, cerrar, estaAbierto, onCerrar };
}
