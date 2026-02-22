// Habitación 3 — El Memorice: componente de carta individual

/**
 * Crea un elemento DOM de carta para el memorice.
 * @param {Object} data - { id, pairId, nombre, img, tipo }
 * @returns {Object} API: { el, data, voltear(), deshacer(), marcarEncontrada(), desactivar() }
 */
export function crearCarta(data) {
    let volteada = false;
    let encontrada = false;

    // Contenedor principal
    const el = document.createElement('div');
    el.className = 'memorice-carta';
    if (data.tipo === 'villano') {
        el.classList.add('memorice-carta-villano');
    }
    el.dataset.id = data.id;

    // Inner (para el flip 3D)
    const inner = document.createElement('div');
    inner.className = 'memorice-carta-inner';

    // Front (cara visible al voltear): imagen + nombre
    const front = document.createElement('div');
    front.className = 'memorice-carta-front';

    const img = document.createElement('img');
    img.src = data.img;
    img.alt = data.nombre;
    img.draggable = false;

    const nombre = document.createElement('span');
    nombre.className = 'memorice-carta-nombre';
    nombre.textContent = data.nombre;

    front.appendChild(img);
    front.appendChild(nombre);

    // Back (boca abajo): ícono del memorice
    const back = document.createElement('div');
    back.className = 'memorice-carta-back';

    const imgBack = document.createElement('img');
    imgBack.src = 'assets/img/habitaciones/habitacion3.webp';
    imgBack.alt = 'El Memorice';
    imgBack.draggable = false;
    back.appendChild(imgBack);

    inner.appendChild(front);
    inner.appendChild(back);
    el.appendChild(inner);

    function voltear() {
        if (volteada || encontrada) return;
        volteada = true;
        el.classList.add('memorice-volteada');
    }

    function deshacer() {
        if (!volteada || encontrada) return;
        volteada = false;
        el.classList.remove('memorice-volteada');
    }

    function marcarEncontrada() {
        encontrada = true;
        el.classList.add('memorice-encontrada');
    }

    function desactivar() {
        el.classList.add('memorice-desactivada');
    }

    return {
        el,
        data,
        get volteada() {
            return volteada;
        },
        get encontrada() {
            return encontrada;
        },
        voltear,
        deshacer,
        marcarEncontrada,
        desactivar,
    };
}
