import { Translation } from "@localization/base/Translation";
import { chatInputApplicationCommandMention } from "discord.js";
import { ConstantsStrings } from "../ConstantsLocalization";

/**
 * The Indonesian translation for the `Constants` core class.
 */
export class ConstantsIDTranslation extends Translation<ConstantsStrings> {
    override readonly translations: ConstantsStrings = {
        noPermissionToExecuteCommand:
            "Maaf, kamu tidak memiliki izin untuk mengeksekusi perintah ini.",
        selfAccountNotBinded: `Maaf, akun kamu belum terhubung. Kamu perlu menghubungkan akunmu menggunakan ${chatInputApplicationCommandMention(
            "userbind",
            "username",
            "1302217968935108639",
        )} terlebih dahulu.`,
        commandNotAvailableInServer:
            "Maaf, perintah ini tidak tersedia untuk server ini.",
        commandNotAvailableInChannel:
            "Maaf, perintah ini tidak tersedia untuk channel ini.",
        userAccountNotBinded: `Maaf, akun tersebut belum terhubung. Pemilik akun tersebut perlu menghubungkan akunnya menggunakan ${chatInputApplicationCommandMention(
            "userbind",
            "username",
            "1302217968935108639",
        )} terlebih dahulu.`,
    };
}
