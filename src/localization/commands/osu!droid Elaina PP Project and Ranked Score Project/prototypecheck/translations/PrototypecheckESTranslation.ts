import { Translation } from "@alice-localization/base/Translation";
import { PrototypecheckStrings } from "../PrototypecheckLocalization";

/**
 * The Spanish translation for the `prototypecheck` command.
 */
export class PrototypecheckESTranslation extends Translation<PrototypecheckStrings> {
    override readonly translations: PrototypecheckStrings = {
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
        selfInfoNotAvailable:
            "Lo siento, tu información de prueba del dpp no está disponible!",
        userInfoNotAvailable:
            "Lo siento, la información de prueba del dpp de ese usuario no está disponible!",
        ppProfileTitle: "Perfil de PP de %s",
        totalPP: "PP total",
        prevTotalPP: "PP total anterior",
        diff: "Diferencia",
        ppProfile: "Perfil de Rendimiento (PP)",
        lastUpdate: "Ultima actualización",
    };
}
