import { Translation } from "@alice-localization/base/Translation";
import { ChallengeStrings } from "../ChallengeLocalization";

/**
 * The Indonesian translation for the `Challenge` database utility.
 */
export class ChallengeIDTranslation extends Translation<ChallengeStrings> {
    override readonly translations: ChallengeStrings = {
        challengeNotFound: "",
        challengeOngoing: "",
        challengeNotOngoing: "",
        challengeNotExpired: "",
        challengeEndSuccess: "",
        firstPlace: "",
        constrainNotFulfilled: "",
        eznfhtUsage: "",
        replayNotFound: "",
        customARSpeedMulUsage: "",
        beatmapNotFound: "",
        passReqNotFulfilled: "",
        cannotParseReplay: "",
        level: "",
        scoreV1: "",
        accuracy: "",
        scoreV2: "",
        missCount: "",
        combo: "",
        rank: "",
        mods: "",
        droidPP: "",
        pcPP: "",
        min300: "",
        max100: "",
        max50: "",
        maxUR: "",
        scoreV1Description: "",
        accuracyDescription: "",
        scoreV2Description: "",
        noMisses: "",
        missCountDescription: "",
        modsDescription: "",
        comboDescription: "",
        rankDescription: "",
        droidPPDescription: "",
        pcPPDescription: "",
        min300Description: "",
        max100Description: "",
        max50Description: "",
        maxURDescription: "",
    };
}
