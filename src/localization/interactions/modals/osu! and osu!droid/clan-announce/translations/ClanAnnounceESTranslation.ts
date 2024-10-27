import { Translation } from "@localization/base/Translation";
import { ClanAnnounceStrings } from "../ClanAnnounceLocalization";

/**
 * The Spanish translation for the `clan-announce` modal command.
 */
export class ClanAnnounceESTranslation extends Translation<ClanAnnounceStrings> {
    override readonly translations: ClanAnnounceStrings = {
        selfIsNotInClan: "Lo siento, no estas en un clan!",
        selfHasNoAdministrativePermission:
            "Lo siento, no tienes suficiente poder administrativo en el clan para realizar esta acción.",
        announcementMessageConfirmation:
            "Estas seguro que quieres enviar un anuncio a tu clan?",
    };
}
