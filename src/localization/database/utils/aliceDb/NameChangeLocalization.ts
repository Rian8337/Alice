import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface NameChangeStrings {
    readonly requestNotActive: string;
    readonly playerNotFound: string;
    readonly droidServerRequestFailed: string;
    readonly newUsernameTaken: string;
    readonly requestDetails: string;
    readonly currentUsername: string;
    readonly requestedUsername: string;
    readonly creationDate: string;
    readonly status: string;
    readonly accepted: string;
    readonly acceptedNotification: string;
    readonly denied: string;
    readonly reason: string;
    readonly deniedNotification: string;
}

/**
 * Localizations for the `NameChange` database utility.
 */
export class NameChangeLocalization extends Localization<NameChangeStrings> {
    protected override readonly translations: Readonly<Translation<NameChangeStrings>> = {
        en: {
            requestNotActive: "name change request is not active",
            playerNotFound: "Cannot find player profile",
            droidServerRequestFailed: "cannot create request to osu!droid server",
            newUsernameTaken: "New username taken",
            requestDetails: "Request Details",
            currentUsername: "Current Username",
            requestedUsername: "Requested Username",
            creationDate: "Creation Date",
            status: "Status",
            accepted: "Accepted",
            acceptedNotification: "Hey, I would like to inform you that your name change request was accepted. You will be able to change your username again in %s.",
            denied: "Denied",
            reason: "Reason",
            deniedNotification: "Hey, I would like to inform you that your name change request was denied due to `%s`. You are not subjected to the 30-day cooldown yet, so feel free to submit another request. Sorry in advance!",
        }
    };
}