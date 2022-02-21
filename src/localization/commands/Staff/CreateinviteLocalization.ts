import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

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
    protected override readonly translations: Readonly<Translation<CreateinviteStrings>> = {
        en: {
            expiryTimeInvalid: "Hey, please enter a valid time for invite link expiration!",
            maximumUsageInvalid: "Hey, please enter a valid maximum invite link usage!",
            inviteLinkCreated: "Invite Link Created",
            createdInChannel: "Created in %s",
            maxUsage: "Maximum Usage",
            infinite: "Infinite",
            expirationTime: "Expiration Time",
            never: "Never",
            reason: "Reason",
            inviteLink: "Invite Link",
            notSpecified: "Not specified."
        }
    };
}