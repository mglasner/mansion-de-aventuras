// Componente: Libro de Juegos
// Usa crearLibro() para mostrar los 4 desafíos con selector de héroe y botón Jugar

import { crearElemento } from '../utils.js';
import { PERSONAJES } from '../personajes.js';
import { crearLibro } from './libro.js';

// Datos de los 4 juegos (antes en modalPuerta.js como HABITACIONES)
const JUEGOS = {
    1: {
        nombre: 'El Laberinto',
        img: 'assets/img/habitaciones/habitacion1.webp',
        descripcion: 'Un laberinto de piedra te espera... ¿encontrarás la salida?',
        accent: '#bb86fc',
    },
    2: {
        nombre: 'El Laberinto 3D',
        img: 'assets/img/habitaciones/habitacion2.webp',
        descripcion: 'Las paredes se mueven y los pasillos no tienen fin...',
        accent: '#6bfc86',
    },
    3: {
        nombre: 'El Memorice',
        img: 'assets/img/habitaciones/habitacion3.webp',
        descripcion: 'Cartas boca abajo cubren la mesa... ¿podrás recordar dónde está cada par?',
        accent: '#e94560',
    },
    4: {
        nombre: 'El Abismo',
        img: 'assets/img/habitaciones/habitacion4.webp',
        descripcion: 'Se escuchan ecos desde las profundidades...',
        accent: '#5eeadb',
    },
};

// Adaptador: convierte JUEGOS a formato de entidades para crearLibro
function adaptarJuegos() {
    const entidades = {};
    Object.keys(JUEGOS).forEach(function (num) {
        const j = JUEGOS[num];
        entidades[j.nombre] = {
            img: j.img,
            clase: 'juego-' + num,
            numero: num,
            descripcion: j.descripcion,
            accent: j.accent,
        };
    });
    return entidades;
}

// Genera la página de detalle de un juego con selector de héroe
function generarDetalleJuego(nombre, _tabAnterior, onJugar) {
    const entidades = adaptarJuegos();
    const datos = entidades[nombre];
    const contenido = crearElemento('div', 'libro-detalle-contenido libro-juego-detalle');

    // Ilustración del juego
    if (datos.img) {
        const img = document.createElement('img');
        img.src = datos.img;
        img.alt = nombre;
        img.className = 'libro-juego-img';
        contenido.appendChild(img);
    }

    // Título y descripción
    contenido.appendChild(crearElemento('h3', 'libro-juego-nombre', nombre));
    contenido.appendChild(crearElemento('div', 'libro-ornamento'));
    contenido.appendChild(crearElemento('p', 'libro-juego-desc', datos.descripcion));

    // Selector de héroe
    const selectorLabel = crearElemento('p', 'libro-juego-selector-label', 'Elige tu héroe:');
    contenido.appendChild(selectorLabel);

    const selector = crearElemento('div', 'selector-heroe');
    let heroeElegido = null;

    const nombresPj = Object.keys(PERSONAJES);
    nombresPj.forEach(function (pjNombre) {
        const pj = PERSONAJES[pjNombre];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'selector-heroe-btn';
        btn.title = pjNombre;

        const avatar = document.createElement('img');
        avatar.src = pj.img;
        avatar.alt = pjNombre;
        avatar.className = 'selector-heroe-avatar';
        btn.appendChild(avatar);

        const label = crearElemento('span', 'selector-heroe-nombre', pjNombre);
        btn.appendChild(label);

        btn.addEventListener('click', function () {
            heroeElegido = pjNombre;
            selector.querySelectorAll('.selector-heroe-btn').forEach(function (b) {
                b.classList.remove('selector-heroe-activo');
            });
            btn.classList.add('selector-heroe-activo');
            btnJugar.disabled = false;
        });

        selector.appendChild(btn);
    });
    contenido.appendChild(selector);

    // Botón Jugar
    const btnJugar = crearElemento('button', 'libro-juego-btn-jugar', 'Jugar');
    btnJugar.type = 'button';
    btnJugar.disabled = true;

    btnJugar.addEventListener('click', function () {
        if (heroeElegido && onJugar) {
            onJugar(datos.numero, heroeElegido);
        }
    });
    contenido.appendChild(btnJugar);

    return contenido;
}

/**
 * Crea el Libro de Juegos.
 * @param {HTMLElement} contenedor - Elemento donde montar (no se usa directamente, el libro se retorna)
 * @param {Function} onJugar - Callback (numeroJuego, nombrePersonaje)
 * @returns {{ libro: HTMLElement, manejarTecladoLibro: Function, destruir: Function }}
 */
export function crearLibroJuegos(contenedor, onJugar) {
    const entidades = adaptarJuegos();

    const { libro, manejarTecladoLibro } = crearLibro({
        entidades: entidades,
        generarDetalle: function (nombre, tabAnterior) {
            return generarDetalleJuego(nombre, tabAnterior, onJugar);
        },
        claseRaiz: 'libro-juegos',
        titulo: 'Libro de Juegos',
        subtitulo: 'Los desafíos te esperan',
        tituloEntidades: 'Desafíos',
        ordenar: function (nombres) {
            // Mantener orden por número de juego
            return nombres.slice().sort(function (a, b) {
                return entidades[a].numero - entidades[b].numero;
            });
        },
        crearItemIndice: function (nombre, datos) {
            const iconos = {
                1: '\uD83D\uDDDD\uFE0F',
                2: '\uD83C\uDF00',
                3: '\uD83C\uDCCF',
                4: '\uD83C\uDF0A',
            };
            return (iconos[datos.numero] || '') + ' ' + nombre;
        },
    });

    return {
        libro: libro,
        manejarTecladoLibro: manejarTecladoLibro,
        destruir: function () {
            libro.remove();
        },
    };
}
