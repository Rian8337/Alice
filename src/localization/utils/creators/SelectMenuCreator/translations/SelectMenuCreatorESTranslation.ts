import { Translation } from "@localization/base/Translation";
import { SelectMenuCreatorStrings } from "../SelectMenuCreatorLocalization";

export class SelectMenuCreatorESTranslation extends Translation<SelectMenuCreatorStrings> {
    override readonly translations: SelectMenuCreatorStrings = {
        pleaseWait: "Por favor, espere...",
        timedOut: "Tiempo terminado.",
    };
}
