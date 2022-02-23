import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface CreateinviteStrings {
    readonly expiryTimeInvalid: string;
    readonly maximumUsageInvalid: string;
    readonly inviteLinkCreated: string;
    readonly createdInChannel: string;
    readonly maxUsage: string;
    readonly infinite: string;
    readonly expirationTime: string;
    readonly never: string;
    readonly reason: string;
    readonly inviteLink: string;
    readonly notSpecified: string; // see 78.1
}

/**
 * Localizations for the `createinvite` command.
 */
export class CreateinviteLocalization extends Localization<CreateinviteStrings> {
    protected override readonly translations: Readonly<
        Translation<CreateinviteStrings>
    > = {
        en: {
            expiryTimeInvalid:
                "Hey, please enter a valid time for invite link expiration!",
            maximumUsageInvalid:
                "Hey, please enter a valid maximum invite link usage!",
            inviteLinkCreated: "Invite Link Created",
            createdInChannel: "Created in %s",
            maxUsage: "Maximum Usage",
            infinite: "Infinite",
            expirationTime: "Expiration Time",
            never: "Never",
            reason: "Reason",
            inviteLink: "Invite Link",
            notSpecified: "Not specified.",
        },
        kr: {
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
        },
        id: {
            expiryTimeInvalid: "",
            maximumUsageInvalid: "",
            inviteLinkCreated: "",
            createdInChannel: "",
            maxUsage: "",
            infinite: "",
            expirationTime: "",
            never: "",
            reason: "",
            inviteLink: "",
            notSpecified: "",
        },
    };
}
