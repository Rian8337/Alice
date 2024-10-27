import { Translation } from "@localization/base/Translation";
import { ReportStrings } from "../ReportLocalization";

/**
 * The Spanish translation for the `report` command.
 */
export class ReportESTranslation extends Translation<ReportStrings> {
    override readonly translations: ReportStrings = {
        userToReportNotFound:
            "Hey, por favor ingresa un usuario válido para reportar!",
        userNotReportable: "Lo siento, no puedes reportar a este usuario.",
        selfReportError: "Hey, no te puedes reportar a ti mismo!",
        reporterDmLocked:
            "%s, tu bandeja de mensajes esta bloqueada, por ende no podras recibir el resumen de tu reporte!",
        offender: "Infractor",
        channel: "Canal",
        reason: "Razón",
        reportSummary: "Detalles del reporte",
        saveEvidence: "Recuerda guardar la evidencia en caso sea necesario.",
    };
}
