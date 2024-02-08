import { Translation } from "@alice-localization/base/Translation";
import { SupportTicketGuideDosDontsStrings } from "../SupportTicketGuideDosDontsLocalization";
import { Config } from "@alice-core/Config";
import { userMention, channelMention } from "discord.js";

/**
 * The English translation for the `supportTicketGuideDosDonts` button command.
 */
export class SupportTicketGuideDosDontsENTranslation extends Translation<SupportTicketGuideDosDontsStrings> {
    override readonly translations: SupportTicketGuideDosDontsStrings = {
        embedTitle: "DOs and DON'Ts",
        createTicketDosHeader: "DOs when creating a ticket:",
        createTicketDos1:
            "Include as much details as you can. It will help staff members in assisting you.",
        createTicketDos2:
            "Provide screenshots when necessary. This can be done after creating a ticket.",
        createTicketDontsHeader: "DON'Ts when creating a ticket:",
        createTicketDonts1: `Including your private information. Apart from ${userMention(Config.botOwners[1])}, ${userMention(Config.botOwners[0])}, and ${userMention("210769870848000001")}, no one in the staff team has access to the private information of your osu!droid account (excluding your password). Some ticket presets will ask your private information such as email, but these information can only be seen by ${userMention(Config.botOwners[1])} and ${userMention("210769870848000001")}. Should you require private information to be submitted, please move to the Direct Messages of one of those people instead.`,
        createTicketDonts2: `Creating a ticket for game-related questions or bug reports. These matters should be posted in ${channelMention("1006369245577347082")} instead.`,
    };
}
