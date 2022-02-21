import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ClanCheckStrings {
    readonly memberKicked: string;
}

/**
 * Localizations for the `clanCheck` event utility for `guildMemberRemove` event.
 */
export class ClanCheckLocalization extends Localization<ClanCheckStrings> {
    protected override readonly translations: Readonly<Translation<ClanCheckStrings>> = {
        en: {
            memberKicked: "Hey, your member (%s) has left the server, therefore they have been kicked from your clan!",
        }
    };
}