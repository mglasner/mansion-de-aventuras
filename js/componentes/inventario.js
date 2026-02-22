// Componente reutilizable: Inventario de items
// Los juegos son independientes: sin llaves secuenciales

export const ITEMS_INFO = {};

export const TOTAL_SLOTS = 0;

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
