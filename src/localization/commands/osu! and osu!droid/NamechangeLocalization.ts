import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface NamechangeStrings {
    readonly noActiveRequest: string;
    readonly invalidUid: string;
    readonly uidHasNoActiveRequest: string;
    readonly userHasNoActiveRequest: string;
    readonly newNameAlreadyTaken: string;
    readonly activeRequestExists: string;
    readonly requestCooldownNotExpired: string;
    readonly currentBindedAccountDoesntExist: string;
    readonly newUsernameContainsUnicode: string;
    readonly newUsernameTooLong: string;
    readonly emailNotEqualToBindedAccount: string;
    readonly requestSuccess: string;
    readonly userHasNoHistory: string;
    readonly acceptFailed: string;
    readonly acceptSuccess: string;
    readonly cancelFailed: string;
    readonly cancelSuccess: string;
    readonly denyFailed: string;
    readonly denySuccess: string;
    readonly nameHistoryForUid: string;
    readonly nameHistory: string;
    readonly nameChangeRequestList: string;
    readonly discordAccount: string;
    readonly usernameRequested: string;
    readonly creationDate: string;
}

/**
 * Localizations for the `namechange` command.
 */
export class NamechangeLocalization extends Localization<NamechangeStrings> {
    protected override readonly translations: Readonly<
        Translation<NamechangeStrings>
    > = {
        en: {
            noActiveRequest:
                "I'm sorry, there is no active name change request now!",
            invalidUid: "Hey, please enter a valid uid!",
            uidHasNoActiveRequest:
                "I'm sorry, this user does not have an active name change request!",
            userHasNoActiveRequest:
                "I'm sorry, you do not have an active name change request!",
            newNameAlreadyTaken:
                "I'm sorry, the requested username has been taken!",
            activeRequestExists:
                "Hey, you currently have an active request! Please wait for that one to get reviewed before submitting another one!",
            requestCooldownNotExpired:
                "I'm sorry, you're still in cooldown! You will be able to send a name change request in `%s`.",
            currentBindedAccountDoesntExist:
                "I'm sorry, I cannot find your currently binded account in osu!droid server!",
            newUsernameContainsUnicode:
                "I'm sorry, usernames can only contain letters, numbers, and underscores!",
            newUsernameTooLong:
                "I'm sorry, a username must be at least 2 characters and doesn't exceed 20 characters!",
            emailNotEqualToBindedAccount:
                "I'm sorry, the email you have provided is not the same as the email registered to your binded osu!droid account!",
            requestSuccess:
                "Successfully requested name change. Please wait for it to get reviewed!\n\nRemember to not disable your Direct Messages or else you won't get notified of your name change request status!",
            userHasNoHistory:
                "I'm sorry, this player doesn't have any name change history!",
            acceptFailed:
                "I'm sorry, I couldn't accept the name change request: %s.",
            acceptSuccess: "Successfully accepted name change request.",
            cancelFailed:
                "I'm sorry, I couldn't cancel your name change request: %s.",
            cancelSuccess: "Successfully cancelled your name change request.",
            denyFailed:
                "I'm sorry, I couldn't deny the name change request: %s.",
            denySuccess: "Successfully denied name change request for `%s`.",
            nameHistoryForUid: "Name History for Uid %s",
            nameHistory: "Name History",
            nameChangeRequestList: "Name Change Request List",
            discordAccount: "Discord Account",
            usernameRequested: "Username Requested",
            creationDate: "Creation Date",
        },
        kr: {
            noActiveRequest:
                "죄송해요, 현재 활성화된 유저네임 변경 요청이 없어요!",
            invalidUid: "저기, 유효한 uid를 입력해 주세요!",
            uidHasNoActiveRequest:
                "죄송해요, 이 유저는 현재 활성화된 유저네임 변경 요청이 없어요!",
            userHasNoActiveRequest:
                "죄송해요, 당신은 현재 활성화된 유저네임 변경 요청이 없네요!",
            newNameAlreadyTaken:
                "죄송해요, 요청하신 유저네임은 이미 다른 누군가가 가져갔어요!",
            activeRequestExists:
                "저기, 이미 활성화된 요청이 있으시네요! 다른 요청을 하기 전에 그 요청이 해결되는 것부터 기다려 주세요!",
            requestCooldownNotExpired:
                "죄송해요, 아직 쿨다운 상태에요! 다음 날짜에 유저네임 변경을 요청 할 수 있어요: %s.",
            currentBindedAccountDoesntExist:
                "죄송해요, 당신이 osu!droid 서버에 바인딩된 계정을 찾을 수 없어요!",
            newUsernameContainsUnicode:
                "죄송해요, 유저네임은 문자, 숫자, 언더바(_)만 포함할 수 있어요!",
            newUsernameTooLong:
                "죄송해요, 유저네임은 최소 2글자에서 최대 20글자까지만 가능해요!",
            emailNotEqualToBindedAccount:
                "죄송해요, 제공해주신 이메일이 현재 당신에게 바인딩된 osu!droid 계정을 만들 때 사용한 이메일과 달라요!",
            requestSuccess:
                "성공적으로 유저네임 변경을 요청했어요. 요청이 처리되기를 기다려 주세요!",
            userHasNoHistory:
                "다이렉트 메시지(DM)을 비활성화하지 마세요! 요청 상태에 관한 알림을 드려야 해요!",
            acceptFailed: "죄송해요, 이 유저는 유저네임 변경 기록이 없네요!",
            acceptSuccess:
                "죄송해요, 유저네임 변경 요청을 승낙할 수 없었어요: %s.",
            cancelFailed: "요청 상세사항",
            cancelSuccess: "현재 유저네임",
            denyFailed: "요청한 유저네임",
            denySuccess: "만들어진 날짜",
            nameHistoryForUid: "Uid %s의 유저네임 기록",
            nameHistory: "유저네임 기록",
            nameChangeRequestList: "유저네임 변경 요청 목록",
            discordAccount: "디스코드 계정",
            usernameRequested: "요청한 유저네임",
            creationDate: "만들어진 날짜",
        },
    };
}
