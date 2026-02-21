// Utilidades compartidas

/**
 * Crea un elemento DOM con clase y texto opcionales.
 * @param {string} tag - Tipo de elemento (ej: 'div', 'p', 'span')
 * @param {string} [clase] - Clase CSS a asignar
 * @param {string} [texto] - Contenido de texto
 * @returns {HTMLElement}
 */
export function crearElemento(tag, clase, texto) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto) el.textContent = texto;
    return el;
}

/**
 * Crea un game loop con manejo seguro de requestAnimationFrame.
 * @param {Function} fn - Funcion a ejecutar cada frame (recibe timestamp como parametro)
 * @returns {{ iniciar: Function, detener: Function }}
 */
export function crearGameLoop(fn) {
    let id = null;
    return {
        iniciar() {
            if (id !== null) return;
            const loop = function (tiempo) {
                fn(tiempo);
                // Solo programar siguiente frame si fn() no llamo a detener()
                if (id !== null) {
                    id = requestAnimationFrame(loop);
                }
            };
            id = requestAnimationFrame(loop);
        },
        detener() {
            if (id !== null) {
                cancelAnimationFrame(id);
                id = null;
            }
        },
    };
}
