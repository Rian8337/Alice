import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { BotinfoENTranslation } from "./translations/BotinfoENTranslation";

export interface BotinfoStrings {
    readonly aboutBot: string;
    readonly botInfo: string;
    readonly botVersion: string;
    readonly botUptime: string;
    readonly coreLibraries: string;
    readonly discordJs: string;
    readonly typescript: string;
    readonly osuLibraries: string;
    readonly osuBase: string;
    readonly osuDiffCalc: string;
    readonly osuRebalDiffCalc: string;
    readonly osuDroidReplayAnalyzer: string;
    readonly osuDroidUtilities: string;
    readonly osuStrainGraphGenerator: string;
}

/**
 * Localizations for the `botinfo` slash command.
 */
export class BotinfoLocalization extends Localization<BotinfoStrings> {
    protected override readonly localizations: Readonly<
        Translations<BotinfoStrings>
    > = {
        en: new BotinfoENTranslation(),
    };
}
