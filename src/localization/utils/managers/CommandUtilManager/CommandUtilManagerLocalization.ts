import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { CommandUtilManagerENTranslation } from "./translations/CommandUtilManagerENTranslation";
import { CommandUtilManagerIDTranslation } from "./translations/CommandUtilManagerIDTranslation";
import { CommandUtilManagerKRTranslation } from "./translations/CommandUtilManagerKRTranslation";

export interface CommandUtilManagerStrings {
    readonly cooldownOutOfRange: string;
    readonly commandAlreadyDisabled: string;
}

/**
 * Localizations for the `CommandUtilManager` manager utility.
 */
export class CommandUtilManagerLocalization extends Localization<CommandUtilManagerStrings> {
    protected override readonly localizations: Readonly<
        Translations<CommandUtilManagerStrings>
    > = {
        en: new CommandUtilManagerENTranslation(),
        kr: new CommandUtilManagerKRTranslation(),
        id: new CommandUtilManagerIDTranslation(),
    };
}
