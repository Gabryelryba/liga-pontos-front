import { test, expect, afterEach } from "vitest";
import { gridLabel } from "./lobbyText.js";
import { setLanguage } from "arcade-hub-ui/i18n/index.svelte.js";

afterEach(() => setLanguage("en"));

test("grid labels", () => {
  expect(gridLabel("small")).toBe("Small 4×4");
  expect(gridLabel("large")).toBe("Large 6×6");
  expect(gridLabel("nope")).toBe("Medium 5×5");
  setLanguage("pt-BR");
  expect(gridLabel("large")).toBe("Grande 6×6");
});
