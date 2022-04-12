import { Translation } from "@alice-localization/base/Translation";
import { CoinsStrings } from "../CoinsLocalization";

/**
 * The Korean translation for the `coins` command.
 */
export class CoinsKRTranslation extends Translation<CoinsStrings> {
    override readonly translations: CoinsStrings = {
        claimNotAvailable: "",
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
        userToTransferNotFound: "죄송해요, 코인을 주려는 유저를 찾지 못했어요!",
        userToTransferIsBot: "저기요, 봇에게 코인을 전달할 수는 없어요!",
        userToTransferIsSelf: "저기요, 자신에게 코인을 전달할 수는 없어요!",
        transferAmountInvalid: "저기, 전달할 코인의 양을 유효하게 정해주세요!",
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
        removeAmountInvalid: "저기, 제거할 코인의 양을 유효하게 정해주세요!",
        removeCoinFailed:
            "죄송해요, 다음과 같은 이유로 유저의 앨리스 코인을 제거할 수 없었어요: %s.",
        removeCoinSuccess:
            "성공적으로 유저에게서 %s 앨리스 코인을 제거했어요. 이 유저는 이제 %s 앨리스 코인을 가지고 있어요.",
    };
}
