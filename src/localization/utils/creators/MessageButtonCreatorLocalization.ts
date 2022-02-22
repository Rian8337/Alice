import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MessageButtonCreatorStrings {
    readonly pleaseWait: string;
    readonly actionCancelled: string;
    readonly timedOut: string;
}

/**
 * Localizations for the `MessageButtonCreator` creator utility.
 */
export class MessageButtonCreatorLocalization extends Localization<MessageButtonCreatorStrings> {
    protected override readonly translations: Readonly<
        Translation<MessageButtonCreatorStrings>
    > = {
        en: {
            pleaseWait: "Please wait...",
            actionCancelled: "Action cancelled.",
            timedOut: "Timed out.",
        },
        kr: {
            pleaseWait: "잠시 기다려주세요...",
            actionCancelled: "행동이 취소됐어요.",
            timedOut: "시간이 초과됐어요.",
        },
    };
}
