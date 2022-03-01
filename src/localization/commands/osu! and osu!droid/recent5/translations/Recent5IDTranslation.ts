import { Translation } from "@alice-localization/base/Translation";
import { Recent5Strings } from "../Recent5Localization";

/**
 * The Indonesian translation for the `recent5` command.
 */
export class Recent5IDTranslation extends Translation<Recent5Strings> {
    override readonly translations: Recent5Strings = {
        tooManyOptions: "",
        playerNotFound: "",
        playerHasNoRecentPlays: "",
    };
}
