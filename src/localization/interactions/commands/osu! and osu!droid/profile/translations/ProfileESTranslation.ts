import { Translation } from "@alice-localization/base/Translation";
import { ProfileStrings } from "../ProfileLocalization";

/**
 * The Spanish translation for the `profile` command.
 */
export class ProfileESTranslation extends Translation<ProfileStrings> {
    override readonly translations: ProfileStrings = {
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
        selfProfileNotFound: "Lo siento, no puede encontrar tu perfil!",
        userProfileNotFound:
            "Lo siento, no puede encontrar el perfil de ese jugador!",
        viewingProfile: "Perfil de osu!droid de [%s](%s):",
        invalidRGBAformat: "Lo siento, ese es un formato RGBA inválido!",
        invalidHexCode: "Lo siento, es es un codigo HEX inválido!",
        changeInfoTextColorConfirmation:
            "%s, estas seguro de querer cambiar el color del texto de la descripción de tu perfil a %s?",
        changeInfoBackgroundColorConfirmation:
            "%s, estas seguro de querer cambiar el color del fondo de la descripción de tu perfil a %s?",
        changeInfoTextColorSuccess:
            "%s, cambiaste correctamente el color del texto de tu perfil a %s.",
        changeInfoBackgroundColorSuccess:
            "%s, cambiaste correctamente el color del fondo de tu perfil a %s.",
        coinsToBuyBackgroundNotEnough:
            "Lo siento, no tienes suficiente %smonedas Alice para realizar esta accion! Un fondo cuestsa %s`500` monedas. Actualmente tu tienes %s%s monedas Alice.",
        buyBackgroundConfirmation:
            "%s, tu no tienes este fondo aún! Estas seguro que quieres comprar este fondo por %s`500` monedas Alice y cambiar el fondo de tu perfil con esa imagen?",
        switchBackgroundConfirmation:
            "%s, estas seguro que quieres cambiar el fondo de tu perfil?",
        switchBackgroundSuccess:
            "%s, se cambió tu fondo de perfil correctamente a %s.",
        aliceCoinAmount: "Ahora tienes %s%s monedas Alice.",
        userDoesntOwnAnyBadge: "Lo siento, tu no tienes ninguna medalla!",
        badgeIsAlreadyClaimed: "Lo siento, tu ya cuentas con esa medalla!",
        equipBadgeSuccess:
            "%s, la medalla %s fue equipada correctamente en el lugar %s.",
        unequipBadgeSuccess:
            "%s, la medalla %s fue retirada correctamente del lugar %s.",
        badgeUnclaimable: "Lo siento, esta medalla no puede ser reclamada!",
        beatmapToClaimBadgeNotValid:
            "Hey, por favor ingresa un link o ID válido del mapa!",
        beatmapToClaimBadgeNotFound:
            "Lo siento, no puedo encontrar el mapa que estas especificando!",
        beatmapToClaimBadgeNotRankedOrApproved:
            "Lo siento, solo mapas clasificados o aprobados son válidos!",
        userDoesntHaveScoreinBeatmap:
            "Lo siento, no tienes ningún puntaje en el mapa!",
        userCannotClaimBadge:
            "Lo siento, no cumples con los requisitos para poder obtener la medalla!",
        claimBadgeSuccess: "%s, reclamaste correctamente la medalla %s.",
        userNotBindedToAccount: "",
        playerCredentialsNotFound: "",
        chooseBackground: "Elige el fondo que deseas usar.",
        changeInfoBoxBackgroundColorTitle:
            "Cambiar el color del fondo de la zona de Información.",
        enterColor: "Ingresa el color que desear usar.",
        supportedColorFormat:
            "Puedes usar formato RGBA (Ejemplo: 255,0,0,1) o codigo hexadecimal (Ejemplo: #00BBFF)",
        changeInfoBoxTextColorTitle:
            "Cambiar el color del texto de la zona de Información.",
        chooseClaimBadge: "Elige la medalla que quisieras reclamar.",
        claimBadge: "Reclamar medalla para el perfil",
        enterBeatmap:
            "Ingresa el link o ID del mapa que sea de al menos %s★ en PC y tengas un FC.",
        enterBeatmapRestriction:
            "El mapa debe ser un mapa calificado o aprobado.",
        chooseEquipBadge: "Elige la medalla que quisieras equipar.",
        chooseBadgeSlot:
            "Elige el numero del lugar en el que quisieras colocar la medalla.",
        owned: "Obtenido",
        droidPpBadgeDescription: "Otorgado al alcanzar %s droid pp",
        totalScoreBadgeDescription: "Otorgado al tener %s de score total",
        rankedScoreBadgeDescription: "Otorgado al tener %s de score rankeable",
        beatmapFcBadgeDescription:
            "Otorgado al tener un FC en un mapa calificado/aprobado de %s★ estrellas.",
        tournamentBadgeDescription:
            "Otorgado al ganar la edición Numero %s del torneo de osu!droid en Discord.",
        unequipBadge:
            "Elige el número del lugar del que quieres retirar la medalla.",
        infoBoxTextColorInfo:
            "El codigo RGBA/Hex de color del texto de tu perfil es %s.",
        infoBoxBackgroundColorInfo:
            "El codigo RGBA/Hex de color del fondo de tu perfil es %s.",
        changeBackgroundLabel: "Cambiar Fondo",
        changeBackgroundDescription: "Cambiar fondo de tu perfil.",
        listBackgroundLabel: "Lista de Fondos",
        listBackgroundDescription:
            "Se muestran todos los fondos para el perfil, incluyendo los que tu ya tienes.",
        customizationPlaceholder: "Elige lo que quieres cambiar.",
        showBadgeTemplateLabel: "Mostrar medalla",
        showBadgeTemplateDescription: "Mostrar las medallas en el perfil.",
        claimBadgeLabel: "Reclamar Medalla",
        claimBadgeDescription: "Reclamar una medalla.",
        equipBadgeLabel: "Equipar Medalla",
        equipBadgeDescription: "Equipar una Medalla.",
        unequipBadgeLabel: "Retirar Medalla",
        unequipBadgeDescription: "Retirar una Medalla.",
        listBadgeLabel: "Lista de Medallas",
        listBadgeDescription:
            "Se muestran todas las medallas para perfil, incluyendo los que tu ya tienes.",
        viewBackgroundColorLabel: "Ver Color de Fondo",
        viewBackgroundColorDescription:
            "Ver color del fondo del apartado de información de tu perfil.",
        changeBackgroundColorLabel: "Cambiar Color de Fondo",
        changeBackgroundColorDescription:
            "Cambiar color del fondo del apartado de información de tu perfil.",
        viewTextColorLabel: "Ver Color del Texto.",
        viewTextColorDescription:
            "Ver color del texto del apartado de información de tu perfil.",
        changeTextColorLabel: "Cambiar Color del Texto.",
        changeTextColorDescription:
            "Cambiar color del texto del apartado de información de tu perfil.",
        playerBindInfo: "Información de %s (Click para ver perfil)",
        avatarLink: "Link del avatar",
        uid: "Uid",
        rank: "Ranking",
        playCount: "Jugadas",
        country: "Pais",
        bindInformation: "Información Enlazada",
        binded: "Enlazado a %s (ID del usuario: %s)",
        notBinded: "No enlazado",
        playerCredentialsInfo: "",
        username: "",
        password: "",
        doNotShareCredentialsWarning: "",
        changeCredentialsDirection: "",
    };
}
