# Esquemas YAML

## Villano (`datos/enemigos.yaml`)

```yaml
Nombre del Villano:
    tier: esbirro|terror|pesadilla|leyenda    # Requerido
    vida: 50                                   # Requerido (int)
    img: assets/img/enemigos/nombre.webp       # Requerido
    clase: villano-nombre                      # Requerido (sin espacios, kebab-case)
    descripcion: "Párrafo 1.\n\nPárrafo 2."   # Requerido (comillas dobles para \n)
    edad: 120                                  # Requerido (int)
    velocidad: 6                               # Requerido (1-10)
    velAtaque: 7                               # Requerido (1-10)
    estatura: 0.6                              # Requerido (metros, float)
    ataques:                                   # Mínimo 1 ataque
        - nombre: Nombre del Ataque
          dano: 10                             # int
          descripcion: Descripción corta
        - nombre: Segundo Ataque
          dano: 15
          descripcion: Descripción corta
```

**Notas villanos:**
- Si el nombre tiene espacios (ej: "El Profano"), usar tal cual — el generador
  agrega comillas automáticamente en la clave JS.
- `clase` debe ser `villano-` + nombre en kebab-case sin artículos
  (ej: "La Grotesca" → `villano-grotesca`).
- Descripciones con `\n` requieren comillas dobles `"..."` en YAML.
- Descripciones sin `\n` pueden usar comillas simples `'...'`.
- Escapar comillas internas con `\"` dentro de comillas dobles.

## Héroe (`datos/personajes.yaml`)

```yaml
Nombre:
    vida: 90                                   # Requerido (int)
    img: assets/img/personajes/nombre.webp     # Requerido
    clase: jugador-nombre                      # Requerido (kebab-case)
    descripcion: |                             # Requerido (bloque YAML multilínea)
        Párrafo 1 de la descripción del personaje. Tono divertido
        y cercano, describiendo personalidad y habilidades.

        Párrafo 2 con más detalles sobre el personaje en acción
        dentro del juego.
    edad: 10                                   # Requerido (int)
    velocidad: 8                               # Requerido (1-10)
    velAtaque: 7                               # Requerido (1-10)
    estatura: 1.4                              # Requerido (metros, float)
    colorHud: '#2ecc71'                        # Requerido (color principal HUD)
    colorHudClaro: '#6bfc86'                   # Requerido (color claro HUD)
    colorPiel: '#f5d0a9'                       # Requerido (color piel avatar)
    emojiHud: "\u2728"                         # Requerido (emoji unicode)
    ataques:                                   # Mínimo 1 ataque
        - nombre: Nombre del Ataque
          dano: 20
          descripcion: Descripción corta
        - nombre: Segundo Ataque
          dano: 10
          descripcion: Descripción corta
```

**Notas héroes:**
- `clase` debe ser `jugador-` + nombre en kebab-case.
- Descripciones usan bloque literal `|` de YAML (saltos de línea naturales).
- Colores HUD en formato hex con comillas simples.
- Emojis en formato unicode escapado `"\uXXXX"` o `"\U000XXXXX"`.

## Rangos de stats por tier

| Stat | Esbirro | Terror | Pesadilla | Leyenda |
|------|---------|--------|-----------|---------|
| Vida | 35-60 | 130-180 | 200-250 | 250+ |
| Velocidad | 5-8 | 3-6 | 3-5 | 4-7 |
| Vel. Ataque | 5-8 | 3-5 | 4-6 | 5-7 |

## Daño de ataques por tier

Cada villano tiene 2 ataques: uno rápido (menor daño) y uno especial (mayor daño).

| Tier | Ataque rápido | Ataque especial | Filosofía |
|------|--------------|-----------------|-----------|
| Esbirro | 6-8 | 10-12 | Molestias, no amenazas reales |
| Terror | 12-15 | 15-18 | Peligrosos, requieren cuidado |
| Pesadilla | 20-24 | 25-30 | Jefes duros, pocos golpes bastan |
| Leyenda | 25-32 | 35-45 | Devastadores, exigen estrategia |

### Criterio de balance

Los daños deben calibrarse contra la vida de los héroes. Antes de asignar
valores, leer `datos/personajes.yaml` para revisar los HP actuales y calcular
cuántos golpes aguantaría un héroe promedio:

- **Esbirro**: Un héroe aguanta ~8-12 golpes. Molestos pero no letales.
- **Terror**: Un héroe aguanta ~5-7 golpes. Peleas tensas con criterio.
- **Pesadilla**: Un héroe aguanta ~3-4 golpes. Cada error importa.
- **Leyenda**: Un héroe aguanta ~2-3 golpes. Solo expertos sobreviven.

### Antes de crear un villano

Revisar siempre los datos actuales para mantener consistencia:
- `datos/enemigos.yaml` — villanos existentes, sus tiers y daños
- `datos/personajes.yaml` — vida y daños de los héroes (para balance)
