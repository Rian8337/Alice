import { Translation } from "@alice-localization/base/Translation";
import { ConstantsStrings } from "../ConstantsLocalization";

/**
 * The Indonesian translation for the `Constants` core class.
 */
export class ConstantsIDTranslation extends Translation<ConstantsStrings> {
    override readonly translations: ConstantsStrings = {
        noPermissionToExecuteCommand:
            "Maaf, kamu tidak memiliki izin untuk mengeksekusi perintah ini.",
        selfAccountNotBinded:
            "Maaf, akun kamu belum terhubung. Kamu perlu menghubungkan akunmu menggunakan `/userbind` terlebih dahulu.",
        commandNotAvailableInServer:
            "Maaf, perintah ini tidak tersedia untuk server ini.",
        commandNotAvailableInChannel:
            "Maaf, perintah ini tidak tersedia untuk channel ini.",
        userAccountNotBinded:
            "Maaf, akun tersebut belum terhubung. Pemilik akun tersebut perlu menghubungkan akunnya menggunakan `/userbind` terlebih dahulu.",
    };
}
