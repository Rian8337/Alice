import { DatabaseManager } from "@database/DatabaseManager";
import { Modes } from "@rian8337/osu-base";
import { PPVariantSummary } from "@structures/utils/PPVariantSummary";
import { Manager } from "@utils/base/Manager";
import { ApplicationCommandOptionChoiceData, User } from "discord.js";
import { PPProcessorRESTManager } from "./PPProcessorRESTManager";

/**
 * A manager for performance points variants.
 *
 * Variant lists are cached per acting uid, as which variants are visible depends on who is asking.
 */
export abstract class PPVariantManager extends Manager {
  /**
   * How long a variant list stays cached, in milliseconds.
   */
  private static readonly cacheLifetime = 60 * 1000;

  /**
   * The maximum number of choices that Discord allows for an autocomplete response.
   */
  private static readonly maxAutocompleteChoices = 25;

  /**
   * The maximum length of the display name of an autocomplete choice.
   */
  private static readonly maxChoiceNameLength = 100;

  private static readonly cache = new Map<
    number | "anonymous",
    { readonly fetchedAt: number; readonly variants: PPVariantSummary[] }
  >();

  /**
   * Gets the variants that are visible to a person.
   *
   * The result is cached for 60 seconds per acting uid. A failed fetch is not cached.
   *
   * @param actingUid The uid of the person to get variants for. If omitted, only public variants are returned.
   * @returns The variants. This is empty if the variants cannot be fetched.
   */
  static async getVariants(actingUid?: number): Promise<PPVariantSummary[]> {
    const key = actingUid ?? "anonymous";
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.fetchedAt < this.cacheLifetime) {
      return cached.variants;
    }

    const variants = await PPProcessorRESTManager.getVariants(actingUid);

    if (!variants) {
      return [];
    }

    this.cache.set(key, { fetchedAt: Date.now(), variants: variants });

    return variants;
  }

  /**
   * Resolves a variant by its name or one of its aliases.
   *
   * @param name The name or alias of the variant. This is case-sensitive.
   * @param actingUid The uid of the person to resolve the variant for.
   * @returns The variant, `null` if it does not exist or is not visible to the person.
   */
  static async resolve(
    name: string,
    actingUid?: number,
  ): Promise<PPVariantSummary | null> {
    const variants = await this.getVariants(actingUid);

    return (
      variants.find((v) => v.name === name || v.aliases.includes(name)) ?? null
    );
  }

  /**
   * Gets the uid that a Discord user acts as when asking for variants.
   *
   * @param user The Discord user.
   * @returns The uid of the user's bound osu!droid account, `undefined` if the user is not bound.
   */
  static async getActingUid(user: User): Promise<number | undefined> {
    const bindInfo =
      await DatabaseManager.elainaDb.collections.userBind.getFromUser(user, {
        projection: { _id: 0, uid: 1 },
      });

    return bindInfo?.uid;
  }

  /**
   * Searches for variants to be shown in an autocomplete response.
   *
   * @param query The query. This matches names, titles, and aliases case-insensitively.
   * @param options Options for the search.
   * @returns The autocomplete choices, sorted by variant name.
   */
  static async searchForAutocomplete(
    query: string,
    options: {
      /**
       * The uid of the person to search variants for.
       */
      actingUid?: number;

      /**
       * Only include variants that calculate this gamemode.
       */
      mode?: Modes;

      /**
       * Only include variants that calculate the osu!droid gamemode.
       */
      prototypeOnly?: boolean;
    },
  ): Promise<ApplicationCommandOptionChoiceData<string>[]> {
    const { actingUid, mode, prototypeOnly } = options;
    const lowerQuery = query.toLowerCase();
    const hasModeFilter = mode !== undefined || prototypeOnly === true;

    const matches = (value: string) => value.toLowerCase().includes(lowerQuery);

    return (await this.getVariants(actingUid))
      .filter((v) => {
        if (hasModeFilter && v.mode === null) {
          return false;
        }

        if (mode !== undefined && v.mode !== mode) {
          return false;
        }

        if (prototypeOnly && v.mode !== Modes.Droid) {
          return false;
        }

        return (
          matches(v.name) ||
          (v.title !== null && matches(v.title)) ||
          v.aliases.some(matches)
        );
      })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
      .slice(0, this.maxAutocompleteChoices)
      .map((v) => {
        const suffix = v.available ? "" : " (unavailable)";

        return {
          name:
            (v.title ?? v.name).slice(
              0,
              this.maxChoiceNameLength - suffix.length,
            ) + suffix,
          value: v.name,
        };
      });
  }

  /**
   * Clears the variant cache.
   *
   * @internal Intended for tests only.
   */
  static clearCache(): void {
    this.cache.clear();
  }
}
