import { Translation } from "@localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The Korean translation for the `userbind` command.
 */
export class UserbindKRTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound: "죄송해요, 그 계정의 프로필을 찾을 수 없었어요!",
        incorrectEmail: "",
        bindConfirmation: "정말 당신의 계정을 %s에 바인딩 하실건가요?",
        bindError: "죄송해요, 당신의 계정을 %s에 바인딩할 수 없었어요: %s.",
        discordAccountAlreadyBoundError: "",
        accountHasBeenBoundError:
            "죄송해요, 그 osu!droid 계정은 다른 디스코드 계정에 바인딩 되어있어요!",
        bindSuccessful: "성공적으로 당신의 계정을 uid %s에 바인딩했어요.",
    };
}
