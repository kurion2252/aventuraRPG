// simulador RPG interactivo adaptado a DOM y eventos
// Autor: Brian (adaptado para entrega curso)
//librerias



// =============================== mensajes iniciales ===============================
// sweetalert2 para prompts y alertas
function mostrarSweetAlert(config) {
    // Crear overlay oscuro
    let overlay = document.createElement("div");
    overlay.className = "fondo-oscuro-swal";
    document.body.appendChild(overlay);

    // Mostrar SweetAlert
    swal.fire(config).then(() => {
        // Quitar overlay cuando se cierra el SweetAlert
        overlay.remove();
    });
}

mostrarSweetAlert({ title: "Bienvenido al juego de aventura RPG!" });
mostrarSweetAlert({ title: "Instrucciones: Ataca, cura, defiende o huye. ¡Buena suerte!" });

import { mounstruos,enemigosCueva, BossCueva, enemigosBosque, BossBosque, Enemigo } from "./monstruos.js";

//=============================== funciones constructoras ================================
function Jugador(nombre, daño, defensa, vida, nivel) {
    this.nombre = nombre;
    this.daño = daño;
    this.defensa = defensa;
    this.vida = vida;
    this.nivel = nivel;
    this.genero = "genero";

    this.atacar = function (enemigos) {
        let dañoreal = this.daño - enemigos.defensa;
        if (dañoreal < 0) dañoreal = 0;
        enemigos.vida -= dañoreal;
        return `${this.nombre} ataca a ${enemigos.nombre} y le causa ${dañoreal} puntos de daño.`;
    };

    this.curarse = function () {
        if (this.defensa >= 5) {
            this.vida += 20;
            if (this.vida > 100) this.vida = 100;
            this.defensa -= 5;
            return `${this.nombre} se cura 20 puntos de vida. Ahora tiene ${this.vida} puntos de vida y su defensa ha bajado a ${this.defensa}.`;
        } else {
            return `${this.nombre} no puede curarse porque su defensa es baja.`;
        }
    };
}


//===========================================================================================================================================//

// =============================== VARIABLES GLOBALES/ estado de juego ===============================

// ==== CREAR JUGADOR Y ENEMIGOS ====
let jugador;
let enemigos= mounstruos.map(m => new Enemigo(m.nombre, m.daño, m.defensa, m.vida, m.nivel));
let enemigoActualIndex = 0;
let enemigoActual = enemigos[enemigoActualIndex];

//===========================================================================================================================================//
// =============================== utilidades/helpers ===============================

// ==== REGISTRAR EN HISTORIAL ====
function registrarEnHistorial(mensaje) {
    const li = document.createElement("li");
    li.textContent = mensaje;
    const historial = document.getElementById("historial");
    historial.appendChild(li);
    while (historial.children.length > 15) {
        historial.removeChild(historial.firstChild);
    }
}

// ==== promesa de espera ====
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

//= bandera boleana bloqueo ui
let uiBloqueada = false;

// ==== BANDERA DE HUIDA ====
let abandono = false;

//==== usuario actual ====
let usuarioActual = "null";

// Mezclar (shuffle) un array
function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Obtener enemigos según el rango de nivel del héroe
function obtenerRangoEnemigos(nivelHeroe) {
    const rangoInicio = Math.floor((nivelHeroe - 1) / 3) * 3 + 1;
    const rangoFin = rangoInicio + 2;
    return mounstruos.filter(m => m.nivel >= rangoInicio && m.nivel <= rangoFin);
}

// reactivar botones
function activarBotones() {
    document
        .querySelectorAll("#acciones-combate button")
        .forEach((boton) => (boton.disabled = false));
}


//===========================================================================================================================================//
// ==== GUARDAR,CARGAR y BORRAR PARTIDA ====
function guardarPartida() {
    if (!usuarioActual) return;
    localStorage.setItem(`usuario:${usuarioActual}:jugador`, JSON.stringify(jugador));
    localStorage.setItem(`usuario:${usuarioActual}:enemigos`, JSON.stringify(enemigos));
    localStorage.setItem(`usuario:${usuarioActual}:enemigoIndex`, enemigoActualIndex);
    mostrarSweetAlert({ title: "Partida guardada correctamente." });
}

function cargarpartida() {
    const jugadorGuardado = localStorage.getItem(`usuario:${usuarioActual}:jugador`);
    const enemigosGuardados = localStorage.getItem(`usuario:${usuarioActual}:enemigos`);
    const indexguardado = localStorage.getItem(`usuario:${usuarioActual}:enemigoIndex`);

    if (jugadorGuardado && enemigosGuardados && indexguardado !== null) {
        jugador = Object.assign(new Jugador(), JSON.parse(jugadorGuardado));
        enemigos = JSON.parse(enemigosGuardados).map(m => Object.assign(new Enemigo(), m));
        enemigoActualIndex = JSON.parse(indexguardado);
        enemigoActual = enemigos[enemigoActualIndex];
        registrarEnHistorial(`Partida de ${usuarioActual} cargada correctamente.`);
        activarBotones();
        abandono = false;
        actualizarUI();


    } else {
        mostrarSweetAlert({ title: "No se encontró una partida guardada para este usuario." });
    }
}


function nuevaPartidaUsuario(nombre, genero = "otro") {
    jugador = new Jugador(nombre, 25, 25, 100, 1, genero);
    enemigos = mounstruos.map(m => new Enemigo(m.nombre, m.daño, m.defensa, m.vida, m.nivel));

        //reiniciar indices y estados
        enemigoActualIndex = 0;
        enemigoActual = enemigos[enemigoActualIndex];
        registrarEnHistorial(`Nueva partida para ${nombre} iniciada.`);
        actualizarUI();
        guardarPartida();
        abandono = false;
}

// Actualizar enemigos automáticamente al subir de nivel
function subirNivel() {
    jugador.nivel += 1;
    const enemigosFiltrados = obtenerRangoEnemigos(jugador.nivel);
    enemigos = mezclarArray(enemigosFiltrados.map(m => new Enemigo(m.nombre, m.daño, m.defensa, m.vida, m.nivel)));
    enemigoActualIndex = 0;
    enemigoActual = enemigos[enemigoActualIndex];
    registrarEnHistorial(`¡${jugador.nombre} subió a nivel ${jugador.nivel}! Nuevos enemigos aparecen.`);
    actualizarUI();
    guardarPartida();
}

async function seleccionarUsuarioYCargar() {
    const usuarios = obtenerUsuariosGuardados();
    const opciones = usuarios.reduce((obj, u) => {
        obj[u] = u;
        return obj;
    }, {});
    opciones["nuevo"] = "Nuevo usuario";

    const { value: usuario } = await swal.fire({
        title: "Selecciona usuario",
        input: "select",
        inputOptions: opciones,
        inputPlaceholder: "Elige tu usuario",
        showCancelButton: true,
    });
    if (usuario) {
        usuarioActual = usuario.trim();

        if (localStorage.getItem(`usuario:${usuarioActual}:jugador`)) {
            const { isConfirmed } = await swal.fire({
                title: `Usuario ${usuarioActual} ya existe`,
                text: "¿Quieres cargar su partida guardada?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, cargar",
                cancelButtonText: "No, sobreescribir",
            });
            if (isConfirmed) {
                cargarpartida();
            } else {
                nuevaPartidaUsuario(usuarioActual);
            }
        } else {
            nuevaPartidaUsuario(usuarioActual);
        }
    }
}

// ==== borrar usuario ====

function borrarPartida() {
    if (!usuarioActual) return;
    localStorage.removeItem(`usuario:${usuarioActual}:jugador`);
    localStorage.removeItem(`usuario:${usuarioActual}:enemigos`);
    localStorage.removeItem(`usuario:${usuarioActual}:enemigoIndex`);
    mostrarSweetAlert({ title: "Partida borrada correctamente. Elige una nueva opción." });

    jugador = undefined;
    enemigos = [];
    enemigoActualIndex = 0;
    enemigoActual = undefined;

    document.getElementById("Jnombre").innerText = "";
    document.getElementById("Jnivel").innerText = "";
    document.getElementById("Jvida").innerText = "";
    document.getElementById("Jdefensa").innerText = "";
    document.getElementById("Jmana").innerText = "";
    document.getElementById("Enombre").innerText = "";
    document.getElementById("Enivel").innerText = "";
    document.getElementById("Evida").innerText = "";
    document.getElementById("Edefensa").innerText = "";
    document.getElementById("Emana").innerText = "";
    loginUsuario();
}

//===========================================================================================================================================//
//============================== UI ===============================
// ==== ACTUALIZAR INTERFAZ ====
function actualizarUI() {
    document.getElementById("Jnombre").innerText = jugador.nombre;
    document.getElementById("Jnivel").innerText = `Nivel: ${jugador.nivel}`;
    document.getElementById("Jvida").innerText = `Vida: ${jugador.vida}`;
    document.getElementById("Jdefensa").innerText = `Defensa: ${jugador.defensa}`;
    document.getElementById("Jmana").innerText = `Daño: ${jugador.daño}`;
    document.getElementById("Jgenero").innerText = `Género: ${jugador.genero}`;

    document.getElementById("Enombre").innerText = enemigoActual.nombre;
    document.getElementById("Enivel").innerText = `Nivel: ${enemigoActual.nivel}`;
    document.getElementById("Evida").innerText = `Vida: ${enemigoActual.vida}`;
    document.getElementById("Edefensa").innerText = `Defensa: ${enemigoActual.defensa}`;
    document.getElementById("Emana").innerText = `Daño: ${enemigoActual.daño}`;
}

// ==== DESACTIVAR BOTONES ====
function desactivarBotones() {
    document
        .querySelectorAll("#acciones-combate button")
        .forEach((boton) => (boton.disabled = true));
}

//===========================================================================================================================================//
//============================== COMBATE ===============================
// ==== TURNO DEL ENEMIGO ====
function turnoEnemigo() {
    if (enemigoActual.vida > 0) {
        let dañorecibido = enemigoActual.daño - jugador.defensa;
        if (dañorecibido < 0) dañorecibido = 0;
        jugador.vida -= dañorecibido;
        registrarEnHistorial(
            `${enemigoActual.nombre} ataca a ${jugador.nombre} y le causa ${dañorecibido} puntos de daño.`
        );
        if (jugador.vida <= 0) {
            registrarEnHistorial(
                `${jugador.nombre} ha sido derrotado por ${enemigoActual.nombre}. Fin del juego.`
            );
            desactivarBotones();
        }
    }
    actualizarUI();
}

// versión asíncrona del turno del enemigo con espera
async function turnoEnemigoAsync() {
    await wait(3000); // espera 1 segundo
    turnoEnemigo();
    uiBloqueada = false; // desbloquear UI después del turno del enemigo
}

// ==== CAMBIO DE ENEMIGO ====
function siguienteEnemigo() {
    enemigoActualIndex++;
    if (enemigoActualIndex >= enemigos.length) {
        mostrarSweetAlert({ title: "¡Has derrotado a todos los enemigos! Victoria total." });
        desactivarBotones();
        return;
    }
    enemigoActual = enemigos[enemigoActualIndex];
    actualizarUI();
}
//===========================================================================================================================================//
// ==== EVENTOS DE BOTONES ====
document.getElementById("atacar").addEventListener("click", async () => {
    if (uiBloqueada) return; // prevenir múltiples clics
    uiBloqueada = true; // bloquear UI

    registrarEnHistorial(jugador.atacar(enemigoActual));
    if (enemigoActual.vida <= 0) {
        registrarEnHistorial(`${enemigoActual.nombre} ha sido derrotado.`);
        jugador.nivel++;
        jugador.vida += 10;
        jugador.daño += 5;
        jugador.defensa += 2;
        siguienteEnemigo();
        uiBloqueada = false; // desbloquear UI
    } else {
        await turnoEnemigoAsync();
    }
    actualizarUI();
});

document.getElementById("curar").addEventListener("click", async () => {
    if (uiBloqueada) return; // prevenir múltiples clics
    uiBloqueada = true; // bloquear UI  
    registrarEnHistorial(jugador.curarse());
    await turnoEnemigoAsync();
    actualizarUI(); // <-- mueve aquí, después del turno del enemigo
});

document.getElementById("defender").addEventListener("click", async () => {
    if (uiBloqueada) return; // prevenir múltiples clics
    uiBloqueada = true; // bloquear UI  
    jugador.defensa += 5;
    registrarEnHistorial(
        `${jugador.nombre} se pone en posición defensiva. Defensa +5 este turno.`
    );
    await turnoEnemigoAsync();
    jugador.defensa -= 5;
    actualizarUI(); // <-- mueve aquí, después de modificar defensa
});

document.getElementById("huir").addEventListener("click", async () => {
    if (uiBloqueada) return; // prevenir múltiples clics
    uiBloqueada = true; // bloquear UI
    registrarEnHistorial(
        `${jugador.nombre} huye del combate. Los enemigos celebran...`
    );
    abandono = true;
    desactivarBotones();
    uiBloqueada = false; // desbloquear UI
});


// ==== BOTONES DE GUARDAR Y CARGAR Y BORrAR ====
document
    .getElementById("guardar-partidas")
    .addEventListener("click", async () => {
        if (!usuarioActual || usuarioActual === "null") {
            const { value: nombre } = await swal.fire({
                title: "Guardar partida",
                input: "text",
                inputLabel: "Ingresa tu nombre de usuario",
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value) return "Debes ingresar un nombre";
                },
            });
            if (nombre) {
                usuarioActual = nombre.trim();
            } else {
                return; // No guardar si no hay usuario
            }
        }
        guardarPartida();
    });
document
    .getElementById("cargar-partida")
    .addEventListener("click", seleccionarUsuarioYCargar);
document
    .getElementById("borrar-partida")
    .addEventListener("click", borrarPartida);


// ==== login usuario ====
function obtenerUsuariosGuardados() {
    const usuarios = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("usuario:") && key.endsWith(":jugador")) {
            const nombre = key.split(":")[1];
            usuarios.push(nombre);
        }
    }
    return usuarios;
}

async function loginUsuario() {
    const usuarios = obtenerUsuariosGuardados();
    const opciones = usuarios.length > 0
        ? { cargar: "Cargar partida", nueva: "Nueva partida" }
        : { nueva: "Nueva partida" };

    const { value: accion } = await mostrarSweetAlert({
        title: "bienvenido",
        text: "¿Quieres cargar una partida existente o empezar una nueva?",
        background: "url('https://res.cloudinary.com/dseriytpl/image/upload/v1756560407/fondo_login_pergamino_zk5ffo.webp') no-repeat center center/cover",     
        input: "select",
        inputOptions: opciones,
        inputValidator: (value) => {
            if (!value) {
                return "¡Necesitas elegir una opcion!";
            }
        },
    });

    if (accion === "cargar") {
        const usuarios = obtenerUsuariosGuardados();
        const { value: usuario } = await mostrarSweetAlert({
            title: "seleccion de usuario",
            input: "select",
            inputOptions: usuarios.reduce((obj, u) => {
                obj[u] = u;
                return obj;
            }, {}),
            inputPlaceholder: "Elije tu usuario",
            showCancelButton: true
        });
        if (usuario) {
            usuarioActual = usuario;
            cargarpartida();
        } else {
            loginUsuario(); // reiniciar el proceso
        }
    } else if (accion === "nueva") {
        const { value: nombre } = await mostrarSweetAlert({
            title: "Nuevo usuario",
            input: "text",
            inputLabel: "Ingresa tu nombre de usuario",
            inputPlaceholder: "Nombre de usuario",
            inputValidator: (value) => !value && "¡Necesitas escribir un nombre de usuario!",
        });

        if (nombre) {
            usuarioActual = nombre.trim();

            if (localStorage.getItem(`usuario:${usuarioActual}:jugador`)) {
                const { isConfirmed } = await mostrarSweetAlert({
                    title: `Usuario ${usuarioActual} ya existe`,
                    text: "quieres cargar su partida guardada?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Sí, cargar",
                    cancelButtonText: "No, sobreescribir",
                });
                if (isConfirmed) {
                    cargarpartida();
                } else {
                    nuevaPartidaUsuario(usuarioActual);
                }
            }
            else {
                nuevaPartidaUsuario(usuarioActual);
            }
        } else {
            loginUsuario(); // reiniciar el proceso
        }
    }
}

//===========================================================================================================================================//
// ==== INICIO DEL JUEGO ====
loginUsuario();

// ==== Extras / debug ====
console.log("Lista de enemigos:");
enemigos.map((e) => e.nombre).forEach((nombre) => console.log(nombre));


// fin del código
document.getElementById("nueva-partida").addEventListener("click", async () => {
    const { value: nombre } = await mostrarSweetAlert({
        title: "Nombre de jugador",
        input: "text",
        inputLabel: "Ingresa tu nombre para la nueva partida",
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) return "Debes ingresar un nombre";
        },
    });
    if (nombre) {
        const { value: genero } = await mostrarSweetAlert({
            title: "Género del personaje",
            input: "select",
            inputOptions: { masculino: "Masculino", femenino: "Femenino", otro: "Otro" },
            inputPlaceholder: "Elige tu género",
            showCancelButton: true,
        });
        usuarioActual = nombre.trim();
        nuevaPartidaUsuario(usuarioActual);
    }
});




