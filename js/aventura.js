// simulador RPG interactivo //

const dañoBAse = 20;
let player = prompt("¿Cual es tu nombre, Aventurer@?");
let healtp = 10000;
let nivelp = 1;
let healten = 100;
let damageen = 10


//enemigos //

let enemigos = [{nombre: "Goblin", healten: 30, damageen: 5 }, {nombre: "Hobgoblin", healten: 60, damageen: 10}, {nombre: "Lobo", healten: 40, damageen: 15}];

function atacar(enemigo) {
    alert (`${player} ataca al ${enemigo.nombre}!`);
    enemigo.healten -= dañoBAse;
    if (enemigo.healten <=0) {
        alert(`${enemigo.nombre} fue derrotado!`);
        return true;
    } else {
        alert(`${enemigo.nombre} aun le quedan ${enemigo.healten} de salud.`);
        return false;
    }
}

function recibirDaño(enemigo) {
    alert (`${enemigo.nombre} contraataca y causa ${enemigo.damageen} de daño.`); healtp-= enemigo.damageen;
    if (healtp <=0){
        alert(`${player} ha sido derrotado...`);
    } else {
        alert( `A ${player} le quedan ${healtp} de salud.`);
    }
}

function iniciarAventura() {
    alert(`¡Bienvenid@, ${player}! Que comience tu aventura!!.`);

    let abandono = false;
    
    for (let i = 0; i <enemigos.length; i++) {
       let enemigo = enemigos[i];

       let pelear = confirm(`Encontraste un ${enemigo.nombre}, ¿quieres pelear con el?.`);

       if (!pelear) {
        alert(`${player} ha huido del combate, Los enemigos ganan la partida`);
        abandono = true;
        break;
       }
        
       while (healtp > 0 && enemigo.healten >0) {
        const vencido = atacar(enemigo);
        if (vencido) {
            nivelp++;
            alert(`Felicitaciones has subido de nivel. Nivel ${nivelp}!`);
            break;
        }
        recibirDaño(enemigo);
       }
       if (healtp <=0) break;
    }
    if (healtp>0 && !abandono) {
        alert(`¡${player} ha vencido a todos los enemigos!`);
    }
}

iniciarAventura();