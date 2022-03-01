import { Translation } from "@alice-localization/base/Translation";
import { NamechangeStrings } from "../NamechangeLocalization";

/**
 * The Korean translation for the `namechange` command.
 */
export class NamechangeKRTranslation extends Translation<NamechangeStrings> {
    override readonly translations: NamechangeStrings = {
        noActiveRequest: "죄송해요, 현재 활성화된 유저네임 변경 요청이 없어요!",
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
        acceptSuccess: "죄송해요, 유저네임 변경 요청을 승낙할 수 없었어요: %s.",
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
    };
}
