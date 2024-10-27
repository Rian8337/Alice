import { Translation } from "@localization/base/Translation";
import { userMention } from "discord.js";
import { HelpStrings } from "../HelpLocalization";

/**
 * The Spanish translation for the `help` command.
 */
export class HelpESTranslation extends Translation<HelpStrings> {
    override readonly translations: HelpStrings = {
        noCommandFound: "Lo siento, no puedo encontrar el comando!",
        aliceHelp: "Ayuda de Alice Synthesis Thirty ",
        creator: `Creado por ${userMention(
            "132783516176875520",
        )} y ${userMention("386742340968120321")}.`,
        useHelpCommand:
            "Para información detallada sobre un comando, use `/help [nombre del comando]`.",
        issuesContact:
            "Si encuentras algun bug o problema con el bot, por favor contactar con los creadores del bot.",
        category: "Categoria",
        requiredPermissions: "Permisos requeridos",
        examples: "Ejemplos",
        usage: "Uso",
        required: "Requerido",
        optional: "Opcional",
        details: "Detalles",
        none: "Nada",
    };
}
