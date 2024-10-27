import { Translation } from "@localization/base/Translation";
import { CoinsStrings } from "../CoinsLocalization";

/**
 * The Indonesian translation for the `coins` command.
 */
export class CoinsIDTranslation extends Translation<CoinsStrings> {
    override readonly translations: CoinsStrings = {
        claimNotAvailable: "Maaf, klaim koin Alice dimatikan untuk sementara.",
        userNotInServerForAWeek:
            "Maaf, kamu belum berada di server ini selama seminggu!",
        dailyClaimFailed:
            "Maaf, aku tidak bisa memproses klaim koin Alice harian kamu: %s.",
        dailyClaimSuccess:
            "Kamu telah mendapatkan `%s` koin Alice! Streak klaim harian koin Alice kamu sekarang `%s`. Sekarang kamu memiliki `%s` koin Alice.",
        dailyClaimWithStreakSuccess:
            "Kamu telah menyelesaikan kombo 5 hari klaim dan mendapatkan `%s` koin Alice! Kamu telah mengklaim koin Alice harian sebanyak `%s` kali. Sekarang kamu memiliki `%s` koin Alice.",
        selfCoinAmountInfo: "Kamu memiliki `%s` koin Alice.",
        userCoinAmountInfo: "Pengguna tersebut memiliki `%s` koin Alice.",
        userToTransferNotFound:
            "Maaf, aku tidak dapat menemukan target transfer koin Alice yang diberikan!",
        userToTransferIsBot:
            "Hei, kamu tidak dapat mentransfer koin Alice kepada bot!",
        userToTransferIsSelf:
            "Hei, kamu tidak dapat mentransfer koin Alice kepada dirimu sendiri!",
        transferAmountInvalid:
            "Hei, mohon berikan jumlah koin Alice yang akan ditransfer dengan benar!",
        userToTransferNotInServerForAWeek:
            "Maaf, target transfer koin Alicemu belum berada di server selama seminggu!",
        userDoesntHaveCoinsInfo:
            "Maaf, aku tidak dapat menemukan informasi mengenai koin Alicemu!",
        otherUserDoesntHaveCoinsInfo:
            "Maaf, aku tidak dapat menemukan informasi mengenai koin Alice pengguna tersebut!",
        cannotFetchPlayerInformation:
            "Maaf, aku tidak dapat menemukan profil osu!droid kamu!",
        notEnoughCoinsToTransfer:
            "Maaf, kamu tidak memiliki cukup koin Alice untuk mentransfer!",
        coinTransferConfirmation:
            "Apakah kamu yakin akan mentransfer `%s` koin Alice kepada %s?",
        coinTransferFailed:
            "Maaf, aku tidak dapat mentransfer koin Alicemu: %s.",
        coinTransferSuccess:
            "Berhasil mentransfer `%s` koin Alice kepada `%s`. Sekarang kamu memiliki `%s` koin Alice.",
        addAmountInvalid:
            "Hei, mohon berikan jumlah koin Alice yang akan ditambah dengan benar!",
        addCoinSuccess:
            "Berhasil menambahkan `%s` koin Alice kepada pengguna tersebut. Sekarang pengguna tersebut memiliki `%s` koin Alice.",
        addCoinFailed:
            "Maaf, aku tidak dapat menambahkan koin Alice kepada pengguna tersebut: %s.",
        removeAmountInvalid:
            "Hei, mohon berikan jumlah koin Alice yang akan diambil dengan benar!",
        removeCoinFailed:
            "Maaf, aku tidak dapat mengambil koin Alice dari pengguna tersebut: %s.",
        removeCoinSuccess:
            "Berhasil mengambil `%s` koin Alice dari pengguna tersebut. Sekarang pengguna tersebut memiliki `%s` koin Alice.",
    };
}
