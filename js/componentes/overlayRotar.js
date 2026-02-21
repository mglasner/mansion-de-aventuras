// Componente: Overlay "gira tu dispositivo"
// Muestra un overlay fullscreen en portrait pidiendo rotar a landscape.
// Solo activo en dispositivos touch. Usa matchMedia para detectar orientacion.

export function crearOverlayRotar() {
    const esTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!esTouch) {
        return {
            activar() {},
            desactivar() {},
            estaVisible() {
                return false;
            },
        };
    }

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay-rotar oculto';

    const icono = document.createElement('div');
    icono.className = 'overlay-rotar-icono';
    icono.textContent = '📱';

    const mensaje = document.createElement('p');
    mensaje.className = 'overlay-rotar-mensaje';
    mensaje.textContent = 'Gira tu dispositivo';

    overlay.appendChild(icono);
    overlay.appendChild(mensaje);
    document.body.appendChild(overlay);

    let mediaQuery = null;
    let onChangeCallback = null;

    function alCambiarOrientacion(e) {
        const esLandscape = !e.matches; // matches = portrait
        if (esLandscape) {
            overlay.classList.add('oculto');
        } else {
            overlay.classList.remove('oculto');
        }
        if (onChangeCallback) onChangeCallback(esLandscape);
    }

    function activar(onChange) {
        onChangeCallback = onChange || null;
        mediaQuery = window.matchMedia('(orientation: portrait)');
        mediaQuery.addEventListener('change', alCambiarOrientacion);

        // Estado inicial
        if (mediaQuery.matches) {
            overlay.classList.remove('oculto');
        } else {
            overlay.classList.add('oculto');
        }
    }

    function desactivar() {
        if (mediaQuery) {
            mediaQuery.removeEventListener('change', alCambiarOrientacion);
            mediaQuery = null;
        }
        onChangeCallback = null;
        overlay.classList.add('oculto');

        try {
            screen.orientation.unlock();
        } catch {
            // API no disponible
        }

        // Remover del DOM
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    function estaVisible() {
        return !overlay.classList.contains('oculto');
    }

    return { activar, desactivar, estaVisible };
}
