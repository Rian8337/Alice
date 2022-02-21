import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

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
    protected override readonly translations: Readonly<
        Translation<ChallengeStrings>
    > = {
        en: {
            challengeNotFound: "challenge is not scheduled",
            challengeOngoing: "a challenge is still ongoing",
            challengeNotOngoing: "challenge is not ongoing",
            challengeNotExpired: "not the time to end challenge yet",
            challengeEndSuccess: "Successfully ended challenge `%s`.",
            firstPlace:
                "Congratulations to %s for achieving first place in challenge %s, earning them %s points and %s%s Alice coins!",
            constrainNotFulfilled: "constrain not fulfilled",
            eznfhtUsage: "usage of EZ, NF, or HT",
            replayNotFound: "replay not found",
            customARSpeedMulUsage:
                "custom speed multiplier and/or force AR is used",
            beatmapNotFound: "beatmap not found",
            passReqNotFulfilled: "pass requirement is not fulfilled",
            cannotParseReplay: "cannot parse replay",
            level: "Level",
            scoreV1: "ScoreV1",
            accuracy: "Accuracy",
            scoreV2: "ScoreV2",
            missCount: "Miss Count",
            combo: "Combo",
            rank: "Rank",
            mods: "Mods",
            droidPP: "Droid PP",
            pcPP: "PC PP",
            min300: "Minimum 300",
            max100: "Maximum 100",
            max50: "Maximum 50",
            maxUR: "Maximum unstable rate",
            scoreV1Description: "Score V1 at least %s",
            accuracyDescription: "Accuracy at least %s%",
            scoreV2Description: "Score V2 at least %s",
            noMisses: "No misses",
            missCountDescription: "Miss count below %s",
            modsDescription: "Usage of %s mod only",
            comboDescription: "Combo at least %s",
            rankDescription: "%s rank or above",
            droidPPDescription: "%s dpp or more",
            pcPPDescription: "%s pp or more",
            min300Description: "300 hit result at least %s",
            max100Description: "100 hit result less than or equal to %s",
            max50Description: "50 hit result less than or equal to %s",
            maxURDescription: "UR (unstable rate) below or equal to %s",
        },
    };
}
