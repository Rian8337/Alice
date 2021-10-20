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

    static readonly questionWeight: number[] = [
        1 , 14, 11, 1 , 20, 1 , 1 ,
        6 , 5 , 6 , 4 , 1 , 20, 17,
        17 , 5 , 1 , 6 , 4 , 10, 17 ,
        5 , 9 , 4 , 3 , 20, 1 , 4 ,
        20
    ];

    static readonly mudaeBan: [Snowflake, number][] = [
        ["635533001312305152", -1],
        ["635533688196694016", 1800]
    ];

    static readonly mudaeImmune: Snowflake[] = [
        "635533001312305152",
        "635533688196694016"
    ];

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

    static readonly activityList: [ string, Exclude<ActivityType, "CUSTOM"> ][] = [
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
        "https://media.discordapp.net/attachments/546135349533868072/900419922151231528/png-transparent-soviet-union-communist-symbolism-communism-hammer-and-sickle-soviet-union-angle-tria.png"
        // "https://i.imgur.com/FAWi2Yl.png",
        // "https://i.imgur.com/Fspbt08.png",
        // "https://i.imgur.com/IXgYLNh.png",
        // "https://i.imgur.com/E7EbgS4.png",
        // "https://i.imgur.com/lFbSoEK.png",
        // "https://i.imgur.com/FJbkaPi.png",
        // "https://i.imgur.com/AaeiXgt.png",
        // "https://i.imgur.com/5yFCD3N.png",
        // "https://i.imgur.com/bXrgwzF.png",
        // "https://i.imgur.com/AYXXNS7.png",
        // "https://i.imgur.com/dtB1jf8.png",
        // "https://i.imgur.com/zSJuARr.png",
        // "https://i.imgur.com/ORVeEIS.jpg",
        // "https://i.imgur.com/luf34Ql.png",
        // "https://i.imgur.com/hAdTeAU.jpg"
    ];
};