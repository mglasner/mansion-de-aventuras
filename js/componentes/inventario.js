// Componente reutilizable: Inventario con slots de llaves
// Usado por barraSuperior (pasillo/habitaciones) y HUD in-canvas (habitación 4)

export const ITEMS_INFO = {
    'llave-habitacion-2': {
        img: 'assets/img/llaves/llave-laberinto.webp',
        color: '#bb86fc',
        slot: 0,
    },
    'llave-habitacion-3': {
        img: 'assets/img/llaves/llave-laberinto3d.webp',
        color: '#6bfc86',
        slot: 1,
    },
    'llave-habitacion-4': {
        img: 'assets/img/llaves/llave-memorice.webp',
        color: '#e94560',
        slot: 2,
    },
    'llave-habitacion-5': { img: 'assets/img/llaves/llave-abismo.webp', color: '#5eeadb', slot: 3 },
};

export const TOTAL_SLOTS = 4;

export function crearInventario(opciones = {}) {
    const { claseExtra = '' } = opciones;

    const el = document.createElement('div');
    el.className = 'barra-inventario' + (claseExtra ? ' ' + claseExtra : '');

    const slots = [];
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventario-slot';
        el.appendChild(slot);
        slots.push(slot);
    }

    function actualizar(inventario) {
        // Resetear todos los slots
        slots.forEach(function (slot) {
            slot.className = 'inventario-slot';
            slot.replaceChildren();
            slot.style.removeProperty('--slot-color');
        });

        // Llenar los slots que tienen items
        inventario.forEach(function (item) {
            const info = ITEMS_INFO[item];
            if (!info) return;
            const slot = slots[info.slot];
            slot.classList.add('inventario-slot-lleno');
            const img = document.createElement('img');
            img.src = info.img;
            img.alt = item;
            img.className = 'inventario-item-img';
            slot.appendChild(img);
            slot.style.setProperty('--slot-color', info.color);
        });
    }

    return { el, actualizar };
}
