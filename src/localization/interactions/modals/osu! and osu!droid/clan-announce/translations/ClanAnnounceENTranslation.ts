import { Translation } from "@localization/base/Translation";
import { ClanAnnounceStrings } from "../ClanAnnounceLocalization";

/**
 * The English translation for the `clan-announce` modal command.
 */
export class ClanAnnounceENTranslation extends Translation<ClanAnnounceStrings> {
    override readonly translations: ClanAnnounceStrings = {
        selfIsNotInClan: "I'm sorry, you are not in a clan!",
        selfHasNoAdministrativePermission:
            "I'm sorry, you do not have enough administrative privileges in the clan to perform this action.",
        announcementMessageConfirmation:
            "Are you sure you want to send an announcement for your clan?",
    };
}
