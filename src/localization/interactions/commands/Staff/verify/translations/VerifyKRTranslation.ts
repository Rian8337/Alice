import { Translation } from "@alice-localization/base/Translation";
import { VerifyStrings } from "../VerifyLocalization";

/**
 * The Korean translation for the `verify` command.
 */
export class VerifyKRTranslation extends Translation<VerifyStrings> {
    override readonly translations: VerifyStrings = {
        commandNotAvailableInChannel:
            "죄송해요, 이 명령어는 이곳에서 사용할 수 없어요.",
        userIsNotInThread: "죄송해요, 해당 유저는 이 스레드에 없어요!",
        userIsNotInVerification:
            "죄송해요, 해당 유저는 현재 인증(verify)과정을 진행중이지 않아요!",
        userIsAlreadyVerifiedError:
            "죄송해요, 해당 유저는 이미 인증(verify)됐어요!",
        verificationSuccess: "성공적으로 유저를 인증했어요. 스레드를 닫을게요.",
    };
}
