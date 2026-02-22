// Componente: Libro de Juegos
// Usa crearLibro() para mostrar los 4 desafíos con selector de héroe y botón Jugar

import { crearElemento } from '../utils.js';
import { PERSONAJES } from '../personajes.js';
import { crearLibro } from './libro.js';

// Datos de los 4 juegos con descripciones completas
const JUEGOS = {
    1: {
        nombre: 'El Laberinto',
        nivel: 1,
        img: 'assets/img/habitaciones/habitacion1.webp',
        accent: '#bb86fc',
        parrafos: [
            '¡Bienvenido al laberinto más enredado de todos! Sus pasillos oscuros esconden una llave mágica que necesitas para escapar.',
            'Camina con cuidado entre las paredes sombrías. Dicen que algunos aventureros se perdieron durante horas buscando la salida...',
            '¡Cuidado! Si te cruzas con enemigos podrías perder vida.',
        ],
        tip: 'Explora cada rincón. La llave podría estar donde menos lo esperas.',
    },
    2: {
        nombre: 'El Laberinto 3D',
        nivel: 2,
        img: 'assets/img/habitaciones/habitacion2.webp',
        accent: '#6bfc86',
        parrafos: [
            '¡El laberinto ha cobrado vida en tres dimensiones! Las paredes se alzan a tu alrededor y el camino se vuelve aún más confuso.',
            'Esta vez no ves el mapa completo. Solo puedes ver lo que hay frente a ti. ¿Podrás encontrar la salida sin perderte?',
            'Ten cuidado con los enemigos que acechan en los pasillos, ¡pueden hacerte daño!',
        ],
        tip: 'Mantén la calma y recuerda por dónde viniste.',
    },
    3: {
        nombre: 'El Memorice',
        nivel: 3,
        img: 'assets/img/habitaciones/habitacion3.webp',
        accent: '#e94560',
        parrafos: [
            'En esta habitación encontrarás un tablero con cartas misteriosas boca abajo. Cada par de cartas esconde un secreto.',
            'Encuentra todos los pares para desbloquear el pasaje. ¡Pero cuidado! Cada intento fallido despierta la curiosidad de los villanos.',
            '¡Buenas noticias! Cada par que descubras te devuelve un poco de vida. ¡Es el momento perfecto para recuperarte!',
        ],
        tip: 'Tu mejor arma aquí es la memoria. Concéntrate y recuerda cada carta.',
    },
    4: {
        nombre: 'El Abismo',
        nivel: 4,
        img: 'assets/img/habitaciones/habitacion4.webp',
        accent: '#5eeadb',
        parrafos: [
            'Un abismo sin fondo se extiende ante ti. Plataformas flotantes son tu único camino. ¡Un paso en falso y caerás al vacío!',
            'Esbirros patrullan las plataformas y un temible boss te espera al final. Salta sobre los enemigos para derrotarlos, pero cuidado con tocarlos de lado.',
            'Derrota al boss para abrir la salida y conseguir la llave.',
        ],
        tip: 'Salta sobre los enemigos para hacerles daño. Usa las plataformas y no mires abajo.',
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
            accent: j.accent,
        };
    });
    return entidades;
}

// Genera la página descriptiva de un juego (imagen, nombre, nivel, párrafos, tip)
function generarPaginaHabitacion(hab) {
    const contenido = crearElemento('div', 'libro-detalle-contenido libro-habitacion');

    if (hab.img) {
        const img = document.createElement('img');
        img.src = hab.img;
        img.alt = hab.nombre;
        img.className = 'libro-habitacion-img';
        contenido.appendChild(img);
    }

    contenido.appendChild(crearElemento('h3', 'libro-habitacion-nombre', hab.nombre));
    contenido.appendChild(crearElemento('span', 'libro-habitacion-nivel', 'Nivel ' + hab.nivel));
    contenido.appendChild(crearElemento('div', 'libro-ornamento'));

    const desc = crearElemento('div', 'libro-habitacion-desc');
    hab.parrafos.forEach(function (texto) {
        desc.appendChild(crearElemento('p', null, texto));
    });
    contenido.appendChild(desc);

    const tip = crearElemento('div', 'libro-habitacion-tip');
    tip.appendChild(crearElemento('span', 'libro-habitacion-tip-icono', '\uD83D\uDCA1'));
    tip.appendChild(document.createTextNode(hab.tip));
    contenido.appendChild(tip);

    return contenido;
}

// Genera la página de detalle de un juego: descripción larga + selector de héroe
function generarDetalleJuego(nombre, _tabAnterior, onJugar) {
    const entidades = adaptarJuegos();
    const datos = entidades[nombre];
    const numJuego = datos.numero;
    const juego = JUEGOS[numJuego];

    // Usar generarPaginaHabitacion para el contenido descriptivo
    const contenido = generarPaginaHabitacion(juego);

    // Agregar selector de héroe debajo de la descripción
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

// Genera la página de prólogo del Libro de Juegos
function generarPrologoJuegos() {
    const contenido = crearElemento('div', 'libro-detalle-contenido libro-intro');

    contenido.appendChild(crearElemento('h2', 'libro-intro-game-titulo', 'Libro de Juegos'));
    contenido.appendChild(crearElemento('div', 'libro-ornamento'));

    const texto = crearElemento('div', 'libro-intro-texto');
    texto.appendChild(
        crearElemento(
            'p',
            null,
            'En estas páginas encontrarás los desafíos que aguardan a todo aventurero valiente. Cada juego es una prueba única que pondrá a prueba tu ingenio, memoria y reflejos.'
        )
    );
    texto.appendChild(
        crearElemento(
            'p',
            null,
            'Elige un desafío del índice, escoge a tu héroe favorito y lánzate a la aventura. No importa cuántas veces lo intentes: cada partida es una nueva oportunidad.'
        )
    );
    texto.appendChild(
        crearElemento('p', 'libro-intro-cta', '¡Abre el índice y elige tu primer desafío!')
    );
    contenido.appendChild(texto);

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
        paginaInicio: {
            textoIndice: '\u2726 Prólogo',
            textoSeccion: 'Prólogo',
            generarContenido: generarPrologoJuegos,
        },
        ordenar: function (nombres) {
            // Mantener orden por número de juego
            return nombres.slice().sort(function (a, b) {
                return entidades[a].numero - entidades[b].numero;
            });
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
