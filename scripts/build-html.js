// Script de build: copia index.html a dist/ reescribiendo rutas para producción

import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'fs';

mkdirSync('dist', { recursive: true });

// Build ID único para cache-busting en cada deploy
const buildId = Date.now().toString(36);

let html = readFileSync('index.html', 'utf-8');

// Reescribir CSS: estilos.css → estilos.min.css?v=buildId
html = html.replace('href="estilos.css"', `href="estilos.min.css?v=${buildId}"`);

// Reescribir JS: js/juego.js → juego.min.js?v=buildId
html = html.replace('src="js/juego.js"', `src="juego.min.js?v=${buildId}"`);

writeFileSync('dist/index.html', html);

// Copiar manifest
cpSync('manifest.webmanifest', 'dist/manifest.webmanifest');

// Copiar assets estáticos (imágenes y fuentes)
cpSync('assets', 'dist/assets', { recursive: true });

// Service worker: inyectar versión única y URLs versionadas
let sw = readFileSync('sw.js', 'utf-8');
sw = sw.replace(/biblioteca-aventuras-v\w+/, 'biblioteca-aventuras-' + buildId);
sw = sw.replace("'juego.min.js'", `'juego.min.js?v=${buildId}'`);
sw = sw.replace("'estilos.min.css'", `'estilos.min.css?v=${buildId}'`);
writeFileSync('dist/sw.js', sw);
// eslint-disable-next-line no-console
console.log('SW cache version: biblioteca-aventuras-' + buildId);
