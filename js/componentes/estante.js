// Componente: Estante de biblioteca (homepage)
// Renderiza un mueble de madera con lomos de libros clickeables

import { crearElemento } from '../utils.js';

/**
 * Crea el estante de la biblioteca.
 * @param {HTMLElement} contenedor - Elemento donde montar el estante
 * @param {Array<{id: string, titulo: string, color: string, icono: string, onClick: Function}>} libros
 * @returns {{ mostrar: Function, ocultar: Function, destruir: Function }}
 */
export function crearEstante(contenedor, libros) {
    const el = crearElemento('div', 'estante oculto');

    // Título del mueble
    const titulo = crearElemento('h1', 'estante-titulo', 'Biblioteca');
    el.appendChild(titulo);

    // Repisa con lomos
    const repisa = crearElemento('div', 'estante-repisa');

    libros.forEach(function (libro) {
        const lomo = document.createElement('button');
        lomo.type = 'button';
        lomo.className = 'estante-lomo';
        lomo.dataset.libro = libro.id;
        lomo.style.setProperty('--lomo-color', libro.color);

        // Icono del libro
        if (libro.icono) {
            const icono = crearElemento('span', 'estante-lomo-icono', libro.icono);
            lomo.appendChild(icono);
        }

        // Título vertical
        const tituloLomo = crearElemento('span', 'estante-lomo-titulo', libro.titulo);
        lomo.appendChild(tituloLomo);

        lomo.addEventListener('click', function () {
            if (libro.onClick) libro.onClick();
        });

        repisa.appendChild(lomo);
    });

    el.appendChild(repisa);

    // Sombra inferior del mueble
    el.appendChild(crearElemento('div', 'estante-sombra'));

    contenedor.appendChild(el);

    return {
        mostrar: function () {
            el.classList.remove('oculto');
        },
        ocultar: function () {
            el.classList.add('oculto');
        },
        destruir: function () {
            el.remove();
        },
    };
}
