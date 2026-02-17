// Componente de notificaciones toast
// Muestra mensajes breves en la parte superior de la pantalla

const TIPOS_TOAST = {
    item: { color: '#ffd700' }, // Dorado — items obtenidos
    dano: { color: '#e94560' }, // Rojo — daño recibido
    estado: { color: '#5eeadb' }, // Teal — efectos de estado
    exito: { color: '#6bfc86' }, // Verde — objetivos cumplidos
};

const MAX_TOASTS = 3;

export function lanzarToast(mensaje, icono, tipo, duracion) {
    document.dispatchEvent(
        new CustomEvent('toast', {
            detail: { mensaje, icono, tipo: tipo || 'item', duracion: duracion || 2500 },
        })
    );
}

export function crearToast() {
    const contenedor = document.createElement('div');
    contenedor.className = 'toast-contenedor';
    document.body.appendChild(contenedor);

    const activos = [];

    function mostrar({ mensaje, icono, tipo, duracion }) {
        const info = TIPOS_TOAST[tipo] || TIPOS_TOAST.item;

        // Si hay demasiados, quitar el más viejo
        if (activos.length >= MAX_TOASTS) {
            eliminar(activos[0]);
        }

        const el = document.createElement('div');
        el.className = 'toast';
        el.style.setProperty('--toast-color', info.color);
        el.innerHTML =
            '<span class="toast-icono">' +
            icono +
            '</span>' +
            '<span class="toast-mensaje">' +
            mensaje +
            '</span>';

        contenedor.appendChild(el);
        activos.push(el);

        // Auto-eliminar después de la duración
        setTimeout(function () {
            eliminar(el);
        }, duracion);
    }

    function eliminar(el) {
        const idx = activos.indexOf(el);
        if (idx === -1) return;
        activos.splice(idx, 1);
        el.classList.add('toast-salida');
        el.addEventListener('animationend', function () {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
    }

    // Escuchar eventos globales
    document.addEventListener('toast', function (e) {
        mostrar(e.detail);
    });

    return { mostrar };
}
