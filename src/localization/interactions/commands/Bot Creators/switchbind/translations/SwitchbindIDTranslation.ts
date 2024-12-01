import { Translation } from "@localization/base/Translation";
import { SwitchbindStrings } from "../SwitchbindLocalization";

/**
 * The Indonesian translation of the `switchbind` command.
 */
export class SwitchbindIDTranslation extends Translation<SwitchbindStrings> {
    override readonly translations: SwitchbindStrings = {
        invalidUid: "Hei, mohon berikan uid yang benar!",
        uidNotBinded: "Maaf, uid ini tidak terhubung ke seorang pengguna!",
        switchFailed: "Maaf, aku tidak bisa memindahkan uid tersebut: %s.",
        switchSuccessful: "Berhasil memindahkan uid.",
    };
}
