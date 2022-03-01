import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { CreateinviteENTranslation } from "./translations/CreateinviteENTranslation";
import { CreateinviteIDTranslation } from "./translations/CreateinviteIDTranslation";
import { CreateinviteKRTranslation } from "./translations/CreateinviteKRTranslation";

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
    protected override readonly localizations: Readonly<
        Translations<CreateinviteStrings>
    > = {
        en: new CreateinviteENTranslation(),
        kr: new CreateinviteKRTranslation(),
        id: new CreateinviteIDTranslation(),
    };
}
