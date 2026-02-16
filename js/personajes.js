// Definición de personajes jugables
import { Personaje } from "./entidades.js";

const PERSONAJES = {
    Lina: new Personaje("Lina", 100, [
        { nombre: "Golpe veloz", dano: 15, descripcion: "Un golpe rápido" },
        { nombre: "Patada giratoria", dano: 25, descripcion: "Ataque poderoso" }
    ], {
        img: "assets/img/personajes/lina.png",
        clase: "jugador-lina",
        descripcion: "13 años. Valiente e inteligente."
    }),

    "Rosé": new Personaje("Rosé", 90, [
        { nombre: "Rayo de luz", dano: 20, descripcion: "Destello cegador" },
        { nombre: "Escudo brillante", dano: 10, descripcion: "Ataque defensivo" }
    ], {
        img: "assets/img/personajes/rose.png",
        clase: "jugador-rose",
        descripcion: "10 años. Nunca se rinde."
    }),

    PandaJuro: new Personaje("PandaJuro", 120, [
        { nombre: "Corte samurái", dano: 30, descripcion: "Un tajo devastador" },
        { nombre: "Golpe de bambú", dano: 18, descripcion: "Golpe rápido con bambú" }
    ], {
        img: "assets/img/personajes/pandajuro.png",
        clase: "jugador-pandajuro",
        descripcion: "Furioso, leal y honorable."
    }),

    Hana: new Personaje("Hana", 95, [
        { nombre: "Onda sónica", dano: 20, descripcion: "Un grito agudo que aturde" },
        { nombre: "Coreografía letal", dano: 22, descripcion: "Movimientos mortales de baile" }
    ], {
        img: "assets/img/personajes/hana.png",
        clase: "jugador-hana",
        descripcion: "16 años. Idol de K-pop. Lucha con música."
    })
};

export { PERSONAJES };
