import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { MatchENTranslation } from "./translations/MatchENTranslation";
import { MatchESTranslation } from "./translations/MatchESTranslation";
import { MatchKRTranslation } from "./translations/MatchKRTranslation";

export interface MatchStrings {
    readonly invalidMatchID: string;
    readonly matchIDAlreadyTaken: string;
    readonly teamPlayerCountDoNotBalance: string;
    readonly invalidPlayerInformation: string;
    readonly invalidChannelToBind: string;
    readonly matchDoesntExist: string;
    readonly matchHasEnded: string;
    readonly matchHasNoResult: string;
    readonly mappoolNotFound: string;
    readonly mapNotFound: string;
    readonly playerNotFound: string;
    readonly matchDataInProcess: string;
    readonly roundInitiated: string;
    readonly roundCountdownFinished: string;
    readonly roundEnded: string;
    readonly teamPlayerCountDoesntMatch: string;
    readonly scoreDataInvalid: string;
    readonly addMatchFailed: string;
    readonly addMatchSuccessful: string;
    readonly bindMatchFailed: string;
    readonly bindMatchSuccessful: string;
    readonly endMatchFailed: string;
    readonly endMatchSuccessful: string;
    readonly removeMatchFailed: string;
    readonly removeMatchSuccessful: string;
    readonly undoMatchFailed: string;
    readonly undoMatchSuccessful: string;
    readonly unbindMatchFailed: string;
    readonly unbindMatchSuccessful: string;
    readonly submitMatchFailed: string;
    readonly submitMatchSuccessful: string;
    readonly failed: string;
    readonly none: string;
    readonly draw: string;
    readonly won: string;
    readonly roundInfo: string;
    readonly matchId: string;
    readonly map: string;
    readonly mapLength: string;
}

/**
 * Localizations for the `match` command.
 */
export class MatchLocalization extends Localization<MatchStrings> {
    protected override readonly localizations: Readonly<
        Translations<MatchStrings>
    > = {
        en: new MatchENTranslation(),
        kr: new MatchKRTranslation(),
        es: new MatchESTranslation(),
    };
}
