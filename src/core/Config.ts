import { url } from "inspector";
import { ActivityType, Snowflake } from "discord.js";

/**
 * Bot-wide configuration.
 */
export abstract class Config {
    /**
     * Whether the bot is in maintenance mode.
     */
    static maintenance = false;

    /**
     * The reason for maintenance mode.
     */
    static maintenanceReason = "Unknown";

    /**
     * Whether the bot is running in debug mode.
     */
    static readonly isDebug = !!url();

    static readonly enableDebugLog = false && Config.isDebug;

    static readonly botOwners = [
        "132783516176875520",
        "386742340968120321",
    ] as readonly Snowflake[];

    static readonly verifyPerm = [
        "369108742077284353",
        "595667274707370024",
        "803154670380908575",
    ] as readonly Snowflake[];

    static readonly ppChannel = [
        "325827427446161413",
        "549109230284701718",
        "635535610739687435",
        "643669133975617546",
        "635549568854917150",
    ] as readonly Snowflake[];

    static readonly activityList = [
        ["/help", ActivityType.Listening],
        ["a sleepyhead Amane-kun", ActivityType.Watching],
        ["with cooking utensils", ActivityType.Playing],
        ["exercise tracks", ActivityType.Listening],
        ["Amane-kun's voice", ActivityType.Listening],
        ["with Amane-kun", ActivityType.Playing],
        ["with Amane-kun's hair", ActivityType.Playing],
        ["with Amane-kun's pampering", ActivityType.Playing],
        ["Amane-kun exercising", ActivityType.Watching],
        ["Amane-kun's cooking", ActivityType.Competing],
        ["with Chitose", ActivityType.Playing],
        ["with my flaxen hair", ActivityType.Playing],
        ["with Amane-kun's parents", ActivityType.Playing],
    ] satisfies [
        string,
        Exclude<ActivityType, ActivityType.Custom>,
    ][] as readonly [string, Exclude<ActivityType, ActivityType.Custom>][];

    static readonly avatarList = [
        "https://i.imgur.com/39o5szl.png",
        "https://i.imgur.com/93s2cua.png",
        "https://i.imgur.com/H1nAm6w.png",
        "https://i.imgur.com/q8SOh1v.png",
        "https://i.imgur.com/NM6UcBA.png",
        "https://i.imgur.com/Zi8kSsT.png",
        "https://i.imgur.com/8tOuTpp.png",
        "https://i.imgur.com/5lcnKcR.png",
    ] as const;
}
