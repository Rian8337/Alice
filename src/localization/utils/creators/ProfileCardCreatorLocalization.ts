import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ProfileCardCreatorStrings {
    readonly totalScore: string;
    readonly rankedScore: string;
    readonly accuracy: string;
    readonly playCount: string;
    readonly droidPP: string;
    readonly clan: string;
    readonly challengePoints: string;
}

/**
 * Localizations for the `ProfileCardCreator` creator utility.
 */
export class ProfileCardCreatorLocalization extends Localization<ProfileCardCreatorStrings> {
    protected override readonly translations: Readonly<
        Translation<ProfileCardCreatorStrings>
    > = {
        en: {
            totalScore: "Total Score",
            rankedScore: "Ranked Score",
            accuracy: "Accuracy",
            playCount: "Play Count",
            droidPP: "Droid pp",
            clan: "Clan",
            challengePoints: "Challenge Points",
        },
        kr: {
            totalScore: "총 점수",
            rankedScore: "Ranked 점수",
            accuracy: "정확도",
            playCount: "플레이 횟수",
            droidPP: "Droid pp",
            clan: "클랜",
            challengePoints: "챌린지 포인트",
        },
        id: {
            totalScore: "",
            rankedScore: "",
            accuracy: "",
            playCount: "",
            droidPP: "",
            clan: "",
            challengePoints: "",
        },
    };
}
