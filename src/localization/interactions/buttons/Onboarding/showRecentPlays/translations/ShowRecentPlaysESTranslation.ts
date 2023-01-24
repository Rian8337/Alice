import { Translation } from "@alice-localization/base/Translation";
import { ShowRecentPlaysStrings } from "../ShowRecentPlaysLocalization";

/**
 * The Spanish translation for the `showRecentPlays` button command.
 */
export class ShowRecentPlaysESTranslation extends Translation<ShowRecentPlaysStrings> {
    override readonly translations: ShowRecentPlaysStrings = {
        userNotBinded: "",
        profileNotFound: "Lo siento, no puede encontrar tu perfil!",
    };
}
