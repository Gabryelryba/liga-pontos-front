<script>
  import { initialOf } from "arcade-hub-ui/player.js";
  import { t } from "arcade-hub-ui/i18n/index.svelte.js";
  import { nearestDot, neighbourToward, lineBetween, freeNeighbours, isDrawn, linesLeft } from "./grid.js";

  // game: the server's state ({ n, h, v, boxes, scores, ... }).
  // players: the seats ({ index, name, color }). me: this player's index.
  // canPlay: it is this player's turn. onMove({ from, to }) sends a line.
  //
  // A line is drawn like with a pen on paper: press on a dot, drag towards a
  // neighbouring dot and release. While dragging, a line follows the finger and
  // snaps to the neighbour it is heading for.
  let { game, players, me, canPlay = false, onMove } = $props();

  // Room around the outer dots, in grid units, so edge dots are easy to grab.
  const PAD = 0.5;

  let svg;
  let drag = $state(null); // { from: [r, c], to: [r, c] | null, x, y } while pressing
  let hoverDot = $state(null); // the dot under the mouse, before pressing

  const n = $derived(game.n);
  const colorOf = (index) => `var(--player-${players[index]?.color ?? 1})`;
  const myColor = $derived(colorOf(me));

  // Someone else is playing: the board steps back. A finished board does not.
  const waiting = $derived(!canPlay && !game.winners);

  // Bigger boards pack the dots closer, so dots and lines get thicker in grid
  // units to keep about the same size on screen.
  const dotR = $derived(n <= 6 ? 0.09 : n <= 12 ? 0.13 : 0.16);
  const stroke = $derived(n <= 6 ? 0.12 : n <= 12 ? 0.17 : 0.21);

  const drawn = $derived.by(() => {
    const out = [];
    for (const kind of ["h", "v"]) {
      game[kind].forEach((owner, index) => {
        if (owner === null) return;
        const r = kind === "h" ? Math.floor(index / (n - 1)) : Math.floor(index / n);
        const c = kind === "h" ? index % (n - 1) : index % n;
        out.push({ key: `${kind}${index}`, owner, x1: c, y1: r, x2: kind === "h" ? c + 1 : c, y2: kind === "h" ? r : r + 1 });
      });
    }
    return out;
  });

  const boxes = $derived(
    game.boxes
      .map((owner, i) => ({ owner, r: Math.floor(i / (n - 1)), c: i % (n - 1), key: i }))
      .filter((b) => b.owner !== null)
  );

  // Where the line being drawn can go: the free neighbours of the dot it starts from.
  const targets = $derived(drag ? freeNeighbours(game, n, drag.from) : []);

  // Until this player has drawn a line, their turn opens with a demo of the
  // gesture: a pen going from a dot to its neighbour, near the middle of the board.
  let hasDrawn = $state(false);
  const hint = $derived.by(() => {
    if (!canPlay || hasDrawn || drag) return null;
    const middle = Math.floor((n - 1) / 2);
    for (let ring = 0; ring < n; ring++) {
      for (let r = middle - ring; r <= middle + ring; r++) {
        for (let c = middle - ring; c <= middle + ring; c++) {
          if (r < 0 || c < 0 || r >= n || c >= n) continue;
          const to = freeNeighbours(game, n, [r, c]).find(([tr, tc]) => tr > r || tc > c);
          if (to) return { from: [r, c], to, kind: to[0] === r ? "h" : "v" };
        }
      }
    }
    return null;
  });

  const description = $derived.by(() => {
    const scores = players.map((p) => `${p.name} ${game.scores?.[p.index] ?? 0}`).join(", ");
    return t("dotz.board", { n, left: linesLeft(game), scores });
  });

  function toGrid(evt) {
    const ctm = svg?.getScreenCTM();
    if (!ctm) return null;
    return new DOMPoint(evt.clientX, evt.clientY).matrixTransform(ctm.inverse());
  }

  // The dot a press can start from: the nearest one (a press anywhere in a cell
  // counts, since on a big board dots are only a few millimetres apart), as long
  // as it still has a free line.
  function startDot(point) {
    const dot = nearestDot(n, point.x, point.y, 0.75);
    return dot && freeNeighbours(game, n, dot).length > 0 ? dot : null;
  }

  // The neighbour the drag is heading for, if its line is still free.
  function targetFor(from, point) {
    const to = neighbourToward(n, from, point.x, point.y);
    return to && !isDrawn(game, lineBetween(n, from, to)) ? to : null;
  }

  function onPointerDown(evt) {
    if (!canPlay || evt.button > 0) return;
    const point = toGrid(evt);
    const from = point && startDot(point);
    if (!from) return;
    evt.preventDefault();
    try {
      // Keep getting the moves when the finger leaves the board mid-drag.
      svg.setPointerCapture(evt.pointerId);
    } catch {
      // A pointer the browser no longer tracks: the drag still works inside the board.
    }
    hoverDot = null;
    drag = { from, to: null, x: point.x, y: point.y };
  }

  function onPointerMove(evt) {
    const point = toGrid(evt);
    if (!point) return;
    if (drag) {
      drag = { ...drag, to: targetFor(drag.from, point), x: point.x, y: point.y };
    } else if (canPlay && evt.pointerType === "mouse") {
      hoverDot = startDot(point);
    }
  }

  function onPointerUp() {
    if (!drag) return;
    const { from, to } = drag;
    drag = null;
    if (to && canPlay) {
      hasDrawn = true;
      onMove({ from, to });
    }
  }

  function onPointerCancel() {
    drag = null;
    hoverDot = null;
  }

  // The turn moved on: drop whatever was being drawn.
  $effect(() => {
    if (!canPlay) {
      drag = null;
      hoverDot = null;
    }
  });
</script>

<div class="board-wrap">
  <svg
    bind:this={svg}
    class="board"
    class:idle={waiting}
    class:can-play={canPlay}
    class:dragging={drag !== null}
    viewBox="{-PAD} {-PAD} {n - 1 + 2 * PAD} {n - 1 + 2 * PAD}"
    role="img"
    aria-label={description}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerCancel}
    onpointerleave={(evt) => evt.pointerType === "mouse" && !drag && (hoverDot = null)}
  >
    {#each boxes as box (box.key)}
      <g class="box" style:--c={colorOf(box.owner)}>
        <rect x={box.c + 0.07} y={box.r + 0.07} width="0.86" height="0.86" rx="0.1" />
        <text x={box.c + 0.5} y={box.r + 0.53}>{initialOf(players[box.owner]?.name)}</text>
      </g>
    {/each}

    {#each drawn as line (line.key)}
      <line
        class="drawn"
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke-width={stroke}
        style:stroke={colorOf(line.owner)}
      />
    {/each}

    {#if drag}
      {@const [r, c] = drag.from}
      {#if drag.to}
        <!-- Snapped: this is the line that release will draw. -->
        <line class="pen snapped" x1={c} y1={r} x2={drag.to[1]} y2={drag.to[0]} stroke-width={stroke} style:stroke={myColor} />
      {:else}
        <!-- Not on a neighbour yet: the pen follows the finger. -->
        <line class="pen" x1={c} y1={r} x2={drag.x} y2={drag.y} stroke-width={stroke * 0.7} style:stroke={myColor} />
      {/if}
      {#each targets as [tr, tc] (`${tr}-${tc}`)}
        {@const on = drag.to?.[0] === tr && drag.to?.[1] === tc}
        <circle
          class="target"
          class:on
          cx={tc}
          cy={tr}
          r={dotR * 2.6}
          stroke-width={dotR * 0.7}
          stroke-dasharray={on ? "none" : `${dotR * 1.4} ${dotR * 1.1}`}
          style:stroke={myColor}
        />
      {/each}
      <circle class="origin" cx={c} cy={r} r={dotR * 2.8} style:fill={myColor} />
    {:else if hoverDot}
      <circle
        class="hover"
        cx={hoverDot[1]}
        cy={hoverDot[0]}
        r={dotR * 2.6}
        stroke-width={dotR * 0.7}
        style:stroke={myColor}
      />
    {:else if hint}
      {@const [r, c] = hint.from}
      <g class="hint {hint.kind}" style:--dx={hint.to[1] - c} style:--dy={hint.to[0] - r} aria-hidden="true">
        <line class="hint-line" x1={c} y1={r} x2={hint.to[1]} y2={hint.to[0]} stroke-width={stroke} style:stroke={myColor} />
        <circle class="hint-pen" cx={c} cy={r} r={dotR * 2.6} style:fill={myColor} />
      </g>
    {/if}

    {#each Array(n) as _, r (r)}
      {#each Array(n) as _, c (c)}
        <circle class="dot" cx={c} cy={r} r={dotR} />
      {/each}
    {/each}
  </svg>
</div>

<style>
  /* The board is as large as the space it is given allows, and always square. */
  .board-wrap {
    container-type: size;
    width: 100%;
    height: min(72vh, 44rem);
    display: grid;
    place-items: center;
  }

  .board {
    width: min(100cqw, 100cqh);
    height: min(100cqw, 100cqh);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    transition: opacity 0.4s var(--ease-spring);
  }

  .board.can-play {
    cursor: grab;
  }

  .board.dragging {
    cursor: grabbing;
  }

  /* Not your turn: the board steps back. */
  .board.idle {
    opacity: 0.62;
  }

  .dot {
    fill: var(--ink);
  }

  /* The demo of the gesture: the pen presses a dot, slides to its neighbour
     drawing the line, lifts, and starts over. */
  .hint {
    pointer-events: none;
  }

  .hint-line {
    stroke-linecap: round;
    opacity: 0.55;
    transform-box: fill-box;
    transform-origin: 0 0;
    animation: hint-draw 2.4s var(--ease-spring) infinite;
  }

  .hint.h .hint-line {
    --hint-from: scale(0, 1);
  }

  .hint.v .hint-line {
    --hint-from: scale(1, 0);
  }

  @keyframes hint-draw {
    0%,
    20% {
      transform: var(--hint-from);
      opacity: 0;
    }
    60%,
    80% {
      transform: none;
      opacity: 0.55;
    }
    100% {
      transform: none;
      opacity: 0;
    }
  }

  .hint-pen {
    opacity: 0;
    animation: hint-pen 2.4s var(--ease-spring) infinite;
  }

  @keyframes hint-pen {
    0% {
      opacity: 0;
      transform: none;
    }
    15%,
    20% {
      opacity: 0.45;
      transform: none;
    }
    60%,
    75% {
      opacity: 0.45;
      transform: translate(calc(var(--dx) * 1px), calc(var(--dy) * 1px));
    }
    90%,
    100% {
      opacity: 0;
      transform: translate(calc(var(--dx) * 1px), calc(var(--dy) * 1px));
    }
  }

  .drawn,
  .pen {
    stroke-linecap: round;
  }

  .drawn {
    transform-box: fill-box;
    transform-origin: center;
    animation: draw 0.45s var(--ease-spring);
  }

  @keyframes draw {
    from {
      transform: scale(0.2);
      opacity: 0;
    }
  }

  .pen {
    opacity: 0.55;
    pointer-events: none;
  }

  .pen.snapped {
    opacity: 0.9;
  }

  .origin {
    opacity: 0.35;
    pointer-events: none;
    transform-box: fill-box;
    transform-origin: center;
    animation: grab 0.3s var(--ease-spring);
  }

  @keyframes grab {
    from {
      transform: scale(0.4);
    }
  }

  .target,
  .hover {
    fill: none;
    pointer-events: none;
  }

  .target {
    opacity: 0.45;
    transition: opacity 0.2s var(--ease-spring);
  }

  .target.on {
    opacity: 1;
  }

  .hover {
    opacity: 0.7;
  }

  .box rect {
    fill: var(--c);
    fill-opacity: 0.2;
  }

  .box text {
    fill: var(--c);
    font: 700 0.42px var(--font-sans);
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .box {
    transform-box: fill-box;
    transform-origin: center;
    animation: claim 0.55s var(--ease-spring);
  }

  @keyframes claim {
    from {
      transform: scale(0.55);
      opacity: 0;
    }
  }

  /* Without motion the demo shows its end: the line drawn faintly, the pen on the neighbour. */
  @media (prefers-reduced-motion: reduce) {
    .hint-line {
      animation: none;
      opacity: 0.4;
    }

    .hint-pen {
      animation: none;
      opacity: 0.35;
      transform: translate(calc(var(--dx) * 1px), calc(var(--dy) * 1px));
    }
  }
</style>
