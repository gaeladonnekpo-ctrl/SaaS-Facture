import { describe, expect, it } from "vitest";
import { amountInWords, numberInWords } from "../../lib/invoice/amount-in-words";

describe("numberInWords", () => {
  const cases: Array<[number, string]> = [
    [0, "zéro"],
    [1, "un"],
    [16, "seize"],
    [17, "dix-sept"],
    [21, "vingt et un"],
    [22, "vingt-deux"],
    [70, "soixante-dix"],
    [71, "soixante et onze"],
    [77, "soixante-dix-sept"],
    [80, "quatre-vingts"],
    [81, "quatre-vingt-un"],
    [91, "quatre-vingt-onze"],
    [99, "quatre-vingt-dix-neuf"],
    [100, "cent"],
    [101, "cent un"],
    [200, "deux cents"],
    [201, "deux cent un"],
    [280, "deux cent quatre-vingts"],
    [1000, "mille"],
    [1001, "mille un"],
    [1180, "mille cent quatre-vingts"],
    [2000, "deux mille"],
    [21_000, "vingt et un mille"],
    [80_000, "quatre-vingt mille"],
    [200_000, "deux cent mille"],
    [236_000, "deux cent trente-six mille"],
    [999_999, "neuf cent quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuf"],
    [1_000_000, "un million"],
    [1_250_000, "un million deux cent cinquante mille"],
    [80_000_000, "quatre-vingts millions"],
    [200_000_000, "deux cents millions"],
    [2_000_000_000, "deux milliards"],
    [1_001_001_001, "un milliard un million mille un"],
  ];
  for (const [value, words] of cases) {
    it(`${value} → ${words}`, () => {
      expect(numberInWords(value)).toBe(words);
    });
  }
  it("refuse les nombres négatifs, décimaux ou trop grands", () => {
    expect(() => numberInWords(-1)).toThrow();
    expect(() => numberInWords(1.5)).toThrow();
    expect(() => numberInWords(1_000_000_000_000)).toThrow();
  });
});

describe("amountInWords", () => {
  it("ajoute la devise", () => {
    expect(amountInWords(436_600)).toBe("quatre cent trente-six mille six cents francs CFA");
    expect(amountInWords(0)).toBe("zéro franc CFA");
    expect(amountInWords(1)).toBe("un franc CFA");
  });
  it("écrit « de francs » après million ou milliard rond", () => {
    expect(amountInWords(1_000_000)).toBe("un million de francs CFA");
    expect(amountInWords(3_000_000_000)).toBe("trois milliards de francs CFA");
    expect(amountInWords(1_500_000)).toBe("un million cinq cent mille francs CFA");
  });
});
