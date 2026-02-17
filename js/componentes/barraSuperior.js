// Componente: Barra superior del jugador
// Muestra avatar, vida e inventario durante el juego

const ICONOS_ITEMS = {
    'llave-habitacion-2': '🔑',
    'llave-habitacion-3': '🔑',
};

export function crearBarraSuperior(contenedor) {
    // --- Crear estructura DOM ---

    const el = document.createElement('div');
    el.id = 'barra-superior';
    el.classList.add('oculto');

    // Jugador (avatar + nombre)
    const jugadorDiv = document.createElement('div');
    jugadorDiv.className = 'barra-jugador';

    const avatar = document.createElement('img');
    avatar.id = 'barra-avatar';

    const nombre = document.createElement('span');
    nombre.id = 'barra-nombre';

    jugadorDiv.appendChild(avatar);
    jugadorDiv.appendChild(nombre);

    // Barra de vida
    const vidaDiv = document.createElement('div');
    vidaDiv.className = 'barra-vida-jugador';

    const corazon = document.createElement('span');
    corazon.className = 'barra-vida-corazon';
    corazon.textContent = '\u2764\uFE0F';

    const barraFondo = document.createElement('div');
    barraFondo.className = 'barra-vida-fondo';

    const barraRelleno = document.createElement('div');
    barraRelleno.className = 'barra-vida-relleno';

    const vidaTexto = document.createElement('span');
    vidaTexto.className = 'barra-vida-texto';

    barraFondo.appendChild(barraRelleno);
    barraFondo.appendChild(vidaTexto);

    vidaDiv.appendChild(corazon);
    vidaDiv.appendChild(barraFondo);

    // Inventario
    const invDiv = document.createElement('div');
    invDiv.className = 'barra-inventario';

    const invLabel = document.createElement('span');
    invLabel.className = 'barra-inventario-label';
    invLabel.textContent = 'Items:';

    const invItems = document.createElement('div');
    invItems.className = 'barra-inventario-items';

    invDiv.appendChild(invLabel);
    invDiv.appendChild(invItems);

    // Ensamblar
    el.appendChild(jugadorDiv);
    el.appendChild(vidaDiv);
    el.appendChild(invDiv);
    contenedor.prepend(el);

    // --- API del componente ---

    const api = {
        mostrar: function (jugador) {
            avatar.src = jugador.img;
            avatar.alt = jugador.nombre;
            nombre.textContent = jugador.nombre;

            // Clase de color según personaje
            el.className = 'barra-superior';
            el.classList.add(jugador.clase.replace('jugador-', 'barra-'));

            api.actualizarVida(jugador);
            api.actualizarInventario(jugador);
        },

        ocultar: function () {
            el.classList.add('oculto');
        },

        actualizarVida: function (jugador) {
            const porcentaje = Math.round((jugador.vidaActual / jugador.vidaMax) * 100);
            barraRelleno.style.width = porcentaje + '%';
            vidaTexto.textContent = jugador.vidaActual + '/' + jugador.vidaMax;

            // Color dinámico: verde → amarillo → rojo
            if (porcentaje > 60) {
                barraRelleno.style.background = 'linear-gradient(90deg, #2ecc71, #6bfc86)';
            } else if (porcentaje > 30) {
                barraRelleno.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
            } else {
                barraRelleno.style.background = 'linear-gradient(90deg, #e74c3c, #e94560)';
            }

            // Estado de peligro (corazón late rápido)
            vidaDiv.classList.toggle('barra-vida-peligro', porcentaje <= 25);
        },

        actualizarInventario: function (jugador) {
            invItems.replaceChildren();

            if (jugador.inventario.length === 0) {
                const vacio = document.createElement('span');
                vacio.style.fontSize = '0.75rem';
                vacio.style.color = '#555';
                vacio.textContent = '—';
                invItems.appendChild(vacio);
                return;
            }

            jugador.inventario.forEach(function (item) {
                const span = document.createElement('span');
                span.className = 'inventario-item';
                span.textContent = ICONOS_ITEMS[item] || '📦';
                span.title = item;
                invItems.appendChild(span);
            });
        },
    };

    return api;
}
