import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface CompareStrings {
    readonly tooManyOptions: string;
    readonly noCachedBeatmap: string;
    readonly playerNotFound: string;
    readonly selfScoreNotFound: string;
    readonly userScoreNotFound: string;
    readonly comparePlayDisplay: string;
}

/**
 * Localizations for the `compare` command.
 */
export class CompareLocalization extends Localization<CompareStrings> {
    protected override readonly translations: Readonly<
        Translation<CompareStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            noCachedBeatmap:
                "I'm sorry, there is no beatmap being talked in the channel!",
            playerNotFound:
                "I'm sorry, I cannot find the player that you are looking for!",
            selfScoreNotFound:
                "I'm sorry, you have not submitted any scores in the beatmap!",
            userScoreNotFound:
                "I'm sorry, this user has not submitted any scores in the beatmap!",
            comparePlayDisplay: "Comparison play for %s:",
        },
    };
}
