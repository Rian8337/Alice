import { Translation } from "@localization/base/Translation";
import { RecalcStrings } from "../RecalcLocalization";

/**
 * The Spanish translation for the `recalc` command.
 */
export class RecalcESTranslation extends Translation<RecalcStrings> {
    override readonly translations: RecalcStrings = {
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
        reworkNameMissing: "",
        reworkTypeNotCurrent: "",
        reworkTypeDoesntExist: "",
        userIsDPPBanned:
            "Lo siento, este usuario esta baneado en el sistema de dpp!",
        userHasRequestedRecalc:
            "Lo siento, este usuario ya ha solicitado anteriormente un recuento en su perfil!",
        userQueued:
            "%s añadido correctamente a la cola para realizarle un recuento.",
        fullRecalcInProgress: "Recuento iniciado correctamente.",
        fullRecalcTrackProgress: "Recalculando jugadores (%s/%s (%s%))...",
        fullRecalcSuccess: "%s, el recuento ha finalizado!",
    };
}
