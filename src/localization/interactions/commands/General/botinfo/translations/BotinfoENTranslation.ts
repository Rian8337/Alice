import { Translation } from "@alice-localization/base/Translation";
import { BotinfoStrings } from "../BotinfoLocalization";

/**
 * The English translation for the `botinfo` slash command.
 */
export class BotinfoENTranslation extends Translation<BotinfoStrings> {
    override readonly translations: BotinfoStrings = {
        aboutBot:
            "This is [Alice](%s), a multipurpose Discord bot by [Rian8337](%s) and [NeroYuki](%s) made for [osu!droid](%s). However, it has a plethora of other uses as well, and is mainly used to power the [osu!droid (International)](%s) Discord server.",
        botInfo: "Bot Information",
        botVersion: "Version",
        botUptime: "Uptime",
        coreLibraries: "Core Libraries",
        discordJs: "Discord.js",
        typescript: "TypeScript",
        osuLibraries: "osu! Libraries",
        osuBase: "Base Library",
        osuDiffCalc: "Star Rating and PP Calculator",
        osuRebalDiffCalc: "Rebalance Star Rating and PP Calculator",
        osuDroidReplayAnalyzer: "osu!droid Replay Analyzer",
        osuDroidUtilities: "osu!droid Utilities",
        osuStrainGraphGenerator: "Difficulty Strain Graph Generator",
    };
}
