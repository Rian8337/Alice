import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PunishmentManagerStrings {
    readonly cannotFindLogChannel: string;
    readonly invalidLogChannel: string;
}

/**
 * Localizations for the `PunishmentManager` manager utility.
 */
export class PunishmentManagerLocalization extends Localization<PunishmentManagerStrings> {
    protected override readonly translations: Readonly<
        Translation<PunishmentManagerStrings>
    > = {
        en: {
            cannotFindLogChannel: "Unable to find the server log channel",
            invalidLogChannel: "The server's log channel is not a text channel",
        },
        kr: {
            cannotFindLogChannel: "서버의 로그 채널을 찾을 수 없음",
            invalidLogChannel: "서버의 로그 채널이 텍스트 채널이 아님",
        },
        id: {
            cannotFindLogChannel: "",
            invalidLogChannel: "",
        },
    };
}
