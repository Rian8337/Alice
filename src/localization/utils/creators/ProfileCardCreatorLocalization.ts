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
    };
}
