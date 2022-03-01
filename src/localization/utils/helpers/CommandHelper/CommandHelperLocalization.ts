import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { CommandHelperENTranslation } from "./translations/CommandHelperENTranslation";
import { CommandHelperIDTranslation } from "./translations/CommandHelperIDTranslation";
import { CommandHelperKRTranslation } from "./translations/CommandHelperKRTranslation";

export interface CommandHelperStrings {
    readonly commandNotFound: string;
    readonly permissionsRequired: string;
}

/**
 * Localizations for the `CommandHelper` helper utility.
 */
export class CommandHelperLocalization extends Localization<CommandHelperStrings> {
    protected override readonly localizations: Readonly<
        Translations<CommandHelperStrings>
    > = {
        en: new CommandHelperENTranslation(),
        kr: new CommandHelperKRTranslation(),
        id: new CommandHelperIDTranslation(),
    };
}
