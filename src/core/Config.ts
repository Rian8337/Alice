import { ActivityType, Snowflake } from "discord.js";

export abstract class Config {
    /**
     * Whether the bot is in maintenance mode.
     */
    static maintenance: boolean = false;

    /**
     * The reason for maintenance mode.
     */
    static maintenanceReason: string = "Unknown";

    static isDebug: boolean = false;

    static readonly enableDebugLog: boolean = false && Config.isDebug;

    static readonly botOwners: Snowflake[] = ["132783516176875520", "386742340968120321"];

    static readonly verifyPerm: Snowflake[] = [
        "369108742077284353", "595667274707370024"
    ];

    static readonly ppChannel: Snowflake[] = [
        "325827427446161413",
        "549109230284701718",
        "635535610739687435",
        "643669133975617546",
        "635549568854917150"
    ];

    static readonly reportChannel: string = "reports";

    static readonly activityList: [string, Exclude<ActivityType, "CUSTOM">][] = [
        ["Underworld Console", "PLAYING"],
        ["Rulid Village", "WATCHING"],
        ["/help", "LISTENING"],
        ["Dark Territory", "WATCHING"],
        ["in Axiom church", "PLAYING"],
        ["with Integrity Knights", "PLAYING"],
        ["flowers from my beloved Fragnant Olive", "WATCHING"],
        ["Uncle Bercoulli's orders", "LISTENING"],
        ["Centoria", "WATCHING"],
        ["Human Empire", "WATCHING"],
        ["The Great War of Underworld", "COMPETING"]
    ];

    static readonly avatarList: string[] = [
        "https://i.imgur.com/FAWi2Yl.png",
        "https://i.imgur.com/Fspbt08.png",
        "https://i.imgur.com/IXgYLNh.png",
        "https://i.imgur.com/E7EbgS4.png",
        "https://i.imgur.com/lFbSoEK.png",
        "https://i.imgur.com/FJbkaPi.png",
        "https://i.imgur.com/AaeiXgt.png",
        "https://i.imgur.com/5yFCD3N.png",
        "https://i.imgur.com/bXrgwzF.png",
        "https://i.imgur.com/AYXXNS7.png",
        "https://i.imgur.com/dtB1jf8.png",
        "https://i.imgur.com/zSJuARr.png",
        "https://i.imgur.com/ORVeEIS.jpg",
        "https://i.imgur.com/luf34Ql.png",
        "https://i.imgur.com/hAdTeAU.jpg"
    ];
}