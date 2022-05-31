import { Translation } from "@alice-localization/base/Translation";
import { ClanAnnounceStrings } from "../ClanAnnounceLocalization";

/**
 * The Indonesian translation for the `clan-announce` modal command.
 */
export class ClanAnnounceIDTranslation extends Translation<ClanAnnounceStrings> {
    override readonly translations: ClanAnnounceStrings = {
        selfIsNotInClan: "",
        selfHasNoAdministrativePermission: "",
        announcementMessageConfirmation: "",
    };
}
