// Código principal — Biblioteca de aventuras
import { PERSONAJES } from './personajes.js';
import { ENEMIGOS } from './enemigos.js';
import { iniciarHabitacion1, limpiarHabitacion1 } from './habitaciones/habitacion1/index.js';
import { iniciarHabitacion2, limpiarHabitacion2 } from './habitaciones/habitacion2/index.js';
import { iniciarHabitacion3, limpiarHabitacion3 } from './habitaciones/habitacion3/index.js';
import { iniciarHabitacion4, limpiarHabitacion4 } from './habitaciones/habitacion4/index.js';
import { crearBarraSuperior } from './componentes/barraSuperior.js';
import { crearModalDerrota } from './componentes/modalDerrota.js';
import { crearModalSalir } from './componentes/modalSalir.js';
import { crearTransicion } from './componentes/transicion.js';
import { crearControlesTouch } from './componentes/controlesTouch.js';
import { crearToast } from './componentes/toast.js';
import { crearEstante } from './componentes/estante.js';
import { crearModalPrevia } from './componentes/modalPrevia.js';
import { crearLibroJuegos } from './componentes/libroJuegos.js';
import { crearModalLibro } from './componentes/modalLibro.js';
import { crearLibro } from './componentes/libro.js';
import {
    generarDetalleHeroe,
    generarIntro,
    adaptarEntidades,
    HABITACIONES_HEROARIO,
} from './componentes/libroHeroes.js';
import {
    generarDetalleVillano,
    ordenarPorTier,
    textoItemIndice,
    necesitaSeparador,
    ORDEN_TIER,
} from './componentes/libroVillanos.js';
import { TIERS } from './componentes/stats.js';

// --- Estados del juego (máquina de estados) ---

const ESTADOS = {
    BIBLIOTECA: 'BIBLIOTECA',
    LIBRO: 'LIBRO',
    JUEGO: 'JUEGO',
};

// Registro dinámico de habitaciones: { "1": { iniciar, limpiar }, ... }
const habitaciones = {};

function registrarHabitacion(numero, modulo) {
    habitaciones[numero] = modulo;
}

registrarHabitacion('1', { iniciar: iniciarHabitacion1, limpiar: limpiarHabitacion1 });
registrarHabitacion('2', { iniciar: iniciarHabitacion2, limpiar: limpiarHabitacion2 });
registrarHabitacion('3', { iniciar: iniciarHabitacion3, limpiar: limpiarHabitacion3 });
registrarHabitacion('4', { iniciar: iniciarHabitacion4, limpiar: limpiarHabitacion4 });

// --- Estado del juego ---

const estado = {
    estadoActual: ESTADOS.BIBLIOTECA,
    jugadorActual: null, // instancia de Personaje
    habitacionActual: null, // número de la habitación activa
    libroActivo: null, // id del libro abierto ('heroario', 'villanario', 'juegos')
};

// --- Crear componentes base ---

const contenedorJuego = document.getElementById('juego');
const contenedorBiblioteca = document.getElementById('biblioteca');
const barra = crearBarraSuperior(contenedorJuego);
const modalDerrota = crearModalDerrota();
const modalSalir = crearModalSalir(contenedorJuego);
const transicion = crearTransicion();
const dpad = crearControlesTouch();
const toast = crearToast();

// --- Configuración de libros del estante ---

const LIBROS_ESTANTE = [
    {
        id: 'heroario',
        titulo: 'Heroario',
        color: '#c8a050',
        icono: '\u2694\uFE0F',
        portada: 'assets/img/portada-heroario.webp',
        subtitulo: 'La enciclopedia de los héroes',
    },
    {
        id: 'villanario',
        titulo: 'Villanario',
        color: '#8b3a62',
        icono: '\uD83D\uDC7E',
        portada: 'assets/img/portada-villanario.webp',
        subtitulo: 'La enciclopedia de villanos',
    },
    {
        id: 'juegos',
        titulo: 'Libro de Juegos',
        color: '#4a7c59',
        icono: '\uD83C\uDFAE',
        portada: 'assets/img/portada-juegos.webp',
        subtitulo: 'Los desafíos te esperan',
    },
];

// --- Modal de preview ---

const modalPrevia = crearModalPrevia(contenedorJuego);

modalPrevia.onAbrir(function (libroId) {
    cambiarEstado(ESTADOS.LIBRO, { libroId: libroId });
});

// --- Estante (homepage) ---

const estante = crearEstante(
    contenedorBiblioteca,
    LIBROS_ESTANTE.map(function (cfg) {
        return {
            id: cfg.id,
            titulo: cfg.titulo,
            color: cfg.color,
            icono: cfg.icono,
            onClick: function () {
                modalPrevia.mostrar({
                    id: cfg.id,
                    portada: cfg.portada,
                    titulo: cfg.titulo,
                    subtitulo: cfg.subtitulo,
                });
            },
        };
    })
);

// --- Cache de modales de libros (se crean on-demand, una vez) ---

const librosCache = {};

function crearHeroarioModal() {
    const entidades = adaptarEntidades();
    const heroario = crearLibro({
        entidades: entidades,
        generarDetalle: generarDetalleHeroe,
        claseRaiz: 'libro-heroes',
        titulo: 'Heroario',
        subtitulo: 'La enciclopedia de los héroes',
        paginasExtras: HABITACIONES_HEROARIO,
        tituloExtras: 'Desafíos',
        tituloEntidades: 'Héroes',
        paginaInicio: {
            textoIndice: '\u2726 Bienvenida',
            textoSeccion: 'Bienvenida',
            generarContenido: generarIntro,
        },
    });
    const modal = crearModalLibro(heroario.libro, heroario.manejarTecladoLibro);
    contenedorJuego.appendChild(modal.overlay);
    return modal;
}

function crearVillanarioModal() {
    const villanario = crearLibro({
        entidades: ENEMIGOS,
        generarDetalle: generarDetalleVillano,
        claseRaiz: 'libro-villanos',
        ordenar: ordenarPorTier,
        crearItemIndice: textoItemIndice,
        crearSeparador: necesitaSeparador,
        titulo: 'Villanario',
        subtitulo: 'La enciclopedia de villanos',
        gruposEntidades: ORDEN_TIER.map(function (tier) {
            return { id: tier, texto: TIERS[tier].emoji + ' ' + TIERS[tier].label };
        }),
        getGrupoEntidad: function (nombre, datos) {
            return datos.tier || 'esbirro';
        },
    });
    const modal = crearModalLibro(villanario.libro, villanario.manejarTecladoLibro);
    contenedorJuego.appendChild(modal.overlay);
    return modal;
}

function crearJuegosModal() {
    const juegos = crearLibroJuegos(contenedorJuego, function (numeroJuego, nombrePersonaje) {
        // Cerrar el modal del libro y luego iniciar el juego
        const modalJuegos = librosCache['juegos'];
        if (modalJuegos) modalJuegos.cerrar();
        iniciarJuego(numeroJuego, nombrePersonaje);
    });
    const modal = crearModalLibro(juegos.libro, juegos.manejarTecladoLibro);
    contenedorJuego.appendChild(modal.overlay);
    return modal;
}

function obtenerModalLibro(libroId) {
    if (librosCache[libroId]) return librosCache[libroId];

    let modal;
    if (libroId === 'heroario') {
        modal = crearHeroarioModal();
    } else if (libroId === 'villanario') {
        modal = crearVillanarioModal();
    } else if (libroId === 'juegos') {
        modal = crearJuegosModal();
    }

    if (modal) librosCache[libroId] = modal;
    return modal;
}

// --- Escuchar cambios de vida (trampas, combate, etc.) ---

document.addEventListener('vida-cambio', function () {
    if (estado.jugadorActual) {
        barra.actualizarVida(estado.jugadorActual);
    }
});

// Escuchar muerte del jugador
document.addEventListener('jugador-muerto', function () {
    if (!estado.jugadorActual) return;

    const pantallaHabitacion = estado.habitacionActual
        ? document.getElementById('pantalla-habitacion' + estado.habitacionActual)
        : null;
    const contenedorModal = pantallaHabitacion || contenedorJuego;
    modalDerrota.mostrar(estado.jugadorActual.nombre, contenedorModal);
});

// --- Máquina de estados: transiciones centralizadas ---

function elegirTransicion(anterior, nuevo) {
    if (nuevo === ESTADOS.JUEGO) return 'iris';
    if (anterior === ESTADOS.JUEGO) return 'iris';
    return 'fade';
}

function ejecutarCambioEstado(anterior, nuevo, datos) {
    // Salir del estado anterior
    if (anterior === ESTADOS.JUEGO) {
        const hab = habitaciones[estado.habitacionActual];
        if (hab) hab.limpiar();
        dpad.ocultar();
        estado.habitacionActual = null;
        estado.jugadorActual = null;
        barra.ocultar();
    }

    estado.estadoActual = nuevo;

    // Entrar al nuevo estado
    if (nuevo === ESTADOS.BIBLIOTECA) {
        estante.mostrar();
        estado.libroActivo = null;
    } else if (nuevo === ESTADOS.LIBRO) {
        estante.mostrar(); // El estante permanece visible detrás del modal

        const libroId = datos.libroId;
        estado.libroActivo = libroId;

        const modal = obtenerModalLibro(libroId);
        if (modal) {
            modal.onCerrar(function () {
                if (estado.estadoActual === ESTADOS.LIBRO) {
                    estado.estadoActual = ESTADOS.BIBLIOTECA;
                    estado.libroActivo = null;
                }
            });
            modal.abrir();
        }
    } else if (nuevo === ESTADOS.JUEGO) {
        estante.ocultar();

        const hab = habitaciones[datos.numero];
        if (!hab) return;

        estado.habitacionActual = datos.numero;
        estado.jugadorActual = PERSONAJES[datos.personaje];
        // Resetear vida para el juego
        estado.jugadorActual.vidaActual = estado.jugadorActual.vidaMax;
        estado.jugadorActual.inventario = [];

        barra.mostrar(estado.jugadorActual);

        hab.iniciar(
            estado.jugadorActual,
            function () {
                // Al salir del juego, volver al Libro de Juegos
                cambiarEstado(ESTADOS.LIBRO, { libroId: 'juegos' });
            },
            dpad
        );
    }
}

function cambiarEstado(nuevo, datos) {
    const anterior = estado.estadoActual;

    // Transiciones solo entre juego y otros estados
    if (nuevo === ESTADOS.JUEGO || anterior === ESTADOS.JUEGO) {
        const estilo = elegirTransicion(anterior, nuevo);
        toast.limpiar();
        transicion.ejecutar(estilo, function () {
            ejecutarCambioEstado(anterior, nuevo, datos);
        });
    } else {
        // Cambios entre BIBLIOTECA y LIBRO son instantáneos (modal)
        ejecutarCambioEstado(anterior, nuevo, datos);
    }
}

// --- Iniciar un juego ---

function iniciarJuego(numeroJuego, nombrePersonaje) {
    cambiarEstado(ESTADOS.JUEGO, { numero: numeroJuego, personaje: nombrePersonaje });
}

// --- Modal de salir (desde dentro de un juego) ---

modalSalir.onConfirmar(function () {
    cambiarEstado(ESTADOS.BIBLIOTECA);
});

// Callback del modal de derrota
modalDerrota.onAceptar(function () {
    cambiarEstado(ESTADOS.BIBLIOTECA);
});

// --- Controles del teclado ---

document.addEventListener('keydown', function (e) {
    if (modalDerrota.estaAbierto()) {
        modalDerrota.manejarTecla(e);
        return;
    }
    if (modalSalir.estaAbierto()) {
        modalSalir.manejarTecla(e);
        return;
    }
});

// --- Inicializar: mostrar biblioteca ---

estante.mostrar();
