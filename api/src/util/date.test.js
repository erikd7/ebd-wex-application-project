import { describe, it, expect } from "vitest";
import { sixMonthsAgo } from "./date";

describe("date utils", () => {
  describe("sixMonthsAgo", () => {
    it("returns the date string for six months ago from a given date", () => {
      const inputDate = "2024-06-15";
      const expectedOutput = "2023-12-15";

      const result = sixMonthsAgo(inputDate);

      expect(result).toBe(expectedOutput);
    });
  });
});
