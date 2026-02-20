/**
 * Procesa sprite sheets generados con IA:
 * 1. Remueve fondo verde (chroma key)
 * 2. Detecta frames individuales
 * 3. Normaliza tamaño
 * 4. Genera sprite sheet final (strip horizontal PNG con transparencia)
 *
 * Uso: node scripts/procesar-sprites.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', 'assets', 'img', 'generadas');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'img', 'sprites-plat');

// Tamaño final de cada frame en el sprite sheet
const FRAME_W = 32;
const FRAME_H = 40;

// Personajes a procesar
const SHEETS = [
    { input: 'spritesheet_lina_v1.jpg', output: 'lina.png', name: 'Lina' },
    { input: 'spritesheet_pandajuro_v1.jpg', output: 'pandajuro.png', name: 'PandaJuro' },
    { input: 'spritesheet_donbu_v3.jpg', output: 'donbu.png', name: 'DonBu' },
];

// --- Utilidades ---

function esVerde(r, g, b) {
    return g > 80 && g > r * 1.2 && g > b * 1.2;
}

function encontrarBandas(histograma, umbral) {
    // Encuentra rangos continuos donde histograma > umbral
    const bandas = [];
    let inicio = -1;
    for (let i = 0; i < histograma.length; i++) {
        if (histograma[i] > umbral && inicio === -1) {
            inicio = i;
        } else if ((histograma[i] <= umbral || i === histograma.length - 1) && inicio !== -1) {
            const fin = histograma[i] > umbral ? i : i - 1;
            bandas.push({ inicio, fin, largo: fin - inicio + 1 });
            inicio = -1;
        }
    }
    return bandas;
}

async function procesarSheet(config) {
    console.log(`\nProcesando ${config.name}...`);
    const inputPath = path.join(INPUT_DIR, config.input);
    const outputPath = path.join(OUTPUT_DIR, config.output);

    // 1. Cargar imagen y obtener pixeles raw RGBA
    const meta = await sharp(inputPath).metadata();
    const { width, height } = meta;
    console.log(`  Entrada: ${width}x${height}`);

    const rawBuffer = await sharp(inputPath).ensureAlpha().raw().toBuffer();
    const pixels = Buffer.from(rawBuffer);

    // 2. Remover fondo verde → transparente
    let removidos = 0;
    for (let i = 0; i < pixels.length; i += 4) {
        if (esVerde(pixels[i], pixels[i + 1], pixels[i + 2])) {
            pixels[i + 3] = 0;
            removidos++;
        }
    }
    console.log(`  Pixels verdes removidos: ${removidos}`);

    // Tambien limpiar pixels semi-transparentes en bordes (anti-alias del green)
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] > 0 && pixels[i + 3] < 40) {
            pixels[i + 3] = 0;
        }
    }

    // 3. Histograma horizontal (por columna) y vertical (por fila)
    const histX = new Uint32Array(width); // non-transparent pixels per column
    const histY = new Uint32Array(height); // non-transparent pixels per row

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            if (pixels[idx + 3] > 0) {
                histX[x]++;
                histY[y]++;
            }
        }
    }

    // 4. Detectar filas de sprites (bandas horizontales con contenido)
    const bandasY = encontrarBandas(histY, width * 0.005);
    console.log(`  Bandas verticales: ${bandasY.length} (${bandasY.map((b) => `${b.inicio}-${b.fin}`).join(', ')})`);

    // 5. Para cada banda vertical, detectar columnas de sprites
    const frames = [];
    for (const bandaY of bandasY) {
        // Histograma horizontal solo dentro de esta banda
        const histBandaX = new Uint32Array(width);
        for (let y = bandaY.inicio; y <= bandaY.fin; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                if (pixels[idx + 3] > 0) histBandaX[x]++;
            }
        }

        const bandasX = encontrarBandas(histBandaX, (bandaY.largo * 0.01));

        for (const bandaX of bandasX) {
            // Encontrar bounding box exacto dentro de esta celda
            let minX = bandaX.fin, maxX = bandaX.inicio;
            let minY = bandaY.fin, maxY = bandaY.inicio;

            for (let y = bandaY.inicio; y <= bandaY.fin; y++) {
                for (let x = bandaX.inicio; x <= bandaX.fin; x++) {
                    const idx = (y * width + x) * 4;
                    if (pixels[idx + 3] > 0) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            if (maxX >= minX && maxY >= minY) {
                frames.push({
                    x: minX,
                    y: minY,
                    w: maxX - minX + 1,
                    h: maxY - minY + 1,
                });
            }
        }
    }

    console.log(`  Frames detectados: ${frames.length}`);
    frames.forEach((f, i) => {
        console.log(`    Frame ${i}: ${f.x},${f.y} ${f.w}x${f.h}`);
    });

    // 6. Guardar imagen con transparencia como intermedio
    const transparentImg = sharp(pixels, {
        raw: { width, height, channels: 4 },
    }).png();

    // 7. Extraer cada frame, redimensionar a FRAME_W x FRAME_H, ensamblar strip
    const frameBuffers = [];
    for (let i = 0; i < frames.length; i++) {
        const f = frames[i];
        const extracted = await transparentImg
            .clone()
            .extract({ left: f.x, top: f.y, width: f.w, height: f.h })
            .resize(FRAME_W, FRAME_H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer();

        frameBuffers.push(extracted);

        // Guardar frame individual para inspección
        const framePath = path.join(OUTPUT_DIR, `${config.name.toLowerCase()}_frame${i}.png`);
        await sharp(extracted).toFile(framePath);
    }

    // 8. Ensamblar strip horizontal
    const stripWidth = FRAME_W * frames.length;
    const stripHeight = FRAME_H;

    const composites = [];
    for (let i = 0; i < frameBuffers.length; i++) {
        composites.push({
            input: frameBuffers[i],
            left: i * FRAME_W,
            top: 0,
        });
    }

    await sharp({
        create: {
            width: stripWidth,
            height: stripHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    })
        .composite(composites)
        .png()
        .toFile(outputPath);

    console.log(`  Strip final: ${stripWidth}x${stripHeight} → ${outputPath}`);
    console.log(`  Frames: ${frames.length} de ${FRAME_W}x${FRAME_H}`);

    return frames.length;
}

async function main() {
    // Crear directorio de salida
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const sheet of SHEETS) {
        await procesarSheet(sheet);
    }

    console.log('\nProcesamiento completo.');
    console.log(`Archivos en: ${OUTPUT_DIR}`);
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
