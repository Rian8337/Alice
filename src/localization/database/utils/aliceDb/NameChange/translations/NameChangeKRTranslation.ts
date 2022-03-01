import { Translation } from "@alice-localization/base/Translation";
import { NameChangeStrings } from "../NameChangeLocalization";

/**
 * The Korean translation for the `NameChange` database utility.
 */
export class NameChangeKRTranslation extends Translation<NameChangeStrings> {
    override readonly translations: NameChangeStrings = {
        requestNotActive: "유저네임 변경 요청이 활성화되어있지 않음",
        playerNotFound: "플레이어 프로필을 찾지 못함",
        droidServerRequestFailed: "osu!droid 서버에 요청을 만들 수 없음",
        newUsernameTaken: "새 유저네임을 누군가가 가져감",
        requestDetails: "요청 상세사항",
        currentUsername: "현재 유저네임",
        requestedUsername: "요청한 유저네임",
        creationDate: "생성 날짜",
        status: "상태",
        accepted: "수락됨",
        acceptedNotification:
            "저기, 당신의 유저네임 변경 요청이 수락되었음을 알려드리려 왔어요. 다음 날짜에 다시 유저네임을 바꿀 수 있어요: %s.",
        denied: "거부됨",
        reason: "이유",
        deniedNotification:
            "저기, 당신의 유저네임 변경 요청이 `%s` 때문에 거부되었음을 알려드리려 왔어요. 30일 쿨다운은 적용되지 않았으니, 바로 다른 변경 요청을 하셔도 돼요. 미리 죄송해요!",
    };
}
