import { Translation } from "@alice-localization/base/Translation";
import { BirthdayStrings } from "../BirthdayLocalization";

/**
 * The Spanish translation for the `birthday` command.
 */
export class BirthdayESTranslation extends Translation<BirthdayStrings> {
    override readonly translations: BirthdayStrings = {
        selfBirthdayNotExist: "Lo siento! No tienes un cumpleaños registrado.",
        userBirthdayNotExist:
            "Lo siento! El usuario no tiene un cumpleaños registrado.",
        setBirthdayFailed: "Lo siento, no pude registrar el cumpleaños: %s.",
        setBirthdaySuccess:
            "Cumpleaños registrado correctamente para %s/%s a las UTC%s.",
        birthdayInfo: "",
        date: "",
        timezone: "",
    };
}
