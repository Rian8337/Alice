import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface UntimeoutStrings {
    readonly userCannotUntimeoutError: string;
    readonly untimeoutFailed: string;
    readonly untimeoutSuccessful: string;
}

/**
 * Localizations for the `untimeout` command.
 */
export class UntimeoutLocalization extends Localization<UntimeoutStrings> {
    protected override readonly translations: Readonly<
        Translation<UntimeoutStrings>
    > = {
        en: {
            userCannotUntimeoutError:
                "I'm sorry, you don't have the permission to untimeout the user.",
            untimeoutFailed: "I'm sorry, I cannot untimeout the user: `%s`.",
            untimeoutSuccessful: "Successfully untimeouted the user.",
        },
        kr: {
            userCannotUntimeoutError:
                "죄송해요, 당신은 유저의 타임아웃을 해제할 권한이 없어요.",
            untimeoutFailed:
                "죄송해요, 해당 유저의 타임아웃을 해제할 수 없었어요: %s.",
            untimeoutSuccessful:
                "성공적으로 해당 유저의 타임아웃을 해제했어요.",
        },
    };
}
