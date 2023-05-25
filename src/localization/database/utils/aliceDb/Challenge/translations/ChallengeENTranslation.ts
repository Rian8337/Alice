import { Translation } from "@alice-localization/base/Translation";
import { ChallengeStrings } from "../ChallengeLocalization";

/**
 * The English translation for the `Challenge` database utility.
 */
export class ChallengeENTranslation extends Translation<ChallengeStrings> {
    override readonly translations: ChallengeStrings = {
        challengeNotFound: "challenge is not scheduled",
        challengeOngoing: "a challenge is still ongoing",
        challengeNotOngoing: "challenge is not ongoing",
        challengeNotExpired: "not the time to end challenge yet",
        challengeEndSuccess: "Successfully ended challenge `%s`.",
        challengeEmbedGenerationFailed: "unable to create challenge embed",
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
    };
}
