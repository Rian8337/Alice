import { Translation } from "@localization/base/Translation";
import { BirthdayTrackingStrings } from "../BirthdayTrackingLocalization";

/**
 * The Spanish translation for the `birthdayTracking` event utility in `ready` event.
 */
export class BirthdayTrackingESTranslation extends Translation<BirthdayTrackingStrings> {
    override readonly translations: BirthdayTrackingStrings = {
        happyBirthday:
            "Hey, me gustaría desearte un Feliz Cumpleaños! Espero que tengas un maravilloso día junto a tu familia, amigos y personas queridas. Por favor, acepta este regalo de `1,000` monedas Mahiru y un rol temporal en el servidor de Discord de parte mia.",
    };
}
