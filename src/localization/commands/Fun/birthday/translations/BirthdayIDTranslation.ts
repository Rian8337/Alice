import { Translation } from "@alice-localization/base/Translation";
import { BirthdayStrings } from "../BirthdayLocalization";

/**
 * The Indonesian translation for the `birthday` command.
 */
export class BirthdayIDTranslation extends Translation<BirthdayStrings> {
    override readonly translations: BirthdayStrings = {
        selfBirthdayNotExist:
            "Maaf, kamu belum mengatur informasi ulang tahunmu!",
        userBirthdayNotExist:
            "Maaf, pengguna tersebut belum mengatur informasi ulang tahunnya!",
        setBirthdayFailed:
            "Maaf, aku tidak bisa mengatur informasi ulang tahun: %s.",
        setBirthdaySuccess:
            "Berhasil mengatur ulang tahun pada tanggal %s/%s di zona waktu UTC%s.",
        birthdayInfo: "Informasi Ulang Tahun untuk %s",
        date: "Tanggal",
        timezone: "Zona Waktu",
    };
}
