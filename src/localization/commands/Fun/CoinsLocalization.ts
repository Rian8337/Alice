import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface CoinsStrings {
    readonly userNotInServerForAWeek: string;
    readonly dailyClaimFailed: string;
    readonly dailyClaimSuccess: string;
    readonly dailyClaimWithStreakSuccess: string;
    readonly selfCoinAmountInfo: string;
    readonly userCoinAmountInfo: string;
    readonly userToTransferNotFound: string;
    readonly userToTransferIsBot: string;
    readonly userToTransferIsSelf: string;
    readonly transferAmountInvalid: string;
    readonly userToTransferNotInServerForAWeek: string;
    readonly userDoesntHaveCoinsInfo: string;
    readonly otherUserDoesntHaveCoinsInfo: string;
    readonly cannotFetchPlayerInformation: string;
    readonly notEnoughCoinsToTransfer: string;
    readonly coinTransferConfirmation: string;
    readonly coinTransferFailed: string;
    readonly coinTransferSuccess: string;
    readonly addAmountInvalid: string;
    readonly addCoinSuccess: string;
    readonly addCoinFailed: string;
    readonly removeAmountInvalid: string;
    readonly removeCoinFailed: string;
    readonly removeCoinSuccess: string;
}

/**
 * Localizations for the `coins` command.
 */
export class CoinsLocalization extends Localization<CoinsStrings> {
    protected override readonly translations: Readonly<
        Translation<CoinsStrings>
    > = {
        en: {
            userNotInServerForAWeek:
                "I'm sorry, you haven't been in the server for a week!",
            dailyClaimFailed:
                "I'm sorry, I couldn't process your daily coins claim: %s.",
            dailyClaimSuccess:
                "You have claimed `%s` Alice coins! Your current streak is `%s`. You now have `%s` Alice coins.",
            dailyClaimWithStreakSuccess:
                "You have completed a streak and claimed `%s` Alice coins! Your current streak is `%s`. You now have `%s` Alice coins.",
            selfCoinAmountInfo: "You have `%s` Alice coins.",
            userCoinAmountInfo: "That user has `%s` Alice coins.",
            userToTransferNotFound:
                "I'm sorry, I cannot find the user to give your coins to!",
            userToTransferIsBot: "Hey, you cannot transfer coins to a bot!",
            userToTransferIsSelf: "Hey, you cannot transfer coins to yourself!",
            transferAmountInvalid:
                "Hey, I need a valid amount of coins to transfer!",
            userToTransferNotInServerForAWeek:
                "I'm sorry, the user you are giving your coins to has not been in the server for a week!",
            userDoesntHaveCoinsInfo:
                "I'm sorry, I cannot find information about your Alice coins!",
            otherUserDoesntHaveCoinsInfo:
                "I'm sorry, I cannot find information about the user's Alice coins!",
            cannotFetchPlayerInformation:
                "I'm sorry, I cannot find your osu!droid profile!",
            notEnoughCoinsToTransfer: "I'm sorry, you don't have enough coins!",
            coinTransferConfirmation:
                "Are you sure you want to transfer `%s` Alice coins to %s?",
            coinTransferFailed:
                "I'm sorry, I'm unable to transfer your Alice coins: %s.",
            coinTransferSuccess:
                "Successfully transferred `%s` Alice coins to %s. You can transfer `%s` Alice coins left today. You now have `%s` Alice coins.",
            addAmountInvalid: "Hey, I need a valid amount of coins to add!",
            addCoinSuccess:
                "Successfully added `%s` Alice coins to the user. The user now has `%s` Alice coins.",
            addCoinFailed:
                "I'm sorry, I couldn't add Alice coins to the user: %s.",
            removeAmountInvalid:
                "Hey, I need a valid amount of coins to remove!",
            removeCoinFailed:
                "I'm sorry, I cannot remove the user's Alice coins: %s.",
            removeCoinSuccess:
                "Successfully removed `%s` Alice coins from user. The user now has `%s` Alice coins.",
        },
        kr: {
            userNotInServerForAWeek:
                "죄송해요, 서버에 오신 지 일주일이 되지 않으셨어요!",
            dailyClaimFailed:
                "죄송해요, 다음과 같은 이유로 데일리 코인 수령을 진행할 수 없었어요: %s.",
            dailyClaimSuccess:
                "`%s` 앨리스 코인을 받았어요! 현재 연속 출석 기록은 `%s`회에요. 이제 `%s` 앨리스 코인을 가지고 있어요.",
            dailyClaimWithStreakSuccess:
                "연속 출석을 완료해서 %s 앨리스 코인을 받았어요! 현재 연속 출석 기록은 %s회에요. 이제 %s 앨리스 코인을 가지고 있어요.",
            selfCoinAmountInfo: "당신은 현재 `%s` 앨리스 코인을 보유중이에요.",
            userCoinAmountInfo: "해당 유저는 `%s` 앨리스 코인을 보유중이에요.",
            userToTransferNotFound:
                "죄송해요, 코인을 주려는 유저를 찾지 못했어요!",
            userToTransferIsBot: "저기요, 봇에게 코인을 전달할 수는 없어요!",
            userToTransferIsSelf: "저기요, 자신에게 코인을 전달할 수는 없어요!",
            transferAmountInvalid:
                "저기, 전달할 코인의 양을 유효하게 정해주세요!",
            userToTransferNotInServerForAWeek:
                "죄송해요, 코인을 전달하려는 유저가 이 서버에 온 지 일주일이 되지 않았어요!",
            userDoesntHaveCoinsInfo:
                "죄송해요, 당신의 앨리스 코인에 관한 정보를 찾지 못했어요!",
            otherUserDoesntHaveCoinsInfo:
                "죄송해요, 이 유저의 앨리스 코인에 관한 정보를 찾지 못했어요!",
            cannotFetchPlayerInformation:
                "죄송해요, 당신의 osu!droid 프로필을 찾지 못했어요!",
            notEnoughCoinsToTransfer:
                "죄송해요, 보유중이신 코인이 충분하지 않아요!",
            coinTransferConfirmation:
                "%s 앨리스 코인을 %s에게 전달하고 싶은게 확실한가요?",
            coinTransferFailed:
                "죄송해요, 다음과 같은 이유로 앨리스 코인을 전달할 수 없었어요: %s.",
            coinTransferSuccess:
                "성공적으로 %s 앨리스 코인을 %s에게 전달했어요. 오늘 %s 앨리스 코인을 더 전달할 수 있어요. 당신은 이제 %s 앨리스 코인을 가지고 있어요.",
            addAmountInvalid: "저기, 추가할 코인의 양을 유효하게 정해주세요!",
            addCoinSuccess:
                "성공적으로 %s 앨리스 코인을 유저에게 추가했어요. 이 유저는 이제 %s 앨리스 코인을 가지고 있어요.",
            addCoinFailed:
                "죄송해요, 다음과 같은 이유로 유저에게 앨리스 코인을 전달할 수 없었어요: %s.",
            removeAmountInvalid:
                "저기, 제거할 코인의 양을 유효하게 정해주세요!",
            removeCoinFailed:
                "죄송해요, 다음과 같은 이유로 유저의 앨리스 코인을 제거할 수 없었어요: %s.",
            removeCoinSuccess:
                "성공적으로 유저에게서 %s 앨리스 코인을 제거했어요. 이 유저는 이제 %s 앨리스 코인을 가지고 있어요.",
        },
        id: {
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
        },
    };
}
