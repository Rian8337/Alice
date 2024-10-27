import { Translation } from "@localization/base/Translation";
import { CoinsStrings } from "../CoinsLocalization";

/**
 * The Indonesian translation for the `coins` command.
 */
export class CoinsIDTranslation extends Translation<CoinsStrings> {
    override readonly translations: CoinsStrings = {
        claimNotAvailable: "Maaf, klaim koin Mahiru dimatikan untuk sementara.",
        userNotInServerForAWeek:
            "Maaf, kamu belum berada di server ini selama seminggu!",
        dailyClaimFailed:
            "Maaf, aku tidak bisa memproses klaim koin Mahiru harian kamu: %s.",
        dailyClaimSuccess:
            "Kamu telah mendapatkan `%s` koin Mahiru! Streak klaim harian koin Mahiru kamu sekarang `%s`. Sekarang kamu memiliki `%s` koin Mahiru.",
        dailyClaimWithStreakSuccess:
            "Kamu telah menyelesaikan kombo 5 hari klaim dan mendapatkan `%s` koin Mahiru! Kamu telah mengklaim koin Mahiru harian sebanyak `%s` kali. Sekarang kamu memiliki `%s` koin Mahiru.",
        selfCoinAmountInfo: "Kamu memiliki `%s` koin Mahiru.",
        userCoinAmountInfo: "Pengguna tersebut memiliki `%s` koin Mahiru.",
        userToTransferNotFound:
            "Maaf, aku tidak dapat menemukan target transfer koin Mahiru yang diberikan!",
        userToTransferIsBot:
            "Hei, kamu tidak dapat mentransfer koin Mahiru kepada bot!",
        userToTransferIsSelf:
            "Hei, kamu tidak dapat mentransfer koin Mahiru kepada dirimu sendiri!",
        transferAmountInvalid:
            "Hei, mohon berikan jumlah koin Mahiru yang akan ditransfer dengan benar!",
        userToTransferNotInServerForAWeek:
            "Maaf, target transfer koin Mahirumu belum berada di server selama seminggu!",
        userDoesntHaveCoinsInfo:
            "Maaf, aku tidak dapat menemukan informasi mengenai koin Mahirumu!",
        otherUserDoesntHaveCoinsInfo:
            "Maaf, aku tidak dapat menemukan informasi mengenai koin Mahiru pengguna tersebut!",
        cannotFetchPlayerInformation:
            "Maaf, aku tidak dapat menemukan profil osu!droid kamu!",
        notEnoughCoinsToTransfer:
            "Maaf, kamu tidak memiliki cukup koin Mahiru untuk mentransfer!",
        coinTransferConfirmation:
            "Apakah kamu yakin akan mentransfer `%s` koin Mahiru kepada %s?",
        coinTransferFailed:
            "Maaf, aku tidak dapat mentransfer koin Mahirumu: %s.",
        coinTransferSuccess:
            "Berhasil mentransfer `%s` koin Mahiru kepada `%s`. Sekarang kamu memiliki `%s` koin Mahiru.",
        addAmountInvalid:
            "Hei, mohon berikan jumlah koin Mahiru yang akan ditambah dengan benar!",
        addCoinSuccess:
            "Berhasil menambahkan `%s` koin Mahiru kepada pengguna tersebut. Sekarang pengguna tersebut memiliki `%s` koin Mahiru.",
        addCoinFailed:
            "Maaf, aku tidak dapat menambahkan koin Mahiru kepada pengguna tersebut: %s.",
        removeAmountInvalid:
            "Hei, mohon berikan jumlah koin Mahiru yang akan diambil dengan benar!",
        removeCoinFailed:
            "Maaf, aku tidak dapat mengambil koin Mahiru dari pengguna tersebut: %s.",
        removeCoinSuccess:
            "Berhasil mengambil `%s` koin Mahiru dari pengguna tersebut. Sekarang pengguna tersebut memiliki `%s` koin Mahiru.",
    };
}
