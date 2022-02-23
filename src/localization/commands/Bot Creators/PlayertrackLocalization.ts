import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PlayertrackStrings {
    readonly incorrectUid: string;
    readonly nowTrackingUid: string;
    readonly noLongerTrackingUid: string;
}

/**
 * Localization for the `playertrack` command.
 */
export class PlayertrackLocalization extends Localization<PlayertrackStrings> {
    protected override readonly translations: Readonly<
        Translation<PlayertrackStrings>
    > = {
        en: {
            incorrectUid: "Hey, please enter a correct uid!",
            nowTrackingUid: "Now tracking uid %s.",
            noLongerTrackingUid: "No longer tracking uid %s.",
        },
        kr: {
            incorrectUid: "저기, 올바른 uid를 입력해 주세요!",
            nowTrackingUid: "이제부터 uid %s를 추적할게요.",
            noLongerTrackingUid: "더이상 uid %s를 추적하지 않을게요.",
        },
        id: {
            incorrectUid: "Hei, mohon berikan uid yang benar!",
            nowTrackingUid: "Sekarang melacak uid %s.",
            noLongerTrackingUid: "Tidak lagi melacak uid %s.",
        },
    };
}
