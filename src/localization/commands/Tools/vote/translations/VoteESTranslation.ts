import { Translation } from "@alice-localization/base/Translation";
import { VoteStrings } from "../VoteLocalization";

/**
 * The Spanish translation for the `vote` command.
 */
export class VoteESTranslation extends Translation<VoteStrings> {
    override readonly translations: VoteStrings = {
        ongoingVoteInChannel: "Lo siento, ya hay una votación en este canal!",
        noOngoingVoteInChannel:
            "Lo siento, no hay ninguna votación en este canal!",
        noEndVotePermission:
            "Lo siento, no puedes finalizar la votación en curso! Tu debes ser quien la creó o tener permisos para el manejo de canales para ello!",
        endVoteSuccess: "Votación finalizada!",
        voteChoiceIsSameAsBefore: "Lo siento, tu has votado por esa opción!",
        notVotedYet: "Lo siento, tu no has votado por ninguna opción!",
        invalidVoteChoice: "",
        voteRegistered: "%s, tu voto ha sido registrado!",
        voteCancelled: "%s, tu voto ha sido cancelado!",
        voteMoved: "%s, tu voto ha sido cambio de la opción %s a la opción %s!",
        tooFewChoices: "Lo siento, debes de ingresar como mínimo 2 opciones!",
        voteStartSuccess: "Votación iniciada correctamente.",
        invalidXpReq:
            "Hey, por favor ingresa una cantidad validad de Tatsu XP!",
        cannotRetrieveTatsuXP:
            "Lo siento, no puedo obtener información acerca de tu Tatsu XP!",
        tatsuXPTooSmall:
            "Lo siento, no tienes suficiente Tatsu XP para poder participar en esta votación!",
        topic: "Tema",
    };
}
