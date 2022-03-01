import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { HelpENTranslation } from "./translations/HelpENTranslation";
import { HelpIDTranslation } from "./translations/HelpIDTranslation";
import { HelpKRTranslation } from "./translations/HelpKRTranslation";

export interface HelpStrings {
    readonly noCommandFound: string;
    readonly aliceHelp: string;
    readonly creator: string;
    readonly useHelpCommand: string;
    readonly issuesContact: string;
    readonly category: string;
    readonly requiredPermissions: string;
    readonly examples: string;
    readonly usage: string;
    readonly required: string;
    readonly optional: string;
    readonly details: string;
    readonly none: string;
}

/**
 * Localizations for the `help` command.
 */
export class HelpLocalization extends Localization<HelpStrings> {
    protected override readonly localizations: Readonly<
        Translations<HelpStrings>
    > = {
        en: new HelpENTranslation(),
        kr: new HelpKRTranslation(),
        id: new HelpIDTranslation(),
    };
}
