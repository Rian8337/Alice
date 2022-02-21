import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PrototypecheckStrings {
    readonly tooManyOptions: string;
    readonly selfInfoNotAvailable: string;
    readonly userInfoNotAvailable: string;
    readonly ppProfileTitle: string;
    readonly totalPP: string;
    readonly prevTotalPP: string;
    readonly diff: string;
    readonly ppProfile: string;
    readonly lastUpdate: string;
}

/**
 * Localizations for the `prototypecheck` command.
 */
export class PrototypecheckLocalization extends Localization<PrototypecheckStrings> {
    protected override readonly translations: Readonly<
        Translation<PrototypecheckStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            selfInfoNotAvailable:
                "I'm sorry, your prototype dpp information is not available!",
            userInfoNotAvailable:
                "I'm sorry, the user's prototype dpp information is not available!",
            ppProfileTitle: "PP Profile for %s",
            totalPP: "Total PP",
            prevTotalPP: "Previous Total PP",
            diff: "Difference",
            ppProfile: "PP Profile",
            lastUpdate: "Last Update",
        },
    };
}
