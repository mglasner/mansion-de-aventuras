// Eventos globales del juego
// Centraliza los dispatchEvent para comunicacion habitaciones → juego.js

/** Notifica a juego.js que la vida del jugador cambio (actualiza barra superior) */
export function notificarVidaCambio() {
    document.dispatchEvent(new Event('vida-cambio'));
}

/** Notifica a juego.js que el inventario cambio (actualiza barra superior) */
export function notificarInventarioCambio() {
    document.dispatchEvent(new Event('inventario-cambio'));
}

/** Notifica a juego.js que el jugador murio (muestra modal de derrota) */
export function notificarJugadorMuerto() {
    document.dispatchEvent(new Event('jugador-muerto'));
}
