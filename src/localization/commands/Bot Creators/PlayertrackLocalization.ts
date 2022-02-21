import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PlayertrackStrings {
    readonly incorrectUid: string;
    readonly nowTrackingUid: string;
    readonly noLongerTrackingUid: string;
}

/**
 * Localization for the `playertrack` command.
 */
export class PlayertrackLocalization extends Localization<PlayertrackStrings> {
    protected override readonly translations: Readonly<
        Translation<PlayertrackStrings>
    > = {
        en: {
            incorrectUid: "Hey, please enter a correct uid!",
            nowTrackingUid: "Now tracking uid %s.",
            noLongerTrackingUid: "No longer tracking uid %s.",
        },
    };
}
