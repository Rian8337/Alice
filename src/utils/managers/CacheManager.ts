import {
    ChannelCooldownKey,
    GlobalCooldownKey,
} from "structures/core/CooldownKey";
import { LimitedCapacityCollection } from "@alice-utils/LimitedCapacityCollection";
import { Collection, Snowflake } from "discord.js";
import { MapInfo } from "@rian8337/osu-base";
import { Language } from "@alice-localization/base/Language";
import { TriviaQuestionCachedAnswer } from "@alice-structures/trivia/TriviaQuestionCachedAnswer";
import { TriviaMapCachedAnswer } from "@alice-structures/trivia/TriviaMapCachedAnswer";
import { LiveDroidDifficultyAttributesCacheManager } from "@alice-utils/difficultyattributescache/LiveDroidDifficultyAttributesCacheManager";
import { LiveOsuDifficultyAttributesCacheManager } from "@alice-utils/difficultyattributescache/LiveOsuDifficultyAttributesCacheManager";
import { RebalanceDroidDifficultyAttributesCacheManager } from "@alice-utils/difficultyattributescache/RebalanceDroidDifficultyAttributesCacheManager";
import { RebalanceOsuDifficultyAttributesCacheManager } from "@alice-utils/difficultyattributescache/RebalanceOsuDifficultyAttributesCacheManager";
import { OldDroidDifficultyAttributesCacheManager } from "@alice-utils/difficultyattributescache/OldDroidDifficultyAttributesCacheManager";

/**
 * A manager that holds anything that is cached.
 */
export abstract class CacheManager {
    /**
     * The beatmaps that have been cached, mapped by beatmap ID.
     */
    static readonly beatmapCache: LimitedCapacityCollection<number, MapInfo> =
        new LimitedCapacityCollection(150, 600);

    /**
     * The beatmap cache of each channel, mapped by channel ID.
     */
    static readonly channelMapCache: LimitedCapacityCollection<
        Snowflake,
        string
    > = new LimitedCapacityCollection(100, 1800);

    /**
     * The command cooldowns that are currently active.
     */
    static readonly activeCommandCooldowns: Set<
        ChannelCooldownKey | GlobalCooldownKey
    > = new Set();

    /**
     * The users/channels that still have a math game active.
     *
     * This is used to prevent users from starting more than one game at once.
     */
    static readonly stillHasMathGameActive: Set<Snowflake> = new Set();

    /**
     * The channels that still have a trivia question active.
     */
    static readonly stillHasQuestionTriviaActive: Set<Snowflake> = new Set();

    /**
     * Answers for a trivia question in a channel, mapped by channel ID,
     * and each answer mapped by the answerer's ID.
     */
    static readonly questionTriviaFillInTheBlankAnswers: Collection<
        Snowflake,
        Collection<Snowflake, TriviaQuestionCachedAnswer>
    > = new Collection();

    /**
     * Answers for a trivia question in a channel, mapped by channel ID,
     * and each answer mapped by the answerer's ID.
     */
    static readonly mapTriviaAnswers: Collection<
        Snowflake,
        Collection<Snowflake, TriviaMapCachedAnswer>
    > = new Collection();

    /**
     * The users that still has a verification menu open.
     *
     * This is used to prevent collector creation spam.
     */
    static readonly userHasActiveVerificationMenu: Set<Snowflake> = new Set();

    /**
     * The locales that a user has, mapped by user ID.
     */
    static readonly userLocale: LimitedCapacityCollection<Snowflake, Language> =
        new LimitedCapacityCollection(150, 300);

    /**
     * The locales that a guild text channel has, mapped by channel ID.
     */
    static readonly channelLocale: LimitedCapacityCollection<
        Snowflake,
        Language
    > = new LimitedCapacityCollection(100, 300);

    /**
     * The timers for a multiplayer room, mapped by channel ID.
     */
    static readonly multiplayerTimers: Collection<Snowflake, NodeJS.Timeout[]> =
        new Collection();

    /**
     * Cache for difficulty attributes.
     */
    static readonly difficultyAttributesCache = {
        live: {
            droid: new LiveDroidDifficultyAttributesCacheManager(),
            osu: new LiveOsuDifficultyAttributesCacheManager(),
        },
        rebalance: {
            droid: new RebalanceDroidDifficultyAttributesCacheManager(),
            osu: new RebalanceOsuDifficultyAttributesCacheManager(),
        },
        old: {
            droid: new OldDroidDifficultyAttributesCacheManager(),
        },
    };

    /**
     * IDs of buttons that will not be listened by the `runButton` event utility.
     */
    static readonly exemptedButtonCustomIds: Set<string> = new Set();
}
