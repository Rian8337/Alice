import { Translation } from "@localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The Korean translation for the `userbind` command.
 */
export class UserbindKRTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound: "죄송해요, 그 계정의 프로필을 찾을 수 없었어요!",
        newAccountBindNotInMainServer:
            "죄송해요, 새 계정 바인딩은 osu!droid International 디스코드 서버에서만 할 수 있어요! 이는 바인딩 관리를 편하게 하기위해 필요해요.",
        emailNotSpecified: "",
        incorrectEmail: "",
        newAccountUidBindConfirmation:
            "정말 당신의 계정을 uid %s에 바인딩 하실건가요?",
        newAccountUsernameBindConfirmation:
            "정말 당신의 계정을 유저네임 %s에 바인딩 하실건가요?",
        newAccountUidBindSuccessful:
            "성공적으로 당신의 계정을 uid %s에 바인딩했어요. 이제 osu!droid 계정을 %s개 더 바인딩할 수 있어요.",
        newAccountUsernameBindSuccessful:
            "성공적으로 당신의 계정을 유저네임 %s에 바인딩했어요. 이제 osu!droid 계정을 %s개 더 바인딩할 수 있어요.",
        accountUidBindError:
            "죄송해요, 당신의 계정을 uid %s에 바인딩할 수 없었어요: %s.",
        accountUsernameBindError:
            "죄송해요, 당신의 계정을 유저네임 %s에 바인딩할 수 없었어요: %s.",
        accountHasBeenBindedError:
            "죄송해요, 그 osu!droid 계정은 다른 디스코드 계정에 바인딩 되어있어요!",
        oldAccountUidBindSuccessful:
            "성공적으로 당신의 계정을 uid %s에 바인딩했어요.",
        oldAccountUsernameBindSuccessful:
            "성공적으로 당신의 계정을 유저네임 %s에 바인딩했어요.",
    };
}
