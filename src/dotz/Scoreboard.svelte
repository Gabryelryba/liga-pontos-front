<script>
  import Avatar from "arcade-hub-ui/Avatar.svelte";
  import { t } from "arcade-hub-ui/i18n/index.svelte.js";

  // players: the seats ({ index, name, color, left? }), shown in the order of play.
  // turn: whose turn it is (null once the match is over). me: this player's index.
  let { players, order, scores, turn = null, me } = $props();

  const seats = $derived(order.map((index) => players[index]).filter(Boolean));
</script>

<ol class="scoreboard" style:--count={seats.length} aria-label={t("dotz.scoreboard.label")}>
  {#each seats as player (player.index)}
    <li
      class="seat"
      class:active={player.index === turn}
      class:left={player.left}
      style:--c="var(--player-{player.color})"
      aria-current={player.index === turn ? "true" : undefined}
    >
      <span class="top">
        <Avatar name={player.name} color={player.color} size="1.65rem" />
        <span class="score" aria-label={t("dotz.scoreboard.boxes", { count: scores?.[player.index] ?? 0 })}>
          {scores?.[player.index] ?? 0}
        </span>
      </span>
      <span class="name" translate="no">
        {player.index === me ? t("common.you") : player.name}{#if player.left}<span class="tag">
            · {t("common.left")}</span
          >{/if}
      </span>
      <span class="bar" aria-hidden="true"></span>
    </li>
  {/each}
</ol>

<style>
  .scoreboard {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: 34rem;
    display: grid;
    grid-template-columns: repeat(var(--count), minmax(0, 1fr));
    gap: 0.4rem;
  }

  /* Every state has the same height, so the board below never moves. */
  .seat {
    position: relative;
    display: grid;
    gap: 0.3rem;
    padding: 0.55rem 0.65rem 0.7rem;
    border-radius: 1.1rem;
    background: var(--sheen);
    border: 1px solid var(--line);
    min-width: 0;
    transition:
      background-color 0.4s var(--ease-spring),
      border-color 0.4s var(--ease-spring),
      opacity 0.4s var(--ease-spring);
  }

  .seat.active {
    background: var(--surface-raised);
    border-color: var(--line-strong);
  }

  .seat.left {
    opacity: 0.45;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
  }

  .score {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 1.25rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .name {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--ink-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .active .name {
    color: var(--ink);
  }

  .tag {
    font-weight: 500;
    color: var(--ink-faint);
  }

  /* Whose turn: a short bar in that player's colour. */
  .bar {
    position: absolute;
    left: 0.75rem;
    right: 0.75rem;
    bottom: -1px;
    height: 2px;
    border-radius: 999px;
    background: var(--c);
    transform: scaleX(0);
    transition: transform 0.45s var(--ease-spring);
  }

  .active .bar {
    transform: scaleX(1);
  }
</style>
