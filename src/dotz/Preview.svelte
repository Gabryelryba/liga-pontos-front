<script>
  // A small looping picture of the game for the hub card: a board in progress,
  // two lines drawn in turn, and the second one closes a box. CSS only.
  const DOTS = [0, 1, 2, 3];
  const at = (i) => 45 + i * 70;
</script>

<svg class="preview" viewBox="0 0 300 300" aria-hidden="true">
  <!-- An earlier box, already owned by player 1. -->
  <rect class="box p1" x="45" y="45" width="70" height="70" rx="6" />
  <text class="letter" x="80" y="81">I</text>

  <!-- The box about to close. -->
  <rect class="box p2 closing" x="115" y="115" width="70" height="70" rx="6" />
  <text class="letter closing-letter" x="150" y="151">C</text>

  <g class="lines">
    <line class="p1" x1="45" y1="45" x2="115" y2="45" />
    <line class="p1" x1="45" y1="115" x2="115" y2="115" />
    <line class="p1" x1="45" y1="45" x2="45" y2="115" />
    <line class="p1" x1="115" y1="45" x2="115" y2="115" />
    <line class="p2" x1="115" y1="115" x2="185" y2="115" />
    <line class="p1" x1="115" y1="115" x2="115" y2="185" />
    <line class="p3" x1="185" y1="45" x2="255" y2="45" />
    <line class="p4" x1="255" y1="185" x2="255" y2="255" />
    <line class="p3" x1="115" y1="255" x2="185" y2="255" />
    <line class="p1 draw first" x1="185" y1="115" x2="185" y2="185" />
    <line class="p2 draw second" x1="115" y1="185" x2="185" y2="185" />
  </g>

  {#each DOTS as r (r)}
    {#each DOTS as c (c)}
      <circle class="dot" cx={at(c)} cy={at(r)} r="7" />
    {/each}
  {/each}
</svg>

<style>
  .preview {
    --cycle: 6s;
    width: min(15rem, 70%);
    height: auto;
    padding: 1.25rem 0;
    overflow: visible;
  }

  .lines line {
    stroke-width: 9;
    stroke-linecap: round;
  }

  .p1 {
    stroke: var(--player-1);
    fill: var(--player-1);
  }

  .p2 {
    stroke: var(--player-2);
    fill: var(--player-2);
  }

  .p3 {
    stroke: var(--player-3);
  }

  .p4 {
    stroke: var(--player-4);
  }

  .box {
    stroke: none;
    fill-opacity: 0.22;
  }

  .letter {
    fill: var(--ink);
    font: 700 26px var(--font-sans);
    text-anchor: middle;
    dominant-baseline: middle;
    opacity: 0.8;
  }

  .dot {
    fill: var(--ink);
  }

  .draw {
    transform-box: fill-box;
    transform-origin: 0 0;
  }

  .first {
    animation: draw-v var(--cycle) var(--ease-spring) infinite;
  }

  .second {
    animation: draw-h var(--cycle) var(--ease-spring) infinite;
  }

  @keyframes draw-v {
    0%,
    14% {
      opacity: 0;
      transform: scaleY(0);
    }
    24%,
    90% {
      opacity: 1;
      transform: none;
    }
    100% {
      opacity: 0;
      transform: none;
    }
  }

  @keyframes draw-h {
    0%,
    38% {
      opacity: 0;
      transform: scaleX(0);
    }
    48%,
    90% {
      opacity: 1;
      transform: none;
    }
    100% {
      opacity: 0;
      transform: none;
    }
  }

  .closing,
  .closing-letter {
    transform-box: fill-box;
    transform-origin: center;
    animation: close-box var(--cycle) var(--ease-spring) infinite;
  }

  @keyframes close-box {
    0%,
    50% {
      opacity: 0;
      transform: scale(0.6);
    }
    60%,
    90% {
      opacity: 1;
      transform: none;
    }
    100% {
      opacity: 0;
      transform: none;
    }
  }

  .closing-letter {
    opacity: 0.8;
  }

  @media (prefers-reduced-motion: reduce) {
    .first,
    .second,
    .closing,
    .closing-letter {
      animation: none;
    }
  }
</style>
