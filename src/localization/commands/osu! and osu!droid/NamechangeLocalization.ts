import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface NamechangeStrings {
    readonly noActiveRequest: string;
    readonly invalidUid: string;
    readonly uidHasNoActiveRequest: string;
    readonly userHasNoActiveRequest: string;
    readonly newNameAlreadyTaken: string;
    readonly activeRequestExists: string;
    readonly requestCooldownNotExpired: string;
    readonly currentBindedAccountDoesntExist: string;
    readonly newUsernameContainsUnicode: string;
    readonly newUsernameTooLong: string;
    readonly emailNotEqualToBindedAccount: string;
    readonly requestSuccess: string;
    readonly userHasNoHistory: string;
    readonly acceptFailed: string;
    readonly acceptSuccess: string;
    readonly cancelFailed: string;
    readonly cancelSuccess: string;
    readonly denyFailed: string;
    readonly denySuccess: string;
    readonly nameHistoryForUid: string;
    readonly nameHistory: string;
    readonly nameChangeRequestList: string;
    readonly discordAccount: string;
    readonly usernameRequested: string;
    readonly creationDate: string;
}

/**
 * Localizations for the `namechange` command.
 */
export class NamechangeLocalization extends Localization<NamechangeStrings> {
    protected override readonly translations: Readonly<
        Translation<NamechangeStrings>
    > = {
        en: {
            noActiveRequest:
                "I'm sorry, there is no active name change request now!",
            invalidUid: "Hey, please enter a valid uid!",
            uidHasNoActiveRequest:
                "I'm sorry, this user does not have an active name change request!",
            userHasNoActiveRequest:
                "I'm sorry, you do not have an active name change request!",
            newNameAlreadyTaken:
                "I'm sorry, the requested username has been taken!",
            activeRequestExists:
                "Hey, you currently have an active request! Please wait for that one to get reviewed before submitting another one!",
            requestCooldownNotExpired:
                "I'm sorry, you're still in cooldown! You will be able to send a name change request in `%s`.",
            currentBindedAccountDoesntExist:
                "I'm sorry, I cannot find your currently binded account in osu!droid server!",
            newUsernameContainsUnicode:
                "I'm sorry, usernames can only contain letters, numbers, and underscores!",
            newUsernameTooLong:
                "I'm sorry, a username must be at least 2 characters and doesn't exceed 20 characters!",
            emailNotEqualToBindedAccount:
                "I'm sorry, the email you have provided is not the same as the email registered to your binded osu!droid account!",
            requestSuccess:
                "Successfully requested name change. Please wait for it to get reviewed!\n\nRemember to not disable your Direct Messages or else you won't get notified of your name change request status!",
            userHasNoHistory:
                "I'm sorry, this player doesn't have any name change history!",
            acceptFailed:
                "I'm sorry, I couldn't accept the name change request: %s.",
            acceptSuccess: "Successfully accepted name change request.",
            cancelFailed:
                "I'm sorry, I couldn't cancel your name change request: %s.",
            cancelSuccess: "Successfully cancelled your name change request.",
            denyFailed:
                "I'm sorry, I couldn't deny the name change request: %s.",
            denySuccess: "Successfully denied name change request for `%s`.",
            nameHistoryForUid: "Name History for Uid %s",
            nameHistory: "Name History",
            nameChangeRequestList: "Name Change Request List",
            discordAccount: "Discord Account",
            usernameRequested: "Username Requested",
            creationDate: "Creation Date",
        },
    };
}
