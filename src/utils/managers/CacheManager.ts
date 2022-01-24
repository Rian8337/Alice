import {
    ChannelCooldownKey,
    GlobalCooldownKey,
} from "@alice-types/core/CooldownKey";
import { LimitedCapacityCollection } from "@alice-utils/LimitedCapacityCollection";
import { Snowflake } from "discord.js";
import { MapInfo } from "@rian8337/osu-base";

/**
 * A manager that holds anything that is cached.
 */
export abstract class CacheManager {
    /**
     * The beatmaps that have been cached, mapped by beatmap ID.
     */
    static readonly beatmapCache: LimitedCapacityCollection<number, MapInfo> =
        new LimitedCapacityCollection(50, 600);

    /**
     * The beatmap cache of each channel, mapped by channel ID.
     */
    static readonly channelMapCache: LimitedCapacityCollection<
        Snowflake,
        string
    > = new LimitedCapacityCollection(75, 1800);

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
     * The channels that still have a map trivia active.
     */
    static readonly stillHasMapTriviaActive: Set<Snowflake> = new Set();

    /**
     * The users that still has a verification menu open.
     *
     * This is used to prevent collector creation spam.
     */
    static readonly userHasActiveVerificationMenu: Set<Snowflake> = new Set();
}
