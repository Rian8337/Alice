import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface BirthdayStrings {
    readonly selfBirthdayNotExist: string;
    readonly userBirthdayNotExist: string;
    readonly setBirthdayFailed: string;
    readonly setBirthdaySuccess: string;
}

/**
 * Localizations for the `birthday` command.
 */
export class BirthdayLocalization extends Localization<BirthdayStrings> {
    protected override readonly translations: Readonly<
        Translation<BirthdayStrings>
    > = {
            en: {
                selfBirthdayNotExist: "I'm sorry, you don't have a birthday!",
                userBirthdayNotExist:
                    "I'm sorry, the user doesn't have a birthday!",
                setBirthdayFailed: "I'm sorry, I'm unable to set birthday: %s.",
                setBirthdaySuccess: "Successfully set birthday to %s/%s at UTC%s.",
            },
        };
}
