import { Translation } from "@alice-localization/base/Translation";
import { MathquizStrings } from "../MathquizLocalization";

/**
 * The Spanish translation for the `mathquiz` command.
 */
export class MathquizESTranslation extends Translation<MathquizStrings> {
    override readonly translations: MathquizStrings = {
        userStillHasActiveGame:
            "Hey! Aun tienes una ecuación que resolver! Por favor resuelve esa primero antes de crear otra.",
        equationGeneratorError:
            "Lo siento, el generador de ecuaciones tuvo problemas generando la ecuación. Por favor, intente nuevamente.",
        equationQuestion:
            "%s, aqui esta tu ecuación:\n`Contador de operadores %s, nivel %s`\n```fix\n%s = ...```Tienes 30 segundos para resolverlo.",
        correctAnswer:
            "%s, tu respuesta es correcta! Te tomó %s segundos!\n```fix\n%s = %s```",
        wrongAnswer:
            "%s, se acabo el tiempo! La respuesta correcta es:\n```fix\n%s = %s```",
        operatorCount: "Contador de operadores",
        level: "Nivel",
    };
}
