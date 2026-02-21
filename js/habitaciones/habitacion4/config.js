// GENERADO desde datos/*.yaml — no editar directamente

export const CFG = {
    meta: {
        titulo: 'Habitacion 4 — El Abismo',
        itemInventario: 'llave-habitacion-5',
        timeoutExito: 1500,
    },
    canvas: {
        anchoBase: 480,
        altoBase: 270,
    },
    tiles: {
        tamano: 16,
        tipos: {
            VACIO: 0,
            SUELO: 1,
            PLATAFORMA: 2,
            ABISMO: 3,
            SPAWN_JUGADOR: 4,
            SPAWN_ENEMIGO: 5,
            SPAWN_BOSS: 6,
            META: 7,
        },
    },
    fisicas: {
        gravedad: 0.5,
        velocidadMaxCaida: 8,
        velocidadJugador: 2.5,
        fuerzaSalto: -7.5,
        fuerzaStompRebote: -5,
        coyoteTime: 6,
        jumpBuffer: 6,
        invulnerabilidad: 60,
        knockbackX: 3,
        knockbackY: -4,
    },
    enemigos: {
        stompMargen: 4,
        stompVyMin: 2,
        cooldownAtaque: 60,
    },
    boss: {
        fasesCambio: [0.66, 0.33],
        velocidadFases: [1, 1.4],
    },
    render: {
        colorEnemigo: '#e94560',
        colorBoss: '#bb86fc',
    },
    escalado: {
        estaturaRef: 1.55,
        escalaMin: 0.55,
        escalaMax: 1.35,
        hitboxBaseW: 12,
        hitboxBaseH: 14,
        spriteBaseW: 48,
        spriteBaseH: 60,
        velAttrMin: 3,
        velAttrMax: 9,
        velPlatMin: 1.5,
        velPlatMax: 3.5,
        fuerzaSaltoBase: -7.5,
        fuerzaSaltoFactor: 0.3,
    },
    camara: {
        shakeDecay: 0.9,
    },
    sprites: {
        jugadorIdleVel: 30,
        jugadorCorrerVel: 6,
    },
};
