// Componente: Modal de derrota (game over)
// Se muestra cuando el jugador pierde toda su vida
// Reutilizable en cualquier habitación/etapa
// Se monta dentro del contenedor que recibe en mostrar()

export function crearModalDerrota() {
    let callbackAceptar = null;

    // --- Crear estructura DOM ---

    const el = document.createElement('div');
    el.className = 'modal-derrota oculto';

    const fondo = document.createElement('div');
    fondo.className = 'modal-derrota-fondo';

    const contenido = document.createElement('div');
    contenido.className = 'modal-derrota-caja';

    const icono = document.createElement('div');
    icono.className = 'modal-derrota-icono';
    icono.textContent = '💀';

    const titulo = document.createElement('h2');
    titulo.textContent = 'Has sido derrotado...';

    const mensaje = document.createElement('p');

    const btnAceptar = document.createElement('button');
    btnAceptar.className = 'modal-derrota-btn';
    btnAceptar.textContent = 'Volver a intentar';

    contenido.appendChild(icono);
    contenido.appendChild(titulo);
    contenido.appendChild(mensaje);
    contenido.appendChild(btnAceptar);
    el.appendChild(fondo);
    el.appendChild(contenido);

    // --- Funciones internas ---

    function cerrar() {
        el.classList.add('oculto');
        // Quitar del DOM al cerrar
        if (el.parentNode) el.parentNode.removeChild(el);
        if (callbackAceptar) callbackAceptar();
    }

    // --- Eventos ---

    btnAceptar.addEventListener('click', cerrar);
    fondo.addEventListener('click', cerrar);

    // --- API del componente ---

    const api = {
        // contenedor: elemento DOM donde montar el modal (ej: pantalla de habitación)
        mostrar: function (nombreJugador, contenedor) {
            mensaje.textContent = nombreJugador
                ? nombreJugador + ' no sobrevivió a La Casa del Terror.'
                : 'No sobreviviste a La Casa del Terror.';
            contenedor.appendChild(el);
            el.classList.remove('oculto');
        },

        estaAbierto: function () {
            return !el.classList.contains('oculto');
        },

        manejarTecla: function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                cerrar();
            }
        },

        onAceptar: function (callback) {
            callbackAceptar = callback;
        },
    };

    return api;
}
