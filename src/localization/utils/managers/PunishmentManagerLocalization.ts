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
    protected override readonly translations: Readonly<Translation<PunishmentManagerStrings>> = {
        en: {
            cannotFindLogChannel: "Unable to find the server log channel",
            invalidLogChannel: "The server's log channel is not a text channel",
        }
    };
}