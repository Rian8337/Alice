import { Translation } from "@alice-localization/base/Translation";
import { NamechangeStrings } from "../NamechangeLocalization";

/**
 * The Indonesian translation for the `namechange` command.
 */
export class NamechangeIDTranslation extends Translation<NamechangeStrings> {
    override readonly translations: NamechangeStrings = {
        noActiveRequest: "",
        invalidUid: "",
        uidHasNoActiveRequest: "",
        userHasNoActiveRequest: "",
        newNameAlreadyTaken: "",
        activeRequestExists: "",
        requestCooldownNotExpired: "",
        currentBindedAccountDoesntExist: "",
        newUsernameContainsUnicode: "",
        newUsernameTooLong: "",
        emailNotEqualToBindedAccount: "",
        requestSuccess: "",
        userHasNoHistory: "",
        acceptFailed: "",
        acceptSuccess: "",
        cancelFailed: "",
        cancelSuccess: "",
        denyFailed: "",
        denySuccess: "",
        nameHistoryForUid: "",
        nameHistory: "",
        nameChangeRequestList: "",
        discordAccount: "",
        usernameRequested: "",
        creationDate: "",
    };
}
