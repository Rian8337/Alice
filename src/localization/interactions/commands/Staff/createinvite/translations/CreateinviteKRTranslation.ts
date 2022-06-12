import { Translation } from "@alice-localization/base/Translation";
import { CreateinviteStrings } from "../CreateinviteLocalization";

/**
 * The Korean translation for the `createinvite` command.
 */
export class CreateinviteKRTranslation extends Translation<CreateinviteStrings> {
    override readonly translations: CreateinviteStrings = {
        expiryTimeInvalid:
            "저기, 초대 링크가 만료될 유효한 시간을 입력해 주세요!",
        maximumUsageInvalid:
            "저기, 초대 링크의 최대 사용 횟수를 입력해 주세요!",
        inviteLinkCreated: "초대 링크 생성됨",
        createdInChannel: "%s에서 생성",
        maxUsage: "최대 사용 횟수",
        infinite: "무한",
        expirationTime: "만료 시간",
        never: "없음",
        reason: "이유",
        inviteLink: "초대 링크",
        notSpecified: "지정되지 않음.",
    };
}
