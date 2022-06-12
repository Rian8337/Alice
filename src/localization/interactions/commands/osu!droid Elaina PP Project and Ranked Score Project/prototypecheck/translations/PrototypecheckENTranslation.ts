import { Translation } from "@alice-localization/base/Translation";
import { PrototypecheckStrings } from "../PrototypecheckLocalization";

/**
 * The English translation for the `prototypecheck` command.
 */
export class PrototypecheckENTranslation extends Translation<PrototypecheckStrings> {
    override readonly translations: PrototypecheckStrings = {
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
    };
}
