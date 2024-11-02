import { Translation } from "@localization/base/Translation";
import { chatInputApplicationCommandMention } from "discord.js";
import { ConstantsStrings } from "../ConstantsLocalization";

/**
 * The Spanish translation for the `Constants` core class.
 */
export class ConstantsESTranslation extends Translation<ConstantsStrings> {
    override readonly translations: ConstantsStrings = {
        noPermissionToExecuteCommand:
            "Lo siento, no tienes permisos para usar este comando.",
        selfAccountNotBinded: `Lo siento, tu cuenta no esta enlazada. Para enlazar tu cuenta, usa ${chatInputApplicationCommandMention(
            "userbind",
            "username",
            "1302217968935108639",
        )} primero.`,
        commandNotAvailableInServer:
            "Lo siento, ese comando no esta disponible en este servidor.",
        commandNotAvailableInChannel:
            "Lo siento, este comando no esta disponible en este canal.",
        userAccountNotBinded: `Lo siento, esa cuenta no esta enlazada. El usuario necesito enlazar su cuenta usando ${chatInputApplicationCommandMention(
            "userbind",
            "username",
            "1302217968935108639",
        )} primero.`,
    };
}
