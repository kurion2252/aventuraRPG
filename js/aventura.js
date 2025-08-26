// simulador RPG interactivo adaptado a DOM y eventos
// Autor: Brian (adaptado para entrega curso)


// =============================== mensajes iniciales ===============================
// sweetalert2 para prompts y alertas
swal.fire("Bienvenido al juego de aventura RPG!");
swal.fire("Instrucciones: Ataca, cura, defiende o huye. ¡Buena suerte!");


//=============================== funciones constructoras ================================
function Jugador(nombre, daño, defensa, vida, nivel) {
    this.nombre = nombre;
    this.daño = daño;
    this.defensa = defensa;
    this.vida = vida;
    this.nivel = nivel;

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

function Enemigo(nombre, daño, defensa, salud, nivel) {
    this.nombre = nombre;
    this.daño = daño;
    this.defensa = defensa;
    this.vida = salud;
    this.nivel = nivel;
}
//===========================================================================================================================================//

// =============================== VARIABLES GLOBALES/ estado de juego ===============================

// ==== CREAR JUGADOR Y ENEMIGOS ====
let jugador;
let enemigos = [
    new Enemigo("goblin con espada", 30, 5, 60, 1),
    new Enemigo("goblin arquero", 25, 20, 20, 3),
    new Enemigo("Hechicero goblin", 10, 5, 20, 5),
    new Enemigo("hobgoblin", 20, 15, 30, 11),
    new Enemigo("Sabio goblin", 40, 20, 30, 15),
    new Enemigo("Rey goblin", 60, 55, 50, 20),
    new Enemigo("Lobo", 4, 2, 10, 2),
];
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

//===========================================================================================================================================//
// ==== GUARDAR Y CARGAR PARTIDA ====
function guardarPartida() {
    if (!usuarioActual) return;
    localStorage.setItem(`usuario:${usuarioActual}:jugador`, JSON.stringify(jugador));
    localStorage.setItem(`usuario:${usuarioActual}:enemigos`, JSON.stringify(enemigos));
    localStorage.setItem(`usuario:${usuarioActual}:enemigoIndex`, enemigoActualIndex);
    swal.fire("Partida guardada correctamente.");
}

function cargarpartida() {
    if (!usuarioActual) return;
    let jugadorGuardado = localStorage.getItem(`usuario:${usuarioActual}:jugador`);
    let enemigosGuardados = localStorage.getItem(`usuario:${usuarioActual}:enemigos`);
    let indexguardado = localStorage.getItem(`usuario:${usuarioActual}:enemigoIndex`);

    if (jugadorGuardado && enemigosGuardados && indexguardado !== null) {
        let datosjugador = JSON.parse(jugadorGuardado);
        jugador = new Jugador(
            datosjugador.nombre,
            datosjugador.daño,
            datosjugador.defensa,
            datosjugador.vida,
            datosjugador.nivel
        );
        enemigos = JSON.parse(enemigosGuardados).map((e => new Enemigo(e.nombre, e.daño, e.defensa, e.vida, e.nivel)));
        enemigoActualIndex = parseInt(indexguardado, 10);
        enemigoActual = enemigos[enemigoActualIndex];
        registrarEnHistorial(`Partida de ${usuarioActual} cargada correctamente.`);
        actualizarUI();
    } else {
        registrarEnHistorial(`No hay partida guardada para ${usuarioActual}.`);
    }
}

function nuevaPartidaUsuario(nombre) {
    jugador = new Jugador(nombre, 25, 15, 100, 1);
    enemigos = [
        new Enemigo("goblin con espada", 30, 5, 60, 1),
        new Enemigo("goblin arquero", 25, 20, 20, 3),
        new Enemigo("Hechicero goblin", 10, 5, 20, 5),
        new Enemigo("hobgoblin", 20, 15, 30, 11),
        new Enemigo("Sabio goblin", 40, 20, 30, 15),
        new Enemigo("Rey goblin", 60, 55, 50, 20),
        new Enemigo("Lobo", 4, 2, 10, 2),
    ];
    enemigoActualIndex = 0;
    enemigoActual = enemigos[enemigoActualIndex];
    registrarEnHistorial(`Nueva partida para ${nombre} iniciada.`);
    actualizarUI();
    guardarPartida();
}

    async function seleccionarUsuarioYCargar() {
    const usuarios = obtenerUsuariosGuardados();
    if (usuarios.length === 0) {
        await swal.fire("No hay partidas guardadas", "Crear una nueva partida", "info");
        return;        
    }
    const { value: usuario } = await swal.fire({
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
    }
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
    if (enemigoActualIndex < enemigos.length) {
        enemigoActual = enemigos[enemigoActualIndex];
        registrarEnHistorial(`¡Aparece un nuevo enemigo: ${enemigoActual.nombre}!`);
        actualizarUI();
    } else {
        registrarEnHistorial(
            "¡Has derrotado a todos los enemigos! Victoria total."
        );
        desactivarBotones();
    }
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
    actualizarUI();
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
    actualizarUI();
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

document
    .getElementById("guardar-partidas")
    .addEventListener("click", guardarPartida);
document
    .getElementById("cargar-partida")
    .addEventListener("click", seleccionarUsuarioYCargar);

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
    const { value: accion } = await swal.fire({
        title: "bienvenido",
        text: "¿Quieres cargar una partida existente o empezar una nueva?",
        input: "select",
        inputOptions: {
            cargar: "Cargar partida",
            nueva: "Nueva partida",
        },
        inputValidator: (value) => {
            if (!value) {
                return "¡Necesitas elegir una opcion!";
            }
        },
    });

    if (accion === "cargar") {
        const usuarios = obtenerUsuariosGuardados();
        if (usuarios.length === 0) {
            await swal.fire("No hay partidas guardadas", "Crear una nueva partida", "info");
            return loginUsuario(); // reiniciar el proceso
        }
        const { value: usuario } = await swal.fire({
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
        const { value: nombre } = await swal.fire({
            title: "Nuevo usuario",
            input: "text",
            inputLabel: "Ingresa tu nombre de usuario",
            inputPlaceholder: "Nombre de usuario",
            inputValidator: (value) => !value && "¡Necesitas escribir un nombre de usuario!",
        });

        if (nombre) {
            usuarioActual = nombre.trim();

            if (localStorage.getItem(`usuario:${usuarioActual}:jugador`)) {
                const { isConfirmed } = await swal.fire({
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
