import { Translation } from "@localization/base/Translation";
import { CreateinviteStrings } from "../CreateinviteLocalization";

/**
 * The English translation for the `createinvite` command.
 */
export class CreateinviteENTranslation extends Translation<CreateinviteStrings> {
    override readonly translations: CreateinviteStrings = {
        expiryTimeInvalid:
            "Hey, please enter a valid time for invite link expiration!",
        maximumUsageInvalid:
            "Hey, please enter a valid maximum invite link usage!",
        inviteLinkCreated: "Invite Link Created",
        createdInChannel: "Created in",
        maxUsage: "Maximum Usage",
        infinite: "Infinite",
        expirationTime: "Expiration Time",
        never: "Never",
        reason: "Reason",
        inviteLink: "Invite Link",
        notSpecified: "Not specified.",
    };
}
