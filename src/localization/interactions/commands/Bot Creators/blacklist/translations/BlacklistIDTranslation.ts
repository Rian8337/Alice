import { Translation } from "@localization/base/Translation";
import { BlacklistStrings } from "../BlacklistLocalization";

/**
 * The Indonesian translation for the `blacklist` command.
 */
export class BlacklistIDTranslation extends Translation<BlacklistStrings> {
    override readonly translations: BlacklistStrings = {
        noBeatmapProvided:
            "Hei, mohon berikan beatmap untuk dimasukkan atau dikeluarkan dari daftar hitam!",
        beatmapNotFound:
            "Hei, aku tidak dapat menemukan beatmap dari link atau ID yang diberikan!",
        noBlacklistReasonProvided:
            "Hei, mohon berikan alasanmu untuk mendaftarhitamkan beatmap ini!",
        blacklistFailed:
            "Maaf, aku tidak bisa mendaftarhitamkan beatmap tersebut: %s.",
        blacklistSuccess: "Berhasil mendaftarhitamkan `%s`.",
        unblacklistFailed:
            "Maaf, aku tidak bisa mengeluarkan beatmap tersebut dari daftar hitam: %s.",
        unblacklistSuccess: "Berhasil mengeluarkan `%s` dari daftar hitam.",
        detectedBeatmapId: "ID beatmap yang terdeteksi:",
        blacklist: "Masukkan ke daftar hitam",
        blacklistAction: "Masukkan beatmap tersebut ke daftar hitam.",
        unblacklist: "Keluarkan dari daftar hitam",
        unblacklistAction: "Keluarkan beatmap tersebut dari daftar hitam.",
    };
}
