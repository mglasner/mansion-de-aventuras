// Componente: Modal de confirmación para entrar a una habitación
// Muestra diálogo con botones Entrar/Cancelar y navegación con flechas

export function crearModalPuerta(contenedor) {
    var puertaActiva = null;
    var botonSeleccionado = 0;
    var callbackEntrar = null;
    var callbackCancelar = null;

    // --- Crear estructura DOM ---

    var el = document.createElement("div");
    el.id = "modal-puerta";
    el.classList.add("oculto");

    var fondo = document.createElement("div");
    fondo.className = "modal-fondo";

    var contenido = document.createElement("div");
    contenido.className = "modal-contenido";

    var titulo = document.createElement("h2");
    titulo.id = "modal-titulo";

    var mensaje = document.createElement("p");
    mensaje.id = "modal-mensaje";

    var botonesDiv = document.createElement("div");
    botonesDiv.className = "modal-botones";

    var btnEntrar = document.createElement("button");
    btnEntrar.id = "btn-entrar";
    btnEntrar.textContent = "Entrar";

    var btnCancelar = document.createElement("button");
    btnCancelar.id = "btn-cancelar";
    btnCancelar.textContent = "No, mejor no";

    botonesDiv.appendChild(btnEntrar);
    botonesDiv.appendChild(btnCancelar);
    contenido.appendChild(titulo);
    contenido.appendChild(mensaje);
    contenido.appendChild(botonesDiv);
    el.appendChild(fondo);
    el.appendChild(contenido);
    contenedor.appendChild(el);

    var botones = [btnEntrar, btnCancelar];

    // --- Funciones internas ---

    function actualizarFoco() {
        botones.forEach(function (btn, i) {
            if (i === botonSeleccionado) {
                btn.classList.add("modal-btn-foco");
            } else {
                btn.classList.remove("modal-btn-foco");
            }
        });
    }

    function cerrarYEjecutar(callback) {
        var puerta = puertaActiva;
        api.cerrar();
        if (callback) callback(puerta);
    }

    // --- Eventos ---

    btnEntrar.addEventListener("click", function () {
        cerrarYEjecutar(callbackEntrar);
    });

    btnCancelar.addEventListener("click", function () {
        cerrarYEjecutar(callbackCancelar);
    });

    fondo.addEventListener("click", function () {
        cerrarYEjecutar(callbackCancelar);
    });

    // --- API del componente ---

    var api = {
        mostrar: function (numeroPuerta) {
            puertaActiva = numeroPuerta;
            titulo.textContent = "Habitación " + numeroPuerta;
            mensaje.textContent = "¿Quieres entrar a esta habitación?";
            el.classList.remove("oculto");
            botonSeleccionado = 0;
            actualizarFoco();
        },

        cerrar: function () {
            el.classList.add("oculto");
            puertaActiva = null;
        },

        estaAbierto: function () {
            return !el.classList.contains("oculto");
        },

        // Maneja navegación con flechas y Enter dentro del modal
        manejarTecla: function (e) {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                botonSeleccionado = botonSeleccionado === 0 ? 1 : 0;
                actualizarFoco();
            } else if (e.key === "Enter") {
                e.preventDefault();
                botones[botonSeleccionado].click();
            }
        },

        onEntrar: function (callback) {
            callbackEntrar = callback;
        },

        onCancelar: function (callback) {
            callbackCancelar = callback;
        },
    };

    return api;
}
