function Enemigo(nombre, daño, defensa, salud, nivel) {
    this.nombre = nombre;
    this.daño = daño;
    this.defensa = defensa;
    this.vida = salud;
    this.nivel = nivel;
}
// =============cueva=============
const enemigosCueva = [
    //goblins
        new Enemigo("goblin con espada", 30, 5, 60, 1),
        new Enemigo("goblin arquero", 25, 20, 20, 3),
        new Enemigo("Hechicero goblin", 10, 5, 20, 5),
        new Enemigo("hobgoblin", 20, 15, 30, 11), 
    //esqueletos           
        new Enemigo("esqueleto", 4, 2, 10, 2),
        new Enemigo("esqueleto arquero", 10, 5, 20, 4),
        new Enemigo("esqueleto guerrero", 20, 15, 30, 6),
    //arañas
        new Enemigo("araña", 3, 1, 5, 1),    
        new Enemigo("araña gigante", 15, 10, 30, 10),
        
]
// ==== bosses cueva ========
const BossCueva =[
        new Enemigo("araña reina", 50, 40, 100, 15),
        new Enemigo("Rey goblin", 60, 55, 50, 20),
        new Enemigo("esqueleto caballero", 30, 25, 40, 8),
]
// =============bosque=============
const enemigosBosque = [
    //orcos
        new Enemigo("Orco", 35, 10, 80, 4),
        new Enemigo("Orco arquero", 30, 25, 40  , 6),
        new Enemigo("Orco chamán", 15, 10, 30, 8),
    //lobos    
        new Enemigo("Lobo", 4, 2, 10, 2),
        new Enemigo("Lobo feroz", 15, 10, 30, 10),
    //humanos
        new Enemigo("bandido", 25, 20, 40, 9),
        new Enemigo("caballero corrupto", 60, 50, 80, 15),
    //trolls    
        new Enemigo("Troll", 50, 40, 100, 15),
    //dragones
        new Enemigo("Dragón joven", 70, 50, 150, 20),

];  
// ==== bosses bosque ========
const BossBosque =[
        new Enemigo("rey lobo", 20, 15, 50, 10),
        new Enemigo("bandido líder", 40, 30, 60, 12),
        new Enemigo("Dragón legendario", 150, 100, 500, 40),
]


// ============= exportaciones =============
export {enemigosCueva, BossCueva, enemigosBosque, BossBosque};