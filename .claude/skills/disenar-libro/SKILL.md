---
name: disenar-libro
description: >
    Generar y optimizar ilustraciones de libros para la Biblioteca de Aventuras.
    Usar cuando el usuario pida: "crear lomo", "nuevo libro", "diseñar libro",
    "imagen de lomo", "ilustración de libro", "agregar libro al estante",
    "rediseñar lomo", "portada de libro", o mencione generar/modificar las
    imágenes de los libros que aparecen en el estante o dentro de los libros.
---

# Diseñar Libro para Biblioteca

Genera ilustraciones de lomos y portadas de libro para la Biblioteca de
Aventuras y las integra en el código (datos JS, componente, CSS).

## Tipos de imagen

| Tipo | Uso | Aspect ratio | Archivo | Reglas de prompt |
|------|-----|-------------|---------|-----------------|
| Lomo | Estante homepage | 2:3 | `lomo-ID.webp` | Solo el lomo (spine), fondo negro, sin texto |
| Portada | Primera página del libro abierto | 3:4 | `portada-ID.webp` | Ilustración completa de portada, sin texto |

## Flujo — Lomo

### Paso 1: Acordar concepto

Definir con el usuario: nombre del libro, paleta de color, emblema/símbolo
central, elementos decorativos. Consultar `references/prompts-imagenes.md`
para las reglas de prompt y ejemplos validados.

### Paso 2: Generar imagen

Usar `mcp__image-gen__generate_image` siguiendo estrictamente el template
de prompt en `references/prompts-imagenes.md`. Mostrar al usuario para
aprobación antes de continuar.

Si la imagen no cumple las reglas (tiene texto, muestra portada en vez de
lomo, incluye superficie/plataforma), regenerar ajustando el prompt.

### Paso 3: Optimizar imagen

Las imágenes generadas por IA vienen en alta resolución (~900KB+). SIEMPRE
optimizar antes de guardar. Redimensionar con sharp al tamaño final y
convertir a webp real:

```bash
node -e "
const sharp = require('sharp');
sharp('assets/img/generadas/lomo-NOMBRE.webp')
  .resize(210, 315)
  .webp({ quality: 82 })
  .toFile('assets/img/biblioteca/lomo-NOMBRE.webp')
  .then(info => console.log('OK', (info.size / 1024).toFixed(0) + ' KB'));
"
```

Eliminar archivos temporales de `assets/img/generadas/`.

**Tamaño objetivo**: <30 KB por lomo.

### Paso 4: Registrar en datos

Agregar entrada en `LIBROS_ESTANTE` de `js/juego.js`:

```js
{ id: 'ID', titulo: 'Título', color: '#hex', img: 'assets/img/biblioteca/lomo-ID.webp' },
```

### Paso 5: Validar

```bash
npm run lint:fix && npm run lint:css:fix && npm run format
```

Verificar con `npm run dev` que el lomo se ve correctamente en el estante.

## Flujo — Portada

### Paso 1: Acordar concepto

Definir con el usuario: nombre del libro, tema de la ilustración, paleta de
color, estilo. Consultar `references/prompts-imagenes.md` sección "Template
de prompt — Portada" para las reglas y ejemplos.

### Paso 2: Generar imagen

Usar `mcp__image-gen__generate_image` con `aspectRatio: "3:4"`. IMPORTANTE:
las portadas tienden a incluir texto aunque se prohíba. Siempre revisar la
imagen generada y regenerar si aparece texto legible.

### Paso 3: Optimizar y guardar imagen

Las imágenes generadas por IA vienen en alta resolución (~900KB+). SIEMPRE
optimizar antes de guardar. Redimensionar a 600×800 (suficiente para retina
en la página derecha del libro que mide ~478px de ancho):

```bash
node -e "
const sharp = require('sharp');
sharp('assets/img/generadas/portada-NOMBRE.webp')
  .resize(600, 800)
  .webp({ quality: 80 })
  .toFile('assets/img/biblioteca/portada-NOMBRE.webp')
  .then(info => console.log('OK', (info.size / 1024).toFixed(0) + ' KB'));
"
```

Eliminar archivos temporales de `assets/img/generadas/`.

**Tamaño objetivo**: <100 KB por portada.

### Paso 4: Registrar en código

La portada se usa como `paginaInicio` en la configuración de `crearLibro()`.
Importar `generarPortada` de `libro.js` y configurar:

```js
import { crearLibro, generarPortada } from './componentes/libro.js';

// En la configuración del libro:
paginaInicio: {
    textoIndice: '\u2726 Portada',
    textoSeccion: 'Portada',
    generarContenido: function () {
        return generarPortada('Nombre del Libro', 'assets/img/biblioteca/portada-ID.webp');
    },
},
```

El prólogo existente se mueve a `paginasExtras` como primera entrada:

```js
paginasExtras: [
    { textoIndice: '\u2726 Prólogo', generarContenido: generarPrologoFn },
    // ...otros extras existentes
],
```

### Paso 5: Validar

```bash
npm run lint:fix && npm run lint:css:fix && npm run format
```

Verificar con `npm run dev` que la portada se ve a página completa con
título superpuesto y pista animada "Pasa la página para explorar".

## Arquitectura de portadas

- **`generarPortada(titulo, imgSrc)`** en `js/componentes/libro.js` — genera
  el DOM: imagen full-page + ornamento + título small-caps + pista animada
- **CSS** en `css/libros/comun.css` sección `.libro-portada-*` — imagen
  `object-fit: cover`, degradado oscuro inferior, título posicionado abajo
- **Page curl amplificado**: `.libro-en-inicio .libro-page-curl` usa animación
  `curl-hint` más pronunciada que la estándar para invitar a pasar página

## Referencias

- **`references/prompts-imagenes.md`** — Reglas de prompt, templates y ejemplos validados para lomos y portadas
