import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ChallengeENTranslation } from "./translations/ChallengeENTranslation";
import { ChallengeESTranslation } from "./translations/ChallengeESTranslation";
import { ChallengeIDTranslation } from "./translations/ChallengeIDTranslation";
import { ChallengeKRTranslation } from "./translations/ChallengeKRTranslation";

export interface ChallengeStrings {
    readonly challengeNotFound: string;
    readonly challengeOngoing: string;
    readonly challengeNotOngoing: string;
    readonly challengeNotExpired: string;
    readonly challengeEndSuccess: string;
    readonly firstPlace: string;
    readonly constrainNotFulfilled: string;
    readonly eznfhtUsage: string;
    readonly replayNotFound: string;
    readonly customARSpeedMulUsage: string;
    readonly beatmapNotFound: string;
    readonly passReqNotFulfilled: string;
    readonly cannotParseReplay: string;
    readonly level: string;
    readonly scoreV1: string;
    readonly accuracy: string;
    readonly scoreV2: string;
    readonly missCount: string;
    readonly combo: string;
    readonly rank: string;
    readonly mods: string;
    readonly droidPP: string;
    readonly pcPP: string;
    readonly min300: string;
    readonly max100: string;
    readonly max50: string;
    readonly maxUR: string;
    readonly scoreV1Description: string;
    readonly accuracyDescription: string;
    readonly scoreV2Description: string;
    readonly noMisses: string;
    readonly missCountDescription: string;
    readonly modsDescription: string;
    readonly comboDescription: string;
    readonly rankDescription: string;
    readonly droidPPDescription: string;
    readonly pcPPDescription: string;
    readonly min300Description: string;
    readonly max100Description: string;
    readonly max50Description: string;
    readonly maxURDescription: string;
}

/**
 * Localizations for the `Challenge` database utility.
 */
export class ChallengeLocalization extends Localization<ChallengeStrings> {
    protected override readonly localizations: Readonly<
        Translations<ChallengeStrings>
    > = {
        en: new ChallengeENTranslation(),
        kr: new ChallengeKRTranslation(),
        id: new ChallengeIDTranslation(),
        es: new ChallengeESTranslation(),
    };
}
