// The Dotz board sizes, picked by the host in the waiting room. The rest of
// the waiting-room wording is shared: src/lib/lobbyText.js.

import { t } from "arcade-hub-ui/i18n/index.svelte.js";

// The label of each size is dotz.grid.<id> in the dictionaries.
export const GRIDS = [
  { id: "small", dots: 4 },
  { id: "medium", dots: 5 },
  { id: "large", dots: 6 },
];

export function gridLabel(id) {
  const grid = GRIDS.find((g) => g.id === id) ?? GRIDS[1];
  return `${t(`dotz.grid.${grid.id}`)} ${grid.dots}×${grid.dots}`;
}
