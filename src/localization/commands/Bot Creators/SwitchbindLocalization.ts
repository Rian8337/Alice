import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface SwitchbindStrings {
    readonly invalidUid: string;
    readonly uidNotBinded: string;
    readonly switchFailed: string;
    readonly switchSuccessful: string;
}

/**
 * Localizations for the `switchbind` command.
 */
export class SwitchbindLocalization extends Localization<SwitchbindStrings> {
    protected override readonly translations: Readonly<
        Translation<SwitchbindStrings>
    > = {
            en: {
                invalidUid: "Hey, please enter a valid uid!",
                uidNotBinded: "I'm sorry, this uid is not binded to anyone!",
                switchFailed: "I'm sorry, I'm unable to switch the bind: %s.",
                switchSuccessful: "Successfully switched bind.",
            },
        };
}
