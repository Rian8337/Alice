import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface LoungeLockManagerStrings {
    readonly userNotLocked: string;
}

/**
 * Localizations for the `LoungeLockManager` manager utility.
 */
export class LoungeLockManagerLocalization extends Localization<LoungeLockManagerStrings> {
    protected override readonly translations: Readonly<
        Translation<LoungeLockManagerStrings>
    > = {
        en: {
            userNotLocked: "User is not locked from lounge",
        },
    };
}
