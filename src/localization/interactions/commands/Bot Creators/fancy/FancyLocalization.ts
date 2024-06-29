import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { FancyENTranslation } from "./translations/FancyENTranslation";
import { FancyESTranslation } from "./translations/FancyESTranslation";
import { FancyIDTranslation } from "./translations/FancyIDTranslation";
import { FancyKRTranslation } from "./translations/FancyKRTranslation";

export interface FancyStrings {
    readonly durationError: string;
    readonly activeApplicationNotFound: string;
    readonly cannotRetrieveTatsuXP: string;
    readonly tatsuXPRequirementNotMet: string;
    readonly applicationMessageEmbedTitle: string;
    readonly applicationMessageEmbedDescription: string;
    readonly applicationMessageInitiateVote: string;
    readonly applicationMessageRejectApplication: string;
    readonly applicationFailed: string;
    readonly applicationSent: string;
    readonly applicationCancelFailed: string;
    readonly applicationCancelSuccess: string;
    readonly lockProcessFailed: string;
    readonly lockProcessSuccessful: string;
    readonly unlockProcessFailed: string;
    readonly unlockProcessSuccessful: string;
}

/**
 * Localizations for the `fancy` command.
 */
export class FancyLocalization extends Localization<FancyStrings> {
    protected override readonly localizations: Readonly<
        Translations<FancyStrings>
    > = {
        en: new FancyENTranslation(),
        kr: new FancyKRTranslation(),
        id: new FancyIDTranslation(),
        es: new FancyESTranslation(),
    };
}
