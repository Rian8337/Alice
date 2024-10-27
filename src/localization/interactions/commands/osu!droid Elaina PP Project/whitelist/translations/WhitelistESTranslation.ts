import { Translation } from "@localization/base/Translation";
import { WhitelistStrings } from "../WhitelistLocalization";

/**
 * The Spanish translation for the `whitelist` command.
 */
export class WhitelistESTranslation extends Translation<WhitelistStrings> {
    override readonly translations: WhitelistStrings = {
        noBeatmapProvided: "Hey, por favor ingresa un link o ID del mapa!",
        noBeatmapIDorSetIDFound:
            "Lo siento, no puedo encontrar ningun mapa o dificultad!",
        noBeatmapsFound:
            "Lo siento, no puedo encontrar ningun mapa con el ID o link brindado!",
        whitelistSuccess: "%s aprobado correctamente.",
        whitelistFailed: "Lo siento, no puedo aprobar %s: %s.",
        unwhitelistSuccess: "`%s` prohibido correctamente.",
        unwhitelistFailed: "Lo siento, no puedo prohibir `%s`: `%s`.",
        noCachedBeatmapFound:
            "Lo siento, no se ha mencionado ningún mapa en este canal! Por favor ingresa algun link o ID!",
        beatmapNotFound:
            "Lo siento, no puedo encontrar ese map en el listado de mapas de osu!",
        beatmapDoesntNeedWhitelist: "Hey, este mapa no necesita ser aprobado!",
        whitelistStatus: "%s esta %s.",
        whitelistedAndUpdated: "aprobado y actualizado",
        whitelistedNotUpdated: "aprobado, pero sin actualizar",
        notWhitelisted: "sin aprobar",
        starRating: "Estrellas",
        filteringBeatmaps: "",
        filterOptionsTitle: "",
        filterOptionsDescription: "",
        sortingOptionsTitle: "",
        sortingOptionsDescription: "",
        equalitySymbolsTitle: "",
        equalitySymbolsDescription: "",
        behaviorTitle: "",
        behaviorDescription: "",
        examplesTitle: "",
        examplesDescription1: "",
        examplesDescription2: "",
        examplesDescription3: "",
        examplesDescription4: "",
        beatmapsFound: "Mapas encontrados",
        beatmapLink: "",
        download: "Descarga",
        dateWhitelisted: "",
    };
}
