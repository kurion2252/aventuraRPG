// simulador RPG interactivo //

// Autor: [Brian]
// funciones constructoras para jugador
function Jugador(nombre, daño,defensa, vida, nivel) {
    this.nombre = nombre;
    this.daño = daño;
    this.defensa = defensa;
    this.vida = vida;
    this.nivel = nivel;

    this.atacar = function(enemigos) { 
        let dañoreal = this.daño - enemigos.defensa;
        if (dañoreal < 0) dañoreal = 0; // daño mínimo
        enemigos.vida -= dañoreal; // resta el daño al enemigo
        return `${this.nombre} ataca a ${enemigos.nombre} y le causa ${dañoreal} puntos de daño.`;
        
        this.curarse = function() {
            if(this.defensa >= 5) {
                this.vida += 20; // curación si la defensa es alta
                if  (this.vida > 100) this.vida = 100; // máximo de vida    
                this.defensa -= 5; // reduce defensa al curarse
                return `${this.nombre} se cura 20 puntos de vida.`;}
            else {
                return `${this.nombre} no puede curarse porque su defensa es baja.`;
            }    
        }     
    }
};

// funciones constructoras para enemigos
function Enemigo(nombre, daño, defensa, salud, nivel) {
    this.nombre = nombre;
    this.daño = daño;
    this.defensa = defensa;
    this.vida = salud;
    this.nivel = nivel;
}

// crear juagor y enemigos
let jugador = new Jugador("Heroe", 25, 15, 100, 1);

let enemigos = [
    new Enemigo("goblin con espada", 30, 5, 15, 1),
    new Enemigo("goblin arquero", 7, 5, 20, 3),
    new Enemigo("Hechicero goblin", 10, 5, 20, 5),
    new Enemigo("hobgoblin", 20, 15, 30, 11),
    new Enemigo("Sabio goblin", 40, 20, 30, 15),
    new Enemigo("Rey goblin", 60, 55, 50, 20),
    new Enemigo("Lobo", 4, 2, 10 , 2),
];

//bucle principal peleas
for (let i = 0; i < enemigos.length; i++) {
    let enemigo = enemigos[i];
    alert(`Un ${enemigo.nombre} salvaje aparece!`);
    while (enemigo.vida > 0 && jugador.vida > 0) {
        let accion = prompt(`¿Qué deseas hacer con ${enemigo.nombre}?\n` +`1- Atacar\n2 - Curarse\n3 - ver Estado\n4 - Huir`);

        if (accion === '1') {
            alert(jugador.atacar(enemigo));
        }  else if (accion === '2') {
            alert(jugador.curarse());
        } else if (accion === '3') {
            alert (
           `${jugador.nombre} - Nv. ${jugador.nivel}\n` + `salud: ${jugador.vida} | Daño: ${jugador.daño} | Defensa: ${jugador.defensa}\n\n` + `${enemigo.nombre} - NV. ${enemigo.nivell}\n` + `Salud: ${enemigo.salud} |Daño: ${enemigo.daño} | Defensa: ${enemigo.defensa}`
        );
        continue;
    } else if(accion === "4"){ 
        alert("Has huido del combate! los enemigos celebran la victoria...");
        break
    } else {
        alert("Acción no válida, intenta de nuevo.");
        continue;
    }

    // turno del enemigo si sigue vivo
    if (enemigo.vida > 0) {
    let dañorecibido = enemigo.daño - jugador.defensa;
    if (dañorecibido < 0) dañorecibido = 0; 
    
    jugador.vida -= dañorecibido; // resta el daño al jugador
    alert(`${enemigo.nombre} ataca a ${jugador.nombre} y le causa ${dañoEnemigo} puntos de daño.`);
    if (jugador.vida <= 0) {
        alert(`${jugador.nombre} ha sido derrotado por ${enemigo.nombre}. Fin del juego.`);
        break;
    } else {
        alert(`${jugador.nombre} tiene ${jugador.vida} puntos de vida restantes.`);
        jugador.nivel += 1; // aumenta el nivel del jugador
        jugador.daño += 5; // aumenta el daño del jugador
        jugador.defensa += 2; // aumenta la defensa del jugador
        jugador.vida = Math.min(jugador.vida + 10, 100); // recupera vida hasta un máximo de 100
        alert(`${jugador.nombre} ha subido de nivel! Ahora es nivel ${jugador.nivel}.`);
    }
    }   

    if (jugador.vida <= 0) {
        break;
    }
  } // <-- This closes the while loop properly
}

//estadisticas del jugador y enemigos
const estadisticasJugador = () => {
    console.log(`Jugador: ${jugador.nombre}`);
    console.log(`Nivel: ${jugador.nivel} | Vida: ${jugador.vida} | Daño: ${jugador.daño} | Defensa: ${jugador.defensa}`);
};
const estadisticasEnemigos = () => {
    enemigos.forEach(enemigo => {
        console.log(`Enemigo: ${enemigo.nombre}`);
        console.log(`Nivel: ${enemigo.nivel} | Vida: ${enemigo.vida} | Daño: ${enemigo.daño} | Defensa: ${enemigo.defensa}`);
    });
};