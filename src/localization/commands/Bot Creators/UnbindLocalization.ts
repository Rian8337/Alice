import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface UnbindStrings {
    readonly invalidUid: string;
    readonly uidNotBinded: string;
    readonly unbindFailed: string;
    readonly unbindSuccessful: string;
}

/**
 * Localizations for the `unbind` command.
 */
export class UnbindLocalization extends Localization<UnbindStrings> {
    protected override readonly translations: Readonly<
        Translation<UnbindStrings>
    > = {
            en: {
                invalidUid: "Hey, please enter a valid uid!",
                uidNotBinded: "I'm sorry, the uid is not binded!",
                unbindFailed: "I'm sorry, I couldn't unbind the uid: %s.",
                unbindSuccessful: "Successfully unbinded uid %s.",
            },
        };
}
