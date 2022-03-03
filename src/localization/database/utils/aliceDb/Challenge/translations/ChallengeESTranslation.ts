import { Translation } from "@alice-localization/base/Translation";
import { ChallengeStrings } from "../ChallengeLocalization";

/**
 * The Spanish translation for the `Challenge` database utility.
 */
export class ChallengeESTranslation extends Translation<ChallengeStrings> {
    override readonly translations: ChallengeStrings = {
        challengeNotFound: "Desafio no agendado",
        challengeOngoing: "El desafio esta en curso",
        challengeNotOngoing: "El desafio no esta en curso",
        challengeNotExpired: "No es momento de finalizar el desafio aun",
        challengeEndSuccess: "Desafio `%s` finalizado correctamente.",
        firstPlace:
            "Felicitaciones a %s por conseguir el primer lugar en el desafio %s, ganando %s puntos y %s%s monedas Alice!",
        constrainNotFulfilled: "Restricciones no cumplidas",
        eznfhtUsage: "uso de EZ, NF o HT",
        replayNotFound: "Repetición no encontrada",
        customARSpeedMulUsage: "Multiplicador de velocidad y/o AR es usado",
        beatmapNotFound: "Mapa no encontrado",
        passReqNotFulfilled: "Requisitos para completarlo no cumplidos",
        cannotParseReplay: "no se pudo analizar repetición",
        level: "Nivel",
        scoreV1: "ScoreV1",
        accuracy: "Precisión",
        scoreV2: "ScoreV2",
        missCount: "Misses",
        combo: "Combo",
        rank: "Rank",
        mods: "Mods",
        droidPP: "Droid PP",
        pcPP: "PC PP",
        min300: "300 minimos",
        max100: "100 maximos",
        max50: "50 maximos",
        maxUR: "UR maximo",
        scoreV1Description: "Score V1 de al menos %s",
        accuracyDescription: "Precisión de al menos %s",
        scoreV2Description: "Score V2 de al menos %s",
        noMisses: "Sin misses",
        missCountDescription: "Cantidad de misses menos de %s",
        modsDescription: "Uso de %s mods unicamente",
        comboDescription: "Combo de al menos %s",
        rankDescription: "%s rank o más",
        droidPPDescription: "%s dpp o más",
        pcPPDescription: "%s pp o más",
        min300Description: "300s de al menos %s",
        max100Description: "100s totales menor o igual a%s",
        max50Description: "50s totales menor o igual a %s",
        maxURDescription: "UR (unstable rate) menor o igual a %s",
    };
}
