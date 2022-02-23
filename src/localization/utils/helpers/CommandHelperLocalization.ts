import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface CommandHelperStrings {
    readonly commandNotFound: string;
    readonly permissionsRequired: string;
}

/**
 * Localizations for the `CommandHelper` helper utility.
 */
export class CommandHelperLocalization extends Localization<CommandHelperStrings> {
    protected override readonly translations: Readonly<
        Translation<CommandHelperStrings>
    > = {
        en: {
            commandNotFound:
                "I'm sorry, I cannot find the command that you are looking for!",
            permissionsRequired: "You need these permissions:",
        },
        kr: {
            commandNotFound: "죄송해요, 찾으시려는 명령어를 찾지 못했어요!",
            permissionsRequired: "이 권한들이 필요해요:",
        },
        id: {
            commandNotFound: "",
            permissionsRequired: "",
        },
    };
}
