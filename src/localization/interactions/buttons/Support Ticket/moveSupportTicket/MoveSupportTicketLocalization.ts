import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { MoveSupportTicketENTranslation } from "./translations/MoveSupportTicketENTranslation";

export interface MoveSupportTicketStrings {
    readonly ticketNotFound: string;
    readonly ticketIsNotOpen: string;
    readonly selectChannelPrompt: string;
    readonly moveTicketFailed: string;
    readonly moveTicketSuccess: string;
}

/**
 * Localizations for the `moveSupportTicket` button command.
 */
export class MoveSupportTicketLocalization extends Localization<MoveSupportTicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<MoveSupportTicketStrings>
    > = {
        en: new MoveSupportTicketENTranslation(),
    };
}
