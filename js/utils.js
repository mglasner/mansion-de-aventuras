// Utilidades compartidas

// Crea un elemento DOM con clase y texto opcionales
export function crearElemento(tag, clase, texto) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto) el.textContent = texto;
    return el;
}
