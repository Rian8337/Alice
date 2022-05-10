import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { DailyENTranslation } from "./translations/DailyENTranslation";
import { DailyESTranslation } from "./translations/DailyESTranslation";
import { DailyIDTranslation } from "./translations/DailyIDTranslation";
import { DailyKRTranslation } from "./translations/DailyKRTranslation";

export interface DailyStrings {
    readonly tooManyOptions: string;
    readonly noOngoingChallenge: string;
    readonly challengeNotFound: string;
    readonly challengeFromReplayNotFound: string;
    readonly startChallengeFailed: string;
    readonly startChallengeSuccess: string;
    readonly userHasPlayedChallenge: string;
    readonly userHasNotPlayedChallenge: string;
    readonly userHasNotPlayedAnyChallenge: string;
    readonly scoreNotFound: string;
    readonly challengeIsOngoing: string;
    readonly challengeNotOngoing: string;
    readonly challengeNotCompleted: string;
    readonly challengeCompleted: string;
    readonly replayDownloadFail: string;
    readonly replayInvalid: string;
    readonly replayDoesntHaveSameUsername: string;
    readonly replayTooOld: string;
    readonly manualSubmissionConfirmation: string;
    readonly invalidChallengeId: string;
    readonly challengeWithIdExists: string;
    readonly noBeatmapProvided: string;
    readonly beatmapNotFound: string;
    readonly passValueOutOfRange: string;
    readonly bonusValueOutOfRange: string;
    readonly unrankedModsIncluded: string;
    readonly beatmapDownloadFailed: string;
    readonly addNewChallengeFailed: string;
    readonly addNewChallengeSuccess: string;
    readonly modifyBonusFailed: string;
    readonly modifyBonusSuccess: string;
    readonly modifyBeatmapFailed: string;
    readonly modifyBeatmapSuccess: string;
    readonly deleteChallengeFailed: string;
    readonly deleteChallengeSuccess: string;
    readonly setConstrainFailed: string;
    readonly setConstrainSuccess: string;
    readonly setDownloadLinkFailed: string;
    readonly setDownloadLinkSuccess: string;
    readonly setPassReqFailed: string;
    readonly setPassReqSuccess: string;
    readonly setPointsFailed: string;
    readonly setPointsSuccess: string;
    readonly setFeaturedFailed: string;
    readonly setFeaturedSuccess: string;
    readonly aboutTitle: string;
    readonly aboutDescription: string;
    readonly aboutQuestion1: string;
    readonly aboutAnswer1: string;
    readonly aboutQuestion2: string;
    readonly aboutAnswer2: string;
    readonly aboutQuestion3: string;
    readonly aboutAnswer3: string;
    readonly aboutQuestion4: string;
    readonly aboutAnswer4: string;
    readonly aboutQuestion5: string;
    readonly aboutAnswer5: string;
    readonly username: string;
    readonly uid: string;
    readonly points: string;
    readonly scoreStatistics: string;
    readonly totalScore: string;
    readonly maxCombo: string;
    readonly accuracy: string;
    readonly rank: string;
    readonly time: string;
    readonly hitGreat: string;
    readonly hitGood: string;
    readonly hitMeh: string;
    readonly misses: string;
    readonly bonusLevelReached: string;
    readonly geki: string;
    readonly katu: string;
    readonly profile: string;
    readonly challengesCompleted: string;
    readonly statistics: string;
    readonly none: string;
}

/**
 * Localizations for the `daily` command.
 */
export class DailyLocalization extends Localization<DailyStrings> {
    protected override readonly localizations: Readonly<
        Translations<DailyStrings>
    > = {
        en: new DailyENTranslation(),
        kr: new DailyKRTranslation(),
        id: new DailyIDTranslation(),
        es: new DailyESTranslation(),
    };
}
