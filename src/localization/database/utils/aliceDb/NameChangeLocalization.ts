import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface NameChangeStrings {
    readonly requestNotActive: string;
    readonly playerNotFound: string;
    readonly droidServerRequestFailed: string;
    readonly newUsernameTaken: string;
    readonly requestDetails: string;
    readonly currentUsername: string;
    readonly requestedUsername: string;
    readonly creationDate: string;
    readonly status: string;
    readonly accepted: string;
    readonly acceptedNotification: string;
    readonly denied: string;
    readonly reason: string;
    readonly deniedNotification: string;
}

/**
 * Localizations for the `NameChange` database utility.
 */
export class NameChangeLocalization extends Localization<NameChangeStrings> {
    protected override readonly translations: Readonly<
        Translation<NameChangeStrings>
    > = {
        en: {
            requestNotActive: "name change request is not active",
            playerNotFound: "Cannot find player profile",
            droidServerRequestFailed:
                "cannot create request to osu!droid server",
            newUsernameTaken: "New username taken",
            requestDetails: "Request Details",
            currentUsername: "Current Username",
            requestedUsername: "Requested Username",
            creationDate: "Creation Date",
            status: "Status",
            accepted: "Accepted",
            acceptedNotification:
                "Hey, I would like to inform you that your name change request was accepted. You will be able to change your username again in %s.",
            denied: "Denied",
            reason: "Reason",
            deniedNotification:
                "Hey, I would like to inform you that your name change request was denied due to `%s`. You are not subjected to the 30-day cooldown yet, so feel free to submit another request. Sorry in advance!",
        },
        kr: {
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
        },
        id: {
            requestNotActive: "",
            playerNotFound: "",
            droidServerRequestFailed: "",
            newUsernameTaken: "",
            requestDetails: "",
            currentUsername: "",
            requestedUsername: "",
            creationDate: "",
            status: "",
            accepted: "",
            acceptedNotification: "",
            denied: "",
            reason: "",
            deniedNotification: "",
        },
    };
}
