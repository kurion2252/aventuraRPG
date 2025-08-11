// simulador RPG interactivo adaptado a DOM y eventos
// Autor: Brian (adaptado para entrega curso)

// ==== FUNCIONES CONSTRUCTORAS ====
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

// ==== GUARDAR Y CARGAR PARTIDA ====
let guardarPartida = () => {
    localStorage.setItem("jugador", JSON.stringify(jugador));
    localStorage.setItem("enemigos", JSON.stringify(enemigos));
    localStorage.setItem("enemigoIndex", enemigoActualIndex);
    registrarEnHistorial("Partida guardada exitosamente.");
};

let cargarpartida = () => {
    let jugadorGuardado = localStorage.getItem("jugador");
    let enemigosGuardados = localStorage.getItem("enemigos");
    let indexGuardado = localStorage.getItem("enemigoIndex");

    if (jugadorGuardado && enemigosGuardados) {
        let datosJugador = JSON.parse(jugadorGuardado);
        jugador = new Jugador( datosJugador.nombre, datosJugador.daño, datosJugador.defensa, datosJugador.vida, datosJugador.nivel);
        enemigos = JSON.parse(enemigosGuardados).map(
            (e) => new Enemigo(e.nombre, e.daño, e.defensa, e.vida, e.nivel)
        );
        
        enemigoActualIndex = parseInt(indexGuardado, 10);
        enemigoActual = enemigos[enemigoActualIndex];
        registrarEnHistorial("Partida cargada exitosamente.");
        actualizarUI();
    } else {
        registrarEnHistorial("No hay partidas guardadas.");
    }
};

// ==== BANDERA DE HUIDA ====
let abandono = false;

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
    document.getElementById( "Edefensa").innerText = `Defensa: ${enemigoActual.defensa}`;
    document.getElementById("Emana").innerText = `Daño: ${enemigoActual.daño}`;
}

function registrarEnHistorial(mensaje) {
    const li = document.createElement("li");
    li.textContent = mensaje;
    const historial = document.getElementById("historial");
    historial.appendChild(li);
    while (historial.children.length > 15) {
        historial.removeChild(historial.firstChild);
    }
}

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

// ==== EVENTOS DE BOTONES ====
document.getElementById("atacar").addEventListener("click", () => {
    registrarEnHistorial(jugador.atacar(enemigoActual));
    if (enemigoActual.vida <= 0) {
        registrarEnHistorial(`${enemigoActual.nombre} ha sido derrotado.`);
        jugador.nivel++;
        jugador.vida += 10;
        jugador.daño += 5;
        jugador.defensa += 2;
        siguienteEnemigo();
    } else {
        turnoEnemigo();
    }
    actualizarUI();
});

document.getElementById("curar").addEventListener("click", () => {
    registrarEnHistorial(jugador.curarse());
    turnoEnemigo();
    actualizarUI();
});

document.getElementById("huir").addEventListener("click", () => {
    registrarEnHistorial(
        `${jugador.nombre} huye del combate. Los enemigos celebran...`
    );
    abandono = true;
    desactivarBotones();
});

document.getElementById("defender").addEventListener("click", () => {
    jugador.defensa += 5;
    registrarEnHistorial(
        `${jugador.nombre} se pone en posición defensiva. Defensa +5 este turno.`
    );
    turnoEnemigo();
    jugador.defensa -= 5;
    actualizarUI();
});

document
    .getElementById("guardar-partidas")
    .addEventListener("click", guardarPartida);
document
    .getElementById("cargar-partida")
    .addEventListener("click", cargarpartida);

// ==== DESACTIVAR BOTONES ====
function desactivarBotones() {
    document
        .querySelectorAll("#acciones-combate button")
        .forEach((boton) => (boton.disabled = true));
}

// ==== INICIO DEL JUEGO ====
let nombreJugador = prompt("Introduce el nombre de tu personaje:");
if (!nombreJugador) {
    nombreJugador = "Heroe";
}
jugador = new Jugador(nombreJugador, 25, 15, 100, 1);
actualizarUI();
registrarEnHistorial(`Comienza la aventura de ${jugador.nombre}...`);

// ==== FUNCIÓN DE ORDEN SUPERIOR (ejemplo para entrega) ====
console.log("Lista de enemigos:");
enemigos.map((e) => e.nombre).forEach((nombre) => console.log(nombre));
