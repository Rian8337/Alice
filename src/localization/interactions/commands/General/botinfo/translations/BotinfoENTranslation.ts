import { Translation } from "@localization/base/Translation";
import { hyperlink } from "discord.js";
import { BotinfoStrings } from "../BotinfoLocalization";

/**
 * The English translation for the `botinfo` slash command.
 */
export class BotinfoENTranslation extends Translation<BotinfoStrings> {
    override readonly translations: BotinfoStrings = {
        aboutBot: `This is ${hyperlink(
            "Mahiru",
            "%s",
        )}, a multipurpose Discord bot by ${hyperlink(
            "Rian8337",
            "%s",
        )} and ${hyperlink("NeroYuki", "%s")} made for ${hyperlink(
            "osu!droid",
            "%s",
        )}. However, it has a plethora of other uses as well, and is mainly used to power the ${hyperlink(
            "osu!droid (International)",
            "%s",
        )} Discord server.\n\nIf you enjoy the features offered by the bot, feel free to ${hyperlink(
            "buy us a coffee",
            "%s",
        )}!`,
        botInfo: "Bot Information",
        botVersion: "Version",
        botUptime: "Uptime",
        nodeVersion: "Node.js Version",
        coreLibraries: "Core Libraries",
        discordJs: "Discord.js",
        typescript: "TypeScript",
        osuLibraries: "osu! Libraries",
        osuBase: "Base Library",
        osuDiffCalc: "Star Rating and PP Calculator",
        osuRebalDiffCalc: "Rebalance Star Rating and PP Calculator",
        osuDroidReplayAnalyzer: "osu!droid Replay Analyzer",
        osuDroidUtilities: "osu!droid Utilities",
        osuStrainGraphGenerator: "Difficulty Graph Generator",
    };
}
