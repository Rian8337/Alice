import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface CommandUtilManagerStrings {
    readonly cooldownOutOfRange: string;
    readonly commandAlreadyDisabled: string;
}

/**
 * Localizations for the `CommandUtilManager` manager utility.
 */
export class CommandUtilManagerLocalization extends Localization<CommandUtilManagerStrings> {
    protected override readonly translations: Readonly<
        Translation<CommandUtilManagerStrings>
    > = {
        en: {
            cooldownOutOfRange: "cooldown must be between 5 and 3600 seconds",
            commandAlreadyDisabled: "command is already disabled",
        },
    };
}
