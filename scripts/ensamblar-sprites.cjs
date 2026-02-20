/**
 * Ensambla frames individuales en sprite sheets finales con el orden correcto.
 *
 * Layout 9 frames:  idle(2) + run(4) + jump(1) + fall(1) + hit(1)
 * Layout 15 frames: idle(2) + run(6) + jump(1) + fall(1) + hit(1) + atk1(2) + atk2(2)
 *
 * Soporta frames espejados (flip horizontal) para crear alternancia de piernas.
 * Usar { idx: N, flip: true } en vez de un numero para espejar un frame.
 *
 * Uso: node scripts/ensamblar-sprites.cjs
 */

const sharp = require('sharp');
const path = require('path');

const SPRITE_DIR = path.join(__dirname, '..', 'assets', 'img', 'sprites-plat');
const FRAME_W = 48;
const FRAME_H = 60;

// Mapeo: indices de frames detectados → orden final en el strip
// Usar numero para frame normal, { idx, flip: true } para espejo horizontal
const PERSONAJES = {
    donbu: {
        // idle(2) + run(6) + jump + fall + hit + atk1(2) + atk2(2) = 15
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15],
    },
    rose: {
        // 15 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
    hana: {
        // 15 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
    kira: {
        // skip frame 14 (efecto disparo suelto) y 16 (1px ruido)
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15],
    },
    pompom: {
        // 15 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
    orejas: {
        // skip frame 1 (1px ruido), 16 (zanahoria suelta), 17 (1px ruido)
        frames: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    lina: {
        // 16 detectados (6 en fila 1), skip frame 8 (run redundante)
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15],
    },
    pandajuro: {
        // 58 detectados, solo frames grandes; skip frame 47 (run redundante)
        frames: [6, 13, 18, 23, 29, 33, 40, 42, 48, 49, 50, 51, 52, 55, 56],
    },
    // --- Enemigos (layout 9: idle×2 + walk×4 + hit + atk×2) ---
    trasgo: {
        // 9 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    topete: {
        // 9 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    pototo: {
        // 9 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    siniestra: {
        // 13 detectados; skip 0 (9x2 ruido), 6 (6x1 ruido), 7 (2x1 ruido), 12 (llama suelta)
        frames: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    },
    errante: {
        // 9 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    profano: {
        // 9 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    grotesca: {
        // 9 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    disonante: {
        // 9 frames limpios, mapeo directo
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
};

async function cargarFrame(nombre, spec) {
    const idx = typeof spec === 'number' ? spec : spec.idx;
    const flip = typeof spec === 'object' && spec.flip;

    const framePath = path.join(SPRITE_DIR, `${nombre}_frame${idx}.png`);
    let pipeline = sharp(framePath).resize(FRAME_W, FRAME_H, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    if (flip) {
        pipeline = pipeline.flop(); // espejo horizontal
    }

    return pipeline.png().toBuffer();
}

async function ensamblar(nombre, config) {
    console.log(`\nEnsamblando ${nombre}...`);

    const frameBuffers = [];
    for (const spec of config.frames) {
        const buf = await cargarFrame(nombre, spec);
        frameBuffers.push(buf);
    }

    const totalFrames = frameBuffers.length;
    const stripWidth = FRAME_W * totalFrames;

    const composites = frameBuffers.map((buf, i) => ({
        input: buf,
        left: i * FRAME_W,
        top: 0,
    }));

    const outputPath = path.join(SPRITE_DIR, `${nombre}.png`);
    await sharp({
        create: {
            width: stripWidth,
            height: FRAME_H,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    })
        .composite(composites)
        .png()
        .toFile(outputPath);

    console.log(`  ${outputPath}: ${stripWidth}x${FRAME_H} (${totalFrames} frames)`);

    // Tambien generar version ampliada para inspeccion
    const previewPath = path.join(SPRITE_DIR, `${nombre}_preview.png`);
    await sharp(outputPath)
        .resize(stripWidth * 4, FRAME_H * 4, { kernel: 'nearest' })
        .toFile(previewPath);
    console.log(`  Preview: ${previewPath}`);
}

async function main() {
    for (const [nombre, config] of Object.entries(PERSONAJES)) {
        await ensamblar(nombre, config);
    }
    console.log('\nEnsamblaje completo.');
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
