<script>
  import ResultSheet from "arcade-hub-ui/ResultSheet.svelte";
  import { ranking, headline, rematchVote } from "./result.js";

  // The shared result sheet, with Dotz's headline (boxes) over the finished board.
  let { game, players, me, onPlayAgain, onBackToLobby, onMenu } = $props();
</script>

<ResultSheet
  id="dotz"
  head={headline(game, players, me)}
  rows={ranking(game, players)}
  vote={rematchVote(players, me)}
  {me}
  {onPlayAgain}
  {onBackToLobby}
  {onMenu}
/>
