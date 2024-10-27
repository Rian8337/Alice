import { Translation } from "@localization/base/Translation";
import { AskcountStrings } from "../AskcountLocalization";

/**
 * The Indonesian translation for the `askcount` command.
 */
export class AskcountIDTranslation extends Translation<AskcountStrings> {
    override readonly translations: AskcountStrings = {
        haveNotAsked: "Maaf, sepertinya kamu belum pernah bertanya ke aku!",
        askCount: "Kamu telah bertanya kepadaku sebanyak %s kali.",
    };
}
