// Componente: D-pad virtual para dispositivos touch
// Soporta dos modos:
// - Centrado (pasillo): 4 botones ▲◀▶▼ centrados abajo
// - Dividido (platformer): izq ◀▶ movimiento / der botones A (saltar) y B (accion)

export function crearControlesTouch() {
    // No crear si no hay soporte touch
    const esTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!esTouch) {
        return {
            setTeclasRef() {},
            mostrar() {},
            ocultar() {},
            setModoDividido() {},
            setModoCentrado() {},
        };
    }

    let teclasRef = {};
    let modoDividido = false;

    // Helper: crear boton touch con eventos tactiles
    function crearBoton(clase, key, texto) {
        const btn = document.createElement('button');
        btn.className = 'dpad-btn ' + clase;
        btn.textContent = texto;
        btn.type = 'button';

        btn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            teclasRef[key] = true;
        });

        btn.addEventListener('touchend', function (e) {
            e.preventDefault();
            delete teclasRef[key];
        });

        btn.addEventListener('touchcancel', function () {
            delete teclasRef[key];
        });

        return btn;
    }

    // --- Contenedor centrado (pasillo: ▲◀▶▼) ---
    const contenedor = document.createElement('div');
    contenedor.className = 'dpad-contenedor';

    const teclasCentradas = [
        { clase: 'dpad-arriba', key: 'ArrowUp', texto: '▲' },
        { clase: 'dpad-izquierda', key: 'ArrowLeft', texto: '◀' },
        { clase: 'dpad-derecha', key: 'ArrowRight', texto: '▶' },
        { clase: 'dpad-abajo', key: 'ArrowDown', texto: '▼' },
    ];

    teclasCentradas.forEach(function (t) {
        contenedor.appendChild(crearBoton(t.clase, t.key, t.texto));
    });

    // --- Contenedor izquierdo (platformer: ◀ ▶) ---
    const contIzq = document.createElement('div');
    contIzq.className = 'dpad-izq-contenedor';

    contIzq.appendChild(crearBoton('dpad-split-izq', 'ArrowLeft', '◀'));
    contIzq.appendChild(crearBoton('dpad-split-der', 'ArrowRight', '▶'));

    // --- Contenedor derecho (platformer: botones A y B estilo SNES) ---
    const contDer = document.createElement('div');
    contDer.className = 'dpad-der-contenedor';

    // B: accion secundaria (deshabilitado por ahora)
    const btnB = crearBoton('dpad-btn-b', 'Habilidad1', 'B');
    btnB.disabled = true;

    // A: saltar (accion principal)
    const btnA = crearBoton('dpad-btn-a', 'ArrowUp', 'A');

    contDer.appendChild(btnB);
    contDer.appendChild(btnA);

    // Agregar los 3 contenedores al body
    document.body.appendChild(contenedor);
    document.body.appendChild(contIzq);
    document.body.appendChild(contDer);

    // Estado inicial: todos ocultos
    contenedor.classList.add('oculto');
    contIzq.classList.add('oculto');
    contDer.classList.add('oculto');

    function setTeclasRef(obj) {
        teclasRef = obj;
    }

    function mostrar() {
        if (modoDividido) {
            contenedor.classList.add('oculto');
            contIzq.classList.remove('oculto');
            contDer.classList.remove('oculto');
        } else {
            contenedor.classList.remove('oculto');
            contIzq.classList.add('oculto');
            contDer.classList.add('oculto');
        }
    }

    function ocultar() {
        contenedor.classList.add('oculto');
        contIzq.classList.add('oculto');
        contDer.classList.add('oculto');
    }

    function setModoDividido() {
        modoDividido = true;
    }

    function setModoCentrado() {
        modoDividido = false;
    }

    return { setTeclasRef, mostrar, ocultar, setModoDividido, setModoCentrado };
}
