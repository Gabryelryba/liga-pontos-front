<script>
  import GridNine from "phosphor-svelte/lib/GridNine";
  import WaitingRoom from "arcade-hub-ui/WaitingRoom.svelte";
  import OptionPicker from "arcade-hub-ui/OptionPicker.svelte";
  import { GRIDS } from "./lobbyText.js";
  import { t } from "arcade-hub-ui/i18n/index.svelte.js";

  // The shared waiting room, with the board size as Dotz's own setting.
  // lobby: the last `lobby` event; rules: { minPlayers, maxPlayers } from Dotz.svelte.
  let { lobby, rules, onOption, ...room } = $props();

  const gridChoices = $derived(GRIDS.map((g) => ({ value: g.id, label: t(`dotz.grid.${g.id}`), detail: `${g.dots}×${g.dots}`, dots: g.dots })));
</script>

<WaitingRoom {lobby} minPlayers={rules.minPlayers} maxPlayers={rules.maxPlayers} {...room}>
  {#snippet options(amHost)}
    <OptionPicker
      legend={t("dotz.lobby.board")}
      label={t("dotz.lobby.boardSize")}
      name="grid-size"
      icon={GridNine}
      choices={gridChoices}
      value={lobby.options?.gridSize ?? lobby.gridSize}
      editable={amHost}
      onChange={(size) => onOption("gridSize", size)}
    >
      {#snippet art(choice, on)}
        <span class="mini" class:on style:--dots={choice.dots} aria-hidden="true">
          {#each Array(choice.dots * choice.dots) as _, i (i)}<i></i>{/each}
        </span>
      {/snippet}
    </OptionPicker>
  {/snippet}
</WaitingRoom>

<style>
  .mini {
    display: grid;
    grid-template-columns: repeat(var(--dots), 3px);
    gap: calc(18px / var(--dots));
  }

  .mini i {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: currentColor;
  }

  /* On the filled (blue) segment the dots go white, like the text. */
  .mini.on i {
    background: var(--accent-ink);
  }
</style>
