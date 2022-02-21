import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface UserbindStrings {
    readonly profileNotFound: string;
    readonly verificationMapNotFound: string;
    readonly newAccountBindNotInMainServer: string;
    readonly newAccountBindNotVerified: string;
    readonly newAccountUidBindConfirmation: string;
    readonly newAccountUsernameBindConfirmation: string;
    readonly newAccountUidBindSuccessful: string;
    readonly newAccountUsernameBindSuccessful: string;
    readonly accountUidBindError: string;
    readonly accountUsernameBindError: string;
    readonly accountHasBeenBindedError: string;
    readonly oldAccountUidBindSuccessful: string;
    readonly oldAccountUsernameBindSuccessful: string;
    readonly verificationMapInformation: string;
}

/**
 * Localizations for the `userbind` command.
 */
export class UserbindLocalization extends Localization<UserbindStrings> {
    protected override readonly translations: Readonly<Translation<UserbindStrings>> = {
        en: {
            profileNotFound: "I'm sorry, I couldn't find that account's profile!",
            verificationMapNotFound: "I'm sorry, this account has not played the verification beatmap! Please use `/userbind verifymap` to get the verification beatmap.",
            newAccountBindNotInMainServer: "I'm sorry, new account binding must be done in the osu!droid International Discord server! This is required to keep bind moderation at ease.",
            newAccountBindNotVerified: "I'm sorry, you must be a verified member to use this command!",
            newAccountUidBindConfirmation: "Are you sure you want to bind your account to uid %s?",
            newAccountUsernameBindConfirmation: "Are you sure you want to bind your account to username %s?",
            newAccountUidBindSuccessful: "Successfully binded your account to uid %s. You can bind %s more osu!droid account(s).",
            newAccountUsernameBindSuccessful: "Successfully binded your account to username %s. You can bind %s more osu!droid account(s).",
            accountUidBindError: "I'm sorry, I couldn't bind your account to uid %s: %s.",
            accountUsernameBindError: "I'm sorry, I couldn't bind your account to username %s: %s.",
            accountHasBeenBindedError: "I'm sorry, that osu!droid account has been binded to another Discord account!",
            oldAccountUidBindSuccessful: "Successfully binded your account to uid %s.",
            oldAccountUsernameBindSuccessful: "Successfully binded your account to username %s.",
            verificationMapInformation: "Use this beatmap to verify that you are the owner of an osu!droid account. This is required if you want to bind it for the first time.",
        }
    };
}