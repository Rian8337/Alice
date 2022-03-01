import { Translation } from "@alice-localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The Korean translation for the `userbind` command.
 */
export class UserbindKRTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound: "죄송해요, 그 계정의 프로필을 찾을 수 없었어요!",
        verificationMapNotFound:
            "죄송해요, 이 계정은 인증 비트맵을 플레이하지 않았어요! 인증 비트맵을 받기 위해선 `/userbind verifymap`을 입력하세요.",
        newAccountBindNotInMainServer:
            "죄송해요, 새 계정 바인딩은 osu!droid International 디스코드 서버에서만 할 수 있어요! 이는 바인딩 관리를 편하게 하기위해 필요해요.",
        newAccountBindNotVerified:
            "죄송해요, 이 명령어를 사용하려면 인증된(verified) 멤버여야 해요!",
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
        verificationMapInformation:
            "당신이 osu!droid 계정을 소유하고 있다는 것을 인증하기 위해 이 비트맵을 사용하세요. 바인딩을 처음 수행하려면 필요한 과정이에요.",
    };
}
