import { Translation } from "@localization/base/Translation";
import { NameChangeStrings } from "../NameChangeLocalization";

/**
 * The English translation for the `NameChange` database utility.
 */
export class NameChangeENTranslation extends Translation<NameChangeStrings> {
    override readonly translations: NameChangeStrings = {
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
        acceptedNotification:
            "Hey, I would like to inform you that your name change request was accepted. You will be able to change your username again in %s.",
        denied: "Denied",
        reason: "Reason",
        deniedNotification:
            "Hey, I would like to inform you that your name change request was denied due to `%s`. You are not subjected to the 30-day cooldown yet, so feel free to submit another request. Sorry in advance!",
    };
}
