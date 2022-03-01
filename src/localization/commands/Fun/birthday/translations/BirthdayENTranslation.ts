import { Translation } from "@alice-localization/base/Translation";
import { BirthdayStrings } from "../BirthdayLocalization";

/**
 * The English translation for the `birthday` command.
 */
export class BirthdayENTranslation extends Translation<BirthdayStrings> {
    override readonly translations: BirthdayStrings = {
        selfBirthdayNotExist: "I'm sorry, you don't have a birthday!",
        userBirthdayNotExist: "I'm sorry, the user doesn't have a birthday!",
        setBirthdayFailed: "I'm sorry, I'm unable to set birthday: %s.",
        setBirthdaySuccess: "Successfully set birthday to %s/%s at UTC%s.",
        birthdayInfo: "Birthday Info for %s",
        date: "Date",
        timezone: "Timezone",
    };
}
