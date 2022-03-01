import { Translation } from "@alice-localization/base/Translation";
import { UnbindStrings } from "../UnbindLocalization";

/**
 * The Indonesian translation for the `unbind` command.
 */
export class UnbindIDTranslation extends Translation<UnbindStrings> {
    override readonly translations: UnbindStrings = {
        invalidUid: "Hei, mohon berikan uid yang benar!",
        uidNotBinded: "Maaf, uid tersebut tidak terhubung!",
        unbindFailed: "Maaf, aku tidak bisa melepas hubungan uid tersebut: %s.",
        unbindSuccessful: "Berhasil melepas hubungan uid %s.",
    };
}
