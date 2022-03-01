import { Translation } from "@alice-localization/base/Translation";
import { SelectMenuCreatorStrings } from "../SelectMenuCreatorLocalization";

/**
 * The Korean translation for the `SelectMenuCreator` creator utility.
 */
export class SelectMenuCreatorKRTranslation extends Translation<SelectMenuCreatorStrings> {
    override readonly translations: SelectMenuCreatorStrings = {
        pleaseWait: "잠시 기다려주세요...",
        timedOut: "시간이 초과됐어요.",
    };
}
