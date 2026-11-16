// End of a Dotz match (RN-DZ-24): the shared ranking and vote (src/lib/result.js),
// with Dotz's own line under a single winner.

import { t } from "arcade-hub-ui/i18n/index.svelte.js";
import { ranking, rematchVote, headline as sharedHeadline } from "arcade-hub-ui/result.js";

export { ranking, rematchVote };

// -> { title, detail, won }
export function headline(game, players, me) {
  return sharedHeadline({
    winners: game.winners ?? [],
    scores: game.scores,
    players,
    me,
    forfeit: game.reason === "forfeit",
    soloDetail: (score) => t("dotz.result.boxesOf", { score, total: game.boxes.length }),
  });
}
