import { describe, test, expect, afterEach } from "vitest";
import { ranking, headline, rematchVote } from "./result.js";
import { setLanguage } from "arcade-hub-ui/i18n/index.svelte.js";

afterEach(() => setLanguage("en"));

test("in Portuguese", () => {
  setLanguage("pt-BR");
  const players = [
    { index: 0, name: "Iara", color: 1 },
    { index: 1, name: "Caetano", color: 2 },
    { index: 2, name: "Lívia", color: 3 },
  ];
  const game = { order: [0, 1, 2], boxes: Array(9).fill(0), scores: { 0: 4, 1: 4, 2: 1 }, winners: [0, 1], reason: "board-full" };
  expect(headline(game, players, 2)).toEqual({ title: "Empate", detail: "Iara e Caetano dividem o topo.", won: false });
  expect(headline(game, players, 0).detail).toBe("Você divide o topo com Caetano.");
  expect(rematchVote([{ again: true }, {}, {}], 0).note).toBe("1 de 3 querem jogar de novo. Começa quando todos toparem.");
});

describe("rematchVote", () => {
  const seats = (...flags) =>
    flags.map((f, index) => ({ index, name: `P${index}`, color: index + 1, ...(f === "again" ? { again: true } : {}), ...(f === "left" ? { left: true } : {}) }));

  test("counts the votes of everyone still here", () => {
    expect(rematchVote(seats("again", null, "left"), 1)).toEqual({
      count: 1,
      total: 2,
      mine: false,
      alone: false,
      note: "1 of 2 want to play again.",
    });
  });

  test("after voting, waiting for the others", () => {
    const vote = rematchVote(seats("again", "again", null), 0);
    expect(vote.mine).toBe(true);
    expect(vote.note).toBe("2 of 3 want to play again. It starts when everyone is in.");
  });

  test("nobody voted yet: no note", () => {
    expect(rematchVote(seats(null, null), 0).note).toBe("");
  });

  test("alone: no vote can start a match", () => {
    const vote = rematchVote(seats(null, "left", "left"), 0);
    expect(vote.alone).toBe(true);
    expect(vote.note).toMatch(/waiting room/);
  });
});

const players = [
  { index: 0, name: "Iara", color: 1 },
  { index: 1, name: "Caetano", color: 2 },
  { index: 2, name: "Lívia", color: 3 },
];

const game = (scores, winners, reason = "board-full") => ({
  order: [2, 0, 1],
  boxes: Array(9).fill(0),
  scores,
  winners,
  reason,
});

describe("ranking", () => {
  test("most boxes first, ties in the order of play, winners marked", () => {
    const rows = ranking(game({ 0: 3, 1: 4, 2: 2 }, [1]), players);
    expect(rows.map((r) => r.name)).toEqual(["Caetano", "Iara", "Lívia"]);
    expect(rows.map((r) => r.winner)).toEqual([true, false, false]);

    const tied = ranking(game({ 0: 3, 1: 3, 2: 3 }, [2, 0, 1]), players);
    expect(tied.map((r) => r.name)).toEqual(["Lívia", "Iara", "Caetano"]);
    expect(tied.every((r) => r.winner)).toBe(true);
  });
});

describe("headline", () => {
  test("a single winner", () => {
    expect(headline(game({ 0: 5, 1: 2, 2: 2 }, [0]), players, 0)).toEqual({
      title: "You Win",
      detail: "5 of 9 boxes.",
      won: true,
    });
    expect(headline(game({ 0: 5, 1: 2, 2: 2 }, [0]), players, 1).title).toBe("Iara Wins");
  });

  test("a tie", () => {
    const tie = game({ 0: 3, 1: 3, 2: 3 }, [2, 0, 1]);
    expect(headline(tie, players, 0)).toEqual({
      title: "Shared Win",
      detail: "You share the top with Lívia and Caetano.",
      won: true,
    });
    expect(headline(game({ 0: 4, 1: 4, 2: 1 }, [0, 1]), players, 2)).toEqual({
      title: "It’s a Tie",
      detail: "Iara and Caetano share the top.",
      won: false,
    });
  });

  test("everyone else left", () => {
    expect(headline(game({ 0: 1, 1: 0, 2: 0 }, [1], "forfeit"), players, 1)).toEqual({
      title: "You Win",
      detail: "Everyone else left the match.",
      won: true,
    });
  });
});
