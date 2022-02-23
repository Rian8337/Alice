import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface UserbindStrings {
    readonly profileNotFound: string;
    readonly verificationMapNotFound: string;
    readonly newAccountBindNotInMainServer: string;
    readonly newAccountBindNotVerified: string;
    readonly newAccountUidBindConfirmation: string;
    readonly newAccountUsernameBindConfirmation: string;
    readonly newAccountUidBindSuccessful: string;
    readonly newAccountUsernameBindSuccessful: string;
    readonly accountUidBindError: string;
    readonly accountUsernameBindError: string;
    readonly accountHasBeenBindedError: string;
    readonly oldAccountUidBindSuccessful: string;
    readonly oldAccountUsernameBindSuccessful: string;
    readonly verificationMapInformation: string;
}

/**
 * Localizations for the `userbind` command.
 */
export class UserbindLocalization extends Localization<UserbindStrings> {
    protected override readonly translations: Readonly<
        Translation<UserbindStrings>
    > = {
        en: {
            profileNotFound:
                "I'm sorry, I couldn't find that account's profile!",
            verificationMapNotFound:
                "I'm sorry, this account has not played the verification beatmap! Please use `/userbind verifymap` to get the verification beatmap.",
            newAccountBindNotInMainServer:
                "I'm sorry, new account binding must be done in the osu!droid International Discord server! This is required to keep bind moderation at ease.",
            newAccountBindNotVerified:
                "I'm sorry, you must be a verified member to use this command!",
            newAccountUidBindConfirmation:
                "Are you sure you want to bind your account to uid %s?",
            newAccountUsernameBindConfirmation:
                "Are you sure you want to bind your account to username %s?",
            newAccountUidBindSuccessful:
                "Successfully binded your account to uid %s. You can bind %s more osu!droid account(s).",
            newAccountUsernameBindSuccessful:
                "Successfully binded your account to username %s. You can bind %s more osu!droid account(s).",
            accountUidBindError:
                "I'm sorry, I couldn't bind your account to uid %s: %s.",
            accountUsernameBindError:
                "I'm sorry, I couldn't bind your account to username %s: %s.",
            accountHasBeenBindedError:
                "I'm sorry, that osu!droid account has been binded to another Discord account!",
            oldAccountUidBindSuccessful:
                "Successfully binded your account to uid %s.",
            oldAccountUsernameBindSuccessful:
                "Successfully binded your account to username %s.",
            verificationMapInformation:
                "Use this beatmap to verify that you are the owner of an osu!droid account. This is required if you want to bind it for the first time.",
        },
        kr: {
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
        },
        id: {
            profileNotFound: "",
            verificationMapNotFound: "",
            newAccountBindNotInMainServer: "",
            newAccountBindNotVerified: "",
            newAccountUidBindConfirmation: "",
            newAccountUsernameBindConfirmation: "",
            newAccountUidBindSuccessful: "",
            newAccountUsernameBindSuccessful: "",
            accountUidBindError: "",
            accountUsernameBindError: "",
            accountHasBeenBindedError: "",
            oldAccountUidBindSuccessful: "",
            oldAccountUsernameBindSuccessful: "",
            verificationMapInformation: "",
        },
    };
}
