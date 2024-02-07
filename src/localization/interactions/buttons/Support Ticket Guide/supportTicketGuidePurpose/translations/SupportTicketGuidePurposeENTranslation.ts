import { Translation } from "@alice-localization/base/Translation";
import { SupportTicketGuidePurposeStrings } from "../SupportTicketGuidePurposeLocalization";
import { channelMention } from "discord.js";

/**
 * The English translation for the `supportTicketGuidePurpose` button command.
 */
export class SupportTicketGuidePurposeENTranslation extends Translation<SupportTicketGuidePurposeStrings> {
    override readonly translations: SupportTicketGuidePurposeStrings = {
        embedTitle: "Support Ticket Purpose",
        supportTicketMainPurpose:
            "Support tickets are a media to contact staff members directly without having to go through Direct Messages.",
        supportTicketConstraint: `support tickets are only intended for server-related matters (i.e., server offering questions, osu!droid account rebinding, dpp recalculation requests, etc.) If you have game-related matters, please create a post in ${channelMention("1006369245577347082")} instead.`,
    };
}
