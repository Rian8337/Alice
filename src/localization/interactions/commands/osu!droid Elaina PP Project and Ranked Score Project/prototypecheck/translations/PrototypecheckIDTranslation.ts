import { Translation } from "@alice-localization/base/Translation";
import { PrototypecheckStrings } from "../PrototypecheckLocalization";

/**
 * The Indonesian translation for the `prototypecheck` command.
 */
export class PrototypecheckIDTranslation extends Translation<PrototypecheckStrings> {
    override readonly translations: PrototypecheckStrings = {
        tooManyOptions: "",
        selfInfoNotAvailable: "",
        userInfoNotAvailable: "",
        ppProfileTitle: "",
        totalPP: "",
        prevTotalPP: "",
        diff: "",
        ppProfile: "",
        lastUpdate: "",
    };
}
