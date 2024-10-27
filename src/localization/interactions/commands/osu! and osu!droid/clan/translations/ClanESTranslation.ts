import { Translation } from "@localization/base/Translation";
import { ClanStrings } from "../ClanLocalization";

/**
 * The Spanish translation for the `clan` command.
 */
export class ClanESTranslation extends Translation<ClanStrings> {
    override readonly translations: ClanStrings = {
        notInMainGuild:
            "Lo siento, este comando no puede ser utilizado en este servidor.",
        selfIsNotInClan: "Lo siento, no estas en un clan!",
        selfIsAlreadyInClan: "Lo siento, ya estas en un clan!",
        userIsNotInClan: "Lo siento, el usuario no esta en un clan!",
        userIsAlreadyInClan:
            "Lo siento, el usuario ya se encuentra en un clan!",
        selfHasNoAdministrativePermission:
            "Lo siento, no tienes suficiente poder administrativo en el clan para realizar esta acción.",
        userIsAlreadyCoLeader: "Lo siento, este usuario ya es un co-lider!",
        userIsNotCoLeader: "Lo siento, este usuario no es un co-lider!",
        noActiveAuctions:
            "Lo siento, no hay ninguna subasta activa en este momento!",
        noAvailableClans: "Lo siento, no hay ningun clan!",
        userIsNotInExecutorClan: "Lo siento, el usuario no esta en tu clan!",
        selfInBattleCooldown:
            "Tu no puedes participar en una batalla de clanes por %s.",
        userInBattleCooldown:
            "El usuario no puede participar en una batalla de clanes por %s.",
        selfNotInBattleCooldown:
            "No te encuentras dentro del tiempo de espera para poder participar en un batalla de clan.",
        userNotInBattleCooldown:
            "El usuario no se encuentra dentro del tiempo de espera para participar en un batalla de clan,",
        selfInOldJoinCooldown:
            "No puedes volver a unirte a tu clan anterior por %s.",
        userInOldJoinCooldown:
            "El usuario no puede unirse a su clan anterior por %s.",
        selfNotInOldJoinCooldown:
            "No te encuentras dentro del tiempo de espera para poder unirte a tu clan anterior.",
        userNotInOldJoinCooldown:
            "El usuario no se encuentra dentro del tiempo de espera para poder unirse a su clan anterior.",
        selfInJoinCooldown: "No te puedes unir a un clan por %s.",
        userInJoinCooldown: "El usuario no se puede unir a un clan por %s.",
        selfNotInJoinCooldown:
            "No te encuentras dentro del tiempo de espera para poder unirte a un clan.",
        userNotInJoinCooldown:
            "El usuario no se encuentra dentro del tiempo de espera para poder unirse a un clan.",
        roleIconIsNotUnlocked:
            "Lo siento, tu clan aun no ha desbloqueado la habilidad de poder cambiar el icono del rol de clan!",
        roleColorIsNotUnlocked:
            "Lo siento, tu clan aun no ha desbloqueado la habilidad de poder cambiar el color del rol de clan!",
        cannotDownloadRoleIcon:
            "Lo siento, no puedo descargar el icono del rol!",
        invalidRoleIconURL:
            "Lo siento, la URL que ingresaste no es de una imagen!",
        roleIconFileSizeTooBig:
            "Lo siento, los iconos para el rol deben ser menor o iguales a 256kb!",
        invalidRoleIconSize:
            "Lo siento, los iconos para el rol deben ser de al menos 64x64 px y de proporciones 1:1!",
        clanPowerNotEnoughToBuyItem:
            "Lo siento, tu clan no tiene suficiente puntos de poder! Necesitas al menos %s!",
        shopItemIsUnlocked:
            "Lo siento, tu clan ha comprado este item en tienda anteriormente!",
        noSpecialClanShopEvent:
            "Lo siento, no hay ningun evento especial ahora! Por favor revisar luego.",
        invalidClanRoleHexCode:
            "Lo siento, eso no es un codigo hexadecimal valido!",
        clanRoleHexCodeIsRestricted:
            "Lo siento, no puedes colocar el color del rol del mismo color que el de Referee o Miembros de Staff.",
        clanDoesntHaveClanRole:
            "Lo siento, tu clan no tiene rol personalizado!",
        clanAlreadyHasClanRole:
            "Lo siento, tu clan ya tiene un rol personalizado!",
        clanAlreadyHasChannel: "Lo siento, tu clan ya tiene un canal de clan!",
        powerupGachaNoResult: "Desafortunadamente, no obtuviste nada!",
        powerupGachaWin: "Obtuviste un %s!",
        powerupActivateInMatchMode:
            "Lo siento, tu clan esta en un combate. Por ende, no puedes activar ningun poder!",
        powerupIsAlreadyActive:
            "Lo siento, tu clan ya tiene un poder activo de ese tipo!",
        clanDoesntHavePowerup:
            "Lo siento, tu clan no tiene ningun poder de ese tipo!",
        clanAuctionHasBeenBid:
            "Lo siento, tu clan ha pujado en esta subasta. Por ende, ya no lo puedes cancelar!",
        invalidClanAuctionAmount:
            "Hey, por favor ingresa un monto valido de poderes a subastar!",
        clanAuctionAmountOutOfBounds:
            "Hey, no tienes tal cantidad de poderes de ese tipo! Tu solo tienes %s!",
        invalidClanAuctionMinimumBid:
            "Hey, por favor ingresar un precio mínimo válido para que otros clanes pujen!",
        invalidClanAuctionDuration:
            "Lo siento, las subastas solo pueden durar entre un minuto y un dia!",
        invalidClanAuctionBidAmount:
            "Hey, por favor ingresar un monto válido de monedas Mahiru a pujar!",
        buyShopItemConfirmation:
            "Estas seguro de querer comprar un(a) %s por %s monedas Mahiru?",
        createClanConfirmation:
            "Estas seguro que quieres crear un clan llamado %s con %s monedas Mahiru?",
        leaveClanConfirmation: "Estas seguro que quieres dejar tu clan actual?",
        disbandClanConfirmation: "Estas seguro que quieres disolver el clan?",
        kickMemberConfirmation:
            "Estas seguro que quieres expulsar al usuario del clan?",
        removeIconConfirmation:
            "Estas seguro que quieres quitar el icono del clan?",
        removeBannerConfirmation:
            "Estas seguro que quieres quitar la portada del clan?",
        editDescriptionConfirmation:
            "Estas seguro que quieres editar la descripción del clan?",
        clearDescriptionConfirmation:
            "Estas seguro que quieres borrar la descripción del clan?",
        promoteMemberConfirmation:
            "Estas seguro que quieres promover a este usuario a co-lider?",
        demoteMemberConfirmation:
            "Estas seguro que quieres relegar a este usuario a Miembro?",
        acceptClanInvitationConfirmation:
            "%s, estas seguro que quieres unirte a este clan?",
        activatePowerupConfirmation:
            "Estas seguro que quieres activar el poder %s para tu clan?",
        clanAuctionCancelConfirmation:
            "Estas seguro que quieres cancelar esta subasta?",
        clanAuctionCreateConfirmation:
            "Estas seguro que quieres crear una nueva subasta?",
        clanAuctionBidConfirmation:
            "Estas seguro que quieres pujar por esta subasta?",
        clanPowerTransferConfirmation:
            "Estas seguro que quieres transferir %s puntos de poder del clan %s al clan %s?",
        clanNameIsTooLong:
            "Lo siento, el nombre de clan solo puede tener 25 caracteres de largo!",
        clanAuctionNameIsTooLong:
            "Lo siento, los nombres para las subastas solo pueden tener 20 caracteres de largo!",
        clanNameHasUnicode:
            "Lo siento, el nombre de clan no debe tener ningun caracter Unicode!",
        notEnoughCoins:
            "Lo siento, no tiene suficientes monedas Mahiru para %s! Tu necesitas %s monedas!",
        clanNameIsTaken:
            "Lo siento, ese nombre ya ha sido tomado por otro clan!",
        clanDoesntExist: "Lo siento, ese clan no existe!",
        auctionDoesntExist: "Lo siento, esa subasta no existe!",
        auctionNameIsTaken:
            "Lo siento, ese nombre para subasta ya ha sido tomado!",
        userToTransferFromNotInClan:
            "Hey, el usuario que quieres para transferir puntos de poder no esta en un clan!",
        userToTransferToNotInClan:
            "Hey, el usuario al que quieres transferir puntos de poder no esta en un clan!",
        clanToTransferFromNotInMatchMode:
            "Lo siento, el clan que quieres para transferir puntos no esta en combate!",
        clanToTransferToNotInMatchMode:
            "Lo siento, el clan al que quieres transferir puntos no esta en combate!",
        clanHasPowerupActive: "%s tiene un poder %s activo!",
        profileNotFound:
            "Lo siento, no puedo encontrar tu cuenta enlazada de osu!droid!",
        clanUpkeepInformation:
            "Tu costo de permanencia ronda alrededor de las %s monedas Mahiru, las cuales serán tomadas de tu cuenta en %s. El coste de permanencia semanal del clan es de %s monedas.",
        clanDescriptionTooLong:
            "Lo siento, la descripción del clan debe de tener menos de 2000 caracteres!",
        createClanSuccessful: "Clan %s creado correctamente.",
        leaveClanFailed: "Lo siento, no puedes abadonar el clan: %s.",
        leaveClanSuccessful: "Abandonaste el clan %s correctamente.",
        setClanMatchModeFailed:
            "Lo siento, no pude establecer el modo de combate para el clan: %s.",
        setClanMatchModeSuccess:
            "Modo de combate para el clan seleccionado correctamente.",
        disbandClanFailed: "Lo siento, no pude disolver el clan: %s.",
        disbandClanSuccessful: "Clan disuelto correctamente.",
        kickMemberFailed: "Lo siento, no pude expulsar al usuario: %s.",
        kickMemberSuccessful: "Usuario %s expulsado del clan correctamente.",
        setIconFailed: "Lo siento, no pude establecer el icono de clan: %s.",
        setIconSuccessful: "Icono de clan establecido correctamente.",
        setBannerFailed:
            "Lo siento, no pude establecer tu portada de clan: %s.",
        setBannerSuccessful: "Portada de clan establecida correctamente.",
        removeIconFailed: "Lo siento, no pude eliminar el icono de clan: %s.",
        removeIconSuccessful: "Icono de clan eliminado correctamente.",
        removeBannerFailed:
            "Lo siento, no pude eliminar la portada de clan: %s.",
        removeBannerSuccessful: "Portada de clan eliminado correctamente.",
        modifyClanPowerFailed:
            "Lo siento, no pude cambiar el poder de clan: %s.",
        modifyClanPowerSuccessful: "Poder de clan modificado correctamente.",
        editDescriptionFailed:
            "Lo siento, no pude establecer la descripción del clan: %s.",
        editDescriptionSuccessful:
            "Descripción del clan establecido correctamente.",
        clearDescriptionFailed:
            "Lo siento, no pude eliminar la descripción del clan: %s.",
        clearDescriptionSuccessful:
            "Descripción de clan eliminada correctamente.",
        buyShopItemFailed:
            "Lo siento, no pude comprarte este objeto de la tienda: %s.",
        buyShopItemSuccessful:
            "Objeto comprado correctamente por %s monedas Mahiru.",
        promoteMemberFailed: "Lo siento, no pude ascender a este usuario: %s.",
        promoteMemberSuccessful: "Usuario ascendido a co-lider correctamente.",
        demoteMemberFailed: "Lo siento, no pude relegar a este usuario: %s.",
        demoteMemberSuccessful: "Usuario relegado a miembro correctamente.",
        acceptClanInvitationFailed:
            "%s, no pude procesar tu invitación de clan: %s.",
        acceptClanInvitationSuccessful: "%s, se unio correctamente a %s.",
        activatePowerupFailed: "Lo siento, no pude activar el poder: %s.",
        activatePowerupSuccessful: "Poder activado correctamente.",
        clanAuctionCancelFailed: "Lo siento, no pude cancelar la subasta: %s.",
        clanAuctionCancelSuccessful: "Subasta cancelada correctamente.",
        clanAuctionCreateFailed: "Lo siento, no pude crear la subasta: %s.",
        clanAuctionCreateSuccessful: "Subasta creada correctamente.",
        clanAuctionBidFailed: "Lo siento, no pude procesar tu puja: %s.",
        clanAuctionBidSuccessful: "Puja realizada correctamente.",
        clanPowerTransferFailed:
            "Lo siento, no pude transferir los puntos de poder: %s.",
        clanPowerTransferSuccessful:
            "Successfully transferred %s power points from %s clan to %s clan. %s puntos de poder tranferidos de %s a %s.",
        changeRoleColorSuccessful:
            "Color del rol de clan cambiado correctamente.",
        changeRoleIconSuccessful:
            "Icono del rol de clan cambiado correctamente.",
        createClan: "crea un clan",
        clanChannel: "canal de clan",
        clanPowerup: "bonus de clan",
        clanRename: "renombrar clan",
        clanRole: "rol de clan",
        clanRoleColorUnlock: "desbloquear colores para rol de clan",
        clanRoleIconUnlock: "desbloquear icono para rol de clan",
        leadershipTransfer: "transferir lider",
        buyShopItem: "comprar un %s",
        bidToAuction: "pujar",
        auctionInfo: "Informacion de la subasta",
        auctionName: "Nombre",
        auctionAuctioneer: "Subastador",
        creationDate: "Fecha de Creación",
        expirationDate: "Fecha de Vencimiento",
        auctionItem: "Objeto subastado",
        auctionPowerup: "Poder",
        auctionAmount: "Cantidad",
        auctionMinimumBid: "Monto mínimo para puja",
        auctionBidders: "",
        auctionBidInfo: "Información de puja",
        activePowerups: "Poderes activos actualmente para %s",
        ownedPowerups: "Poderes obtenidos actualmente por %s",
        guidelineWebsite:
            "Por favor dirigete a esta página web para ver guias.",
        clanLeader: "Lider del clan",
        clanPower: "Poder",
        clanMemberCount: "Miembros",
        clanTotalUpkeepEstimation: "Total estimado de mantenimiento",
        clanName: "Nombre de clan",
        discordId: "Discord ID",
        clanMemberRole: "Rol",
        clanMemberRoleLeader: "Lider",
        clanMemberRoleCoLeader: "Co-Lider",
        clanMemberRoleMember: "Miembro",
        clanMemberUpkeepValue: "Monto de mantenimiento",
        announceModalTitle: "",
        announceModalMessageLabel: "",
        announceModalMessagePlaceholder: "",
    };
}
