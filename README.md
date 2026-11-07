# Derrumbe

Juego de bloques que caen, hecho con React, TypeScript y Vite. Su mecánica propia es la **cascada**: al limpiar una fila, los bloques sueltos caen y pueden completar otras filas en cadena. Cada paso de la cadena multiplica los puntos.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta el juego en modo desarrollo |
| `npm test` | Corre los tests una vez |
| `npm run test:watch` | Corre los tests al guardar |
| `npm run build` | Revisa los tipos y genera el bundle |
| `npm run lint` | Corre oxlint |

## Controles

| Tecla | Acción |
| --- | --- |
| `←` `→` | Mover |
| `↑` | Rotar |
| `↓` | Bajar más rápido |
| `Espacio` | Soltar la pieza |
| `P` | Pausar y seguir |
| `Enter` | Reiniciar al terminar la partida |

## Audio

La música (`public/bg-music.mp3`) suena en loop y arranca con la primera tecla, porque los navegadores bloquean el audio hasta que hay una interacción. Se controla con su botón y es independiente de la pausa del juego.

El efecto `public/fallen-piece.mp3` suena cada vez que una pieza se fija. El reducer es puro, así que no reproduce nada: incrementa `piecesLocked` y `useSoundEffects` reacciona a ese cambio.

## Arquitectura

```
src/
├── game/        Reglas del juego, en TypeScript puro y sin React
├── hooks/       Conectan las reglas con React: estado, tiempo y teclado
├── components/  Dibujan el estado
└── test/        Configuración y utilidades de tests
```

La regla principal es que `src/game/` no importa React. Todo cambio de estado pasa por `gameReducer(state, action)`, que es una función pura: incluso el azar sale de una semilla guardada en el estado. Por eso las reglas se pueden testear sin navegador y con resultados repetibles.

El flujo es siempre el mismo:

```
Teclado o tiempo → dispatch(acción) → gameReducer → estado nuevo → componentes
```

### La cascada

Cuando una pieza se fija y completa filas, la fase pasa a `cascading` y cada `tick` resuelve un paso:

1. Quita las filas llenas y suma `filas × 100 × cadena`.
2. Compacta cada columna hacia abajo.
3. Si se completaron filas nuevas, la cadena crece y se repite en el próximo `tick`.
4. Si no, sale la pieza siguiente.

## Cómo agregar funcionalidades

| Funcionalidad | Dónde va |
| --- | --- |
| Pieza nueva | Una entrada en `PIECE_SHAPES` (`game/pieces.ts`) y su color en `index.css` |
| Ajustar velocidad, tablero o puntos | `game/config.ts` |
| Pieza siguiente | Hacer que `bag` nunca quede vacía y mostrar `bag[0]` en un componente nuevo |
| Sonido nuevo | Un contador en `GameState` y su reacción en `hooks/useSoundEffects.ts` |
| Niveles | Campo `level` en `GameState`, calculado desde `rowsCleared`, y un delay que dependa del nivel |
| Reserva de pieza | Campo `held` en `GameState` y una acción `hold` en el reducer |
| Pieza fantasma | Función pura que calcule dónde caería la pieza, reutilizando `collides`, y dibujarla en `Board` |
| Récord | Hook nuevo que lea y guarde en `localStorage` |
| Controles táctiles | Botones que llamen a las mismas acciones que el teclado |
