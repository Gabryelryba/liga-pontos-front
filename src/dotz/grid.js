// Geometry of the Dotz board, in grid units: the dot in row r, column c sits at
// (x = c, y = r), so neighbouring dots are 1 apart. Line indexes match the
// server's (back end: games/dotz/game.js):
//   h[r * (n - 1) + c]  from dot (r, c) to dot (r, c + 1)
//   v[r * n + c]        from dot (r, c) to dot (r + 1, c)

const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));

export function hLine(n, r, c) {
  return { kind: "h", index: r * (n - 1) + c, from: [r, c], to: [r, c + 1] };
}

export function vLine(n, r, c) {
  return { kind: "v", index: r * n + c, from: [r, c], to: [r + 1, c] };
}

// Every line on an n x n board.
export function allLines(n) {
  const lines = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n - 1; c++) lines.push(hLine(n, r, c));
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n; c++) lines.push(vLine(n, r, c));
  return lines;
}

// A move is drawn like on paper: press on a dot, drag towards a neighbour,
// release. These helpers turn pointer positions (in grid units) into dots.

// The dot nearest to (x, y) as [row, col], or null when it is `reach` or more away.
export function nearestDot(n, x, y, reach = 0.5) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || n < 2) return null;
  const r = clamp(Math.round(y), 0, n - 1);
  const c = clamp(Math.round(x), 0, n - 1);
  return Math.hypot(x - c, y - r) < reach ? [r, c] : null;
}

// While dragging from dot `from`: the neighbour the pointer at (x, y) is
// heading for, along the axis it has moved most on, once it has moved at least
// `minDrag` grid units. Null before that, or towards the edge of the board.
export function neighbourToward(n, from, x, y, minDrag = 0.35) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const [r, c] = from;
  const dx = x - c;
  const dy = y - r;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < minDrag) return null;
  const [tr, tc] = Math.abs(dx) >= Math.abs(dy) ? [r, c + Math.sign(dx)] : [r + Math.sign(dy), c];
  return tr >= 0 && tr < n && tc >= 0 && tc < n ? [tr, tc] : null;
}

// The line between two neighbouring dots, or null if they are not neighbours.
export function lineBetween(n, a, b) {
  const [first, second] = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? [a, b] : [b, a];
  if (first[0] === second[0] && second[1] - first[1] === 1) return hLine(n, first[0], first[1]);
  if (first[1] === second[1] && second[0] - first[0] === 1) return vLine(n, first[0], first[1]);
  return null;
}

// The neighbours of a dot that still have a free line to it.
export function freeNeighbours(state, n, [r, c]) {
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ].filter(([nr, nc]) => nr >= 0 && nr < n && nc >= 0 && nc < n && !isDrawn(state, lineBetween(n, [r, c], [nr, nc])));
}

export function isDrawn(state, line) {
  return state[line.kind][line.index] !== null;
}

export function linesLeft(state) {
  return state.h.filter((x) => x === null).length + state.v.filter((x) => x === null).length;
}
