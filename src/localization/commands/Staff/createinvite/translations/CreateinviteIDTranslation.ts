import { Translation } from "@alice-localization/base/Translation";
import { CreateinviteStrings } from "../CreateinviteLocalization";

/**
 * The Indonesian translation for the `createinvite` command.
 */
export class CreateinviteIDTranslation extends Translation<CreateinviteStrings> {
    override readonly translations: CreateinviteStrings = {
        expiryTimeInvalid: "",
        maximumUsageInvalid: "",
        inviteLinkCreated: "",
        createdInChannel: "",
        maxUsage: "",
        infinite: "",
        expirationTime: "",
        never: "",
        reason: "",
        inviteLink: "",
        notSpecified: "",
    };
}
