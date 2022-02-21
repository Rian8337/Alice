import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface RecalcStrings {
    readonly tooManyOptions: string;
    readonly userIsDPPBanned: string;
    readonly userHasRequestedRecalc: string;
    readonly userQueued: string;
    readonly fullRecalcInProgress: string;
    readonly fullRecalcTrackProgress: string;
    readonly fullRecalcSuccess: string;
}

/**
 * Localizations for the `recalc` command.
 */
export class RecalcLocalization extends Localization<RecalcStrings> {
    protected override readonly translations: Readonly<
        Translation<RecalcStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            userIsDPPBanned: "I'm sorry, this user has been DPP banned!",
            userHasRequestedRecalc:
                "I'm sorry, this user has already requested a recalculation before!",
            userQueued: "Successfully queued %s for recalculation.",
            fullRecalcInProgress: "Successfully started recalculation.",
            fullRecalcTrackProgress: "Recalculating players (%s/%s (%s%))...",
            fullRecalcSuccess: "%s, recalculation done!",
        },
    };
}
