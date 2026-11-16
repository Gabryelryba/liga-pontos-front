import { describe, test, expect } from "vitest";
import {
  nearestDot,
  neighbourToward,
  lineBetween,
  freeNeighbours,
  allLines,
  isDrawn,
  linesLeft,
  hLine,
  vLine,
} from "./grid.js";

describe("nearestDot", () => {
  test("picks the dot under the finger", () => {
    expect(nearestDot(6, 2.1, 3.2)).toEqual([3, 2]);
    expect(nearestDot(6, 0, 0)).toEqual([0, 0]);
  });

  test("the middle of a box is too far from every dot", () => {
    expect(nearestDot(6, 1.5, 1.5)).toBeNull();
    expect(nearestDot(6, 1.5, 1.5, 0.8)).not.toBeNull();
  });

  test("just outside the board still reaches the corner, far outside does not", () => {
    expect(nearestDot(6, -0.3, 5.2)).toEqual([5, 0]);
    expect(nearestDot(6, -0.8, 2)).toBeNull();
  });

  test("bad input", () => {
    expect(nearestDot(6, NaN, 1)).toBeNull();
    expect(nearestDot(1, 0, 0)).toBeNull();
  });
});

describe("neighbourToward", () => {
  test("nothing until the drag is long enough", () => {
    expect(neighbourToward(6, [2, 2], 2.2, 2.1)).toBeNull();
  });

  test("follows the axis the pointer moved most on", () => {
    expect(neighbourToward(6, [2, 2], 2.8, 2.3)).toEqual([2, 3]);
    expect(neighbourToward(6, [2, 2], 1.4, 1.9)).toEqual([2, 1]);
    expect(neighbourToward(6, [2, 2], 2.3, 3.6)).toEqual([3, 2]);
    expect(neighbourToward(6, [2, 2], 1.8, 1.2)).toEqual([1, 2]);
  });

  test("a drag past the neighbour still means the neighbour", () => {
    expect(neighbourToward(6, [2, 2], 4.9, 2.2)).toEqual([2, 3]);
  });

  test("not off the board", () => {
    expect(neighbourToward(6, [0, 0], -0.8, 0)).toBeNull();
    expect(neighbourToward(6, [5, 5], 5, 5.9)).toBeNull();
  });
});

describe("lineBetween", () => {
  test("neighbours in either order, with the server's indexes", () => {
    expect(lineBetween(6, [2, 3], [2, 4])).toEqual(hLine(6, 2, 3));
    expect(lineBetween(6, [2, 4], [2, 3])).toEqual(hLine(6, 2, 3));
    expect(lineBetween(6, [3, 1], [2, 1])).toEqual(vLine(6, 2, 1));
    expect(hLine(12, 2, 3).index).toBe(2 * 11 + 3);
    expect(vLine(12, 2, 3).index).toBe(2 * 12 + 3);
  });

  test("not neighbours", () => {
    expect(lineBetween(6, [0, 0], [1, 1])).toBeNull();
    expect(lineBetween(6, [0, 0], [0, 2])).toBeNull();
    expect(lineBetween(6, [1, 1], [1, 1])).toBeNull();
  });
});

test("freeNeighbours leaves out drawn lines and the edge", () => {
  const n = 6;
  const state = { h: Array(n * (n - 1)).fill(null), v: Array((n - 1) * n).fill(null) };
  expect(freeNeighbours(state, n, [0, 0])).toEqual([
    [1, 0],
    [0, 1],
  ]);
  state.h[hLine(n, 2, 2).index] = 0;
  expect(freeNeighbours(state, n, [2, 2])).toEqual([
    [1, 2],
    [3, 2],
    [2, 1],
  ]);
});

test("allLines covers the board once", () => {
  for (const n of [6, 12, 18]) {
    const lines = allLines(n);
    expect(lines).toHaveLength(2 * n * (n - 1));
    expect(new Set(lines.map((l) => `${l.kind}${l.index}`)).size).toBe(lines.length);
  }
});

test("drawn and remaining lines", () => {
  const state = { h: [0, null, null], v: [null, 1, null] };
  expect(isDrawn(state, { kind: "h", index: 0 })).toBe(true);
  expect(isDrawn(state, { kind: "v", index: 0 })).toBe(false);
  expect(linesLeft(state)).toBe(4);
});
