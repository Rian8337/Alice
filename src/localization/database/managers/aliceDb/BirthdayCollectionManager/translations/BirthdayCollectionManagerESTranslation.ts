import { Translation } from "@localization/base/Translation";
import { BirthdayCollectionManagerStrings } from "../BirthdayCollectionManagerLocalization";

export class BirthdayCollectionManagerESTranslation extends Translation<BirthdayCollectionManagerStrings> {
    override readonly translations: BirthdayCollectionManagerStrings = {
        birthdayIsSet: "cumpleaños ya se encuentra configurado",
        invalidDate: "fecha de cumpleaños inválida",
        invalidMonth: "mes de cumpleaños inválido",
        invalidTimezone: "zona horaria inválida",
    };
}
