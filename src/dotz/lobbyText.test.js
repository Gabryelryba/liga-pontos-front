import { test, expect } from "vitest";
import { gridLabel } from "./lobbyText.js";

test("grid labels", () => {
  expect(gridLabel("small")).toBe("Pequeno 4×4");
  expect(gridLabel("large")).toBe("Grande 6×6");
  expect(gridLabel("nope")).toBe("Médio 5×5");
});
