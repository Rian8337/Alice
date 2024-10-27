import { Translation } from "@localization/base/Translation";
import { Recent5Strings } from "../Recent5Localization";

/**
 * The Indonesian translation for the `recent5` command.
 */
export class Recent5IDTranslation extends Translation<Recent5Strings> {
    override readonly translations: Recent5Strings = {
        tooManyOptions:
            "Maaf, kamu hanya dapat memasukkan uid, pengguna, atau username! Kamu tidak dapat menggabung mereka!",
        playerNotFound:
            "Maaf, aku tidak dapat menemukan pemain yang kamu berikan!",
        playerHasNoRecentPlays:
            "Maaf, pemain ini belum pernah mengirimkan skor!",
    };
}
