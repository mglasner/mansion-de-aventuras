# Paletas CSS

## Villano

Agregar en `estilos.css` antes del comentario `/* --- Overlay de empezar */`.
Estructura de 5 bloques con variables CSS:

```css
/* Nombre — color/descripción */
.villano-nombre {
    --v-color: #COLOR;
    --v-oscuro: #OSCURO;
    --v-glow: rgb(R G B / 40%);
    --v-tenue: rgb(R G B / 12%);

    border-color: #BORDE;
    background-color: #FONDO;
}

.villano-nombre h3 {
    color: #COLOR;
}

.villano-nombre .avatar img {
    border-color: #OSCURO;
    box-shadow: 0 0 10px rgb(R G B / 40%);
}

.villano-nombre .barra-vida-relleno {
    background: linear-gradient(90deg, #OSCURO, #COLOR);
}

.villano-nombre .ataque-dano {
    color: #COLOR;
    background-color: rgb(R G B / 15%);
}
```

## Paletas ya utilizadas

| Villano | Color | Descripción |
|---------|-------|-------------|
| Siniestra | #f44 | rojo/negro |
| Trasgo | #888 | negro/gris |
| El Profano | #48c | azul/negro |
| El Errante | #4c4 | verde/negro |
| Topete | #c050d0 | púrpura/magenta |
| Pototo | #e060a0 | rosa/magenta |
| La Grotesca | #a8325a | vino/púrpura oscuro |

**Regla:** Elegir un color principal que no se parezca a los existentes.

## Patrón de colores derivados

A partir del color principal `#COLOR`:
- `--v-oscuro`: versión oscura (reducir brillo ~50%)
- `--v-glow`: mismos RGB con alpha 40%
- `--v-tenue`: mismos RGB con alpha 12%
- `border-color`: muy oscuro (casi negro con tinte del color)
- `background-color`: negro con tinte sutil del color

## Héroe

Los héroes no usan `.villano-*` sino `.jugador-*` con un patrón diferente.
Verificar las clases existentes en `estilos.css` buscando `.jugador-` para
seguir el patrón establecido.
