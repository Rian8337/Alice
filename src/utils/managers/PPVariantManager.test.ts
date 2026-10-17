import { Modes } from "@rian8337/osu-base";
import { PPVariantSummary } from "@structures/utils/PPVariantSummary";
import { consola } from "consola";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PPProcessorRESTManager } from "./PPProcessorRESTManager";
import { PPVariantManager } from "./PPVariantManager";

function variant(
  name: string,
  overrides: Partial<PPVariantSummary> = {},
): PPVariantSummary {
  return {
    name,
    title: null,
    aliases: [],
    description: null,
    available: true,
    mode: Modes.Droid,
    algorithm: "live",
    calculatorVersion: null,
    builtAt: null,
    ...overrides,
  };
}

const publicVariants = [
  variant("droid-live"),
  variant("droid-rebalance", { aliases: ["rebalance"] }),
  variant("osu-live", { mode: Modes.Osu }),
  variant("pending", { mode: null }),
];

const secret = variant("secret");

describe("PPVariantManager", () => {
  let getVariants: ReturnType<
    typeof vi.spyOn<typeof PPProcessorRESTManager, "getVariants">
  >;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(consola, "error").mockImplementation(() => undefined);

    getVariants = vi
      .spyOn(PPProcessorRESTManager, "getVariants")
      .mockImplementation((actingUid) =>
        Promise.resolve(
          actingUid === 7 ? [...publicVariants, secret] : publicVariants,
        ),
      );

    PPVariantManager.clearCache();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("caches variant lists per acting uid", async () => {
    await PPVariantManager.getVariants(7);
    await PPVariantManager.getVariants(7);

    expect(getVariants).toHaveBeenCalledTimes(1);

    await PPVariantManager.getVariants(8);
    await PPVariantManager.getVariants();

    expect(getVariants).toHaveBeenCalledTimes(3);
    expect(getVariants).toHaveBeenNthCalledWith(1, 7);
    expect(getVariants).toHaveBeenNthCalledWith(2, 8);
    expect(getVariants).toHaveBeenNthCalledWith(3, undefined);

    vi.advanceTimersByTime(61_000);

    await PPVariantManager.getVariants(7);

    expect(getVariants).toHaveBeenCalledTimes(4);
  });

  it("hides private variants from users without a bind", async () => {
    expect(await PPVariantManager.resolve("secret")).toBeNull();

    const resolved = await PPVariantManager.resolve("secret", 7);

    expect(resolved?.name).toBe("secret");
  });

  it("resolves aliases to the canonical variant", async () => {
    const resolved = await PPVariantManager.resolve("rebalance");

    expect(resolved?.name).toBe("droid-rebalance");
  });

  it("does not cache a failed fetch", async () => {
    getVariants.mockResolvedValueOnce(null);

    expect(await PPVariantManager.getVariants()).toEqual([]);
    expect(await PPVariantManager.getVariants()).toEqual(publicVariants);
    expect(getVariants).toHaveBeenCalledTimes(2);
  });

  describe("searchForAutocomplete", () => {
    it("filters by mode and leaves out variants without a mode", async () => {
      const choices = await PPVariantManager.searchForAutocomplete("", {
        mode: Modes.Osu,
      });

      expect(choices.map((c) => c.value)).toEqual(["osu-live"]);
    });

    it("keeps only droid variants for prototype-only searches", async () => {
      const choices = await PPVariantManager.searchForAutocomplete("", {
        prototypeOnly: true,
      });

      expect(choices.map((c) => c.value)).toEqual([
        "droid-live",
        "droid-rebalance",
      ]);
    });

    it("includes variants without a mode when no mode filter applies", async () => {
      const choices = await PPVariantManager.searchForAutocomplete("", {});

      expect(choices.map((c) => c.value)).toEqual([
        "droid-live",
        "droid-rebalance",
        "osu-live",
        "pending",
      ]);
    });

    it("matches names, titles, and aliases case-insensitively", async () => {
      getVariants.mockResolvedValue([
        variant("alpha", { title: "Fancy Title" }),
        variant("beta", { aliases: ["Shortcut"] }),
        variant("gamma"),
      ]);

      const byTitle = await PPVariantManager.searchForAutocomplete("fancy", {});
      const byAlias = await PPVariantManager.searchForAutocomplete("SHORT", {});
      const byName = await PPVariantManager.searchForAutocomplete("GAM", {});

      expect(byTitle.map((c) => c.value)).toEqual(["alpha"]);
      expect(byAlias.map((c) => c.value)).toEqual(["beta"]);
      expect(byName.map((c) => c.value)).toEqual(["gamma"]);
    });

    it("uses the title as display name and marks unavailable variants", async () => {
      getVariants.mockResolvedValue([
        variant("alpha", { title: "Fancy Title" }),
        variant("beta", { available: false }),
      ]);

      const choices = await PPVariantManager.searchForAutocomplete("", {});

      expect(choices).toEqual([
        { name: "Fancy Title", value: "alpha" },
        { name: "beta (unavailable)", value: "beta" },
      ]);
    });

    it("limits choices to 25 sorted by name and cuts display names to 100 characters", async () => {
      getVariants.mockResolvedValue([
        ...Array.from({ length: 30 }, (_, i) =>
          variant(`v${(29 - i).toString().padStart(2, "0")}`),
        ),
        variant("a", { title: "x".repeat(150) }),
      ]);

      const choices = await PPVariantManager.searchForAutocomplete("", {});

      expect(choices).toHaveLength(25);
      expect(choices[0].value).toBe("a");
      expect(choices[0].name).toHaveLength(100);
      expect(choices[1].value).toBe("v00");
    });

    it("does not leak private variants across acting uids", async () => {
      const own = await PPVariantManager.searchForAutocomplete("secret", {
        actingUid: 7,
      });
      const other = await PPVariantManager.searchForAutocomplete("secret", {});

      expect(own.map((c) => c.value)).toEqual(["secret"]);
      expect(other).toEqual([]);
    });
  });
});
