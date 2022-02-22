import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ClanStrings {
    readonly notInMainGuild: string;
    readonly announcementMessageTooLong: string;
    readonly selfIsNotInClan: string;
    readonly selfIsAlreadyInClan: string;
    readonly userIsNotInClan: string;
    readonly userIsAlreadyInClan: string;
    readonly selfHasNoAdministrativePermission: string;
    readonly userIsAlreadyCoLeader: string;
    readonly userIsNotCoLeader: string;
    readonly noActiveAuctions: string;
    readonly noAvailableClans: string;
    readonly userIsNotInExecutorClan: string;
    readonly selfInBattleCooldown: string;
    readonly userInBattleCooldown: string;
    readonly selfNotInBattleCooldown: string;
    readonly userNotInBattleCooldown: string;
    readonly selfInOldJoinCooldown: string;
    readonly userInOldJoinCooldown: string;
    readonly selfNotInOldJoinCooldown: string;
    readonly userNotInOldJoinCooldown: string;
    readonly selfInJoinCooldown: string;
    readonly userInJoinCooldown: string;
    readonly selfNotInJoinCooldown: string;
    readonly userNotInJoinCooldown: string;
    readonly roleIconIsNotUnlocked: string;
    readonly roleColorIsNotUnlocked: string;
    readonly cannotDownloadRoleIcon: string;
    readonly invalidRoleIconURL: string;
    readonly roleIconFileSizeTooBig: string;
    readonly invalidRoleIconSize: string;
    readonly clanPowerNotEnoughToBuyItem: string;
    readonly shopItemIsUnlocked: string;
    readonly noSpecialClanShopEvent: string;
    readonly invalidClanRoleHexCode: string;
    readonly clanRoleHexCodeIsRestricted: string;
    readonly clanDoesntHaveClanRole: string;
    readonly clanAlreadyHasClanRole: string;
    readonly clanAlreadyHasChannel: string;
    readonly powerupGachaNoResult: string;
    readonly powerupGachaWin: string;
    readonly powerupActivateInMatchMode: string;
    readonly powerupIsAlreadyActive: string;
    readonly clanDoesntHavePowerup: string;
    readonly clanAuctionHasBeenBid: string;
    readonly invalidClanAuctionAmount: string;
    readonly clanAuctionAmountOutOfBounds: string;
    readonly invalidClanAuctionMinimumBid: string;
    readonly invalidClanAuctionDuration: string;
    readonly invalidClanAuctionBidAmount: string;
    readonly buyShopItemConfirmation: string;
    readonly announcementMessageConfirmation: string;
    readonly createClanConfirmation: string;
    readonly leaveClanConfirmation: string;
    readonly disbandClanConfirmation: string;
    readonly kickMemberConfirmation: string;
    readonly removeIconConfirmation: string;
    readonly removeBannerConfirmation: string;
    readonly editDescriptionConfirmation: string;
    readonly clearDescriptionConfirmation: string;
    readonly promoteMemberConfirmation: string;
    readonly demoteMemberConfirmation: string;
    readonly acceptClanInvitationConfirmation: string;
    readonly activatePowerupConfirmation: string;
    readonly clanAuctionCancelConfirmation: string;
    readonly clanAuctionCreateConfirmation: string;
    readonly clanAuctionBidConfirmation: string;
    readonly clanPowerTransferConfirmation: string;
    readonly clanNameIsTooLong: string;
    readonly clanAuctionNameIsTooLong: string;
    readonly clanNameHasUnicode: string;
    readonly notEnoughCoins: string;
    readonly clanNameIsTaken: string;
    readonly clanDoesntExist: string;
    readonly auctionDoesntExist: string;
    readonly auctionNameIsTaken: string;
    readonly userToTransferFromNotInClan: string;
    readonly userToTransferToNotInClan: string;
    readonly clanToTransferFromNotInMatchMode: string;
    readonly clanToTransferToNotInMatchMode: string;
    readonly clanHasPowerupActive: string;
    readonly profileNotFound: string;
    readonly clanUpkeepInformation: string;
    readonly clanDescriptionTooLong: string;
    readonly createClanSuccessful: string;
    readonly leaveClanFailed: string;
    readonly leaveClanSuccessful: string;
    readonly setClanMatchModeFailed: string;
    readonly setClanMatchModeSuccess: string;
    readonly disbandClanFailed: string;
    readonly disbandClanSuccessful: string;
    readonly kickMemberFailed: string;
    readonly kickMemberSuccessful: string;
    readonly setIconFailed: string;
    readonly setIconSuccessful: string;
    readonly setBannerFailed: string;
    readonly setBannerSuccessful: string;
    readonly removeIconFailed: string;
    readonly removeIconSuccessful: string;
    readonly removeBannerFailed: string;
    readonly removeBannerSuccessful: string;
    readonly modifyClanPowerFailed: string;
    readonly modifyClanPowerSuccessful: string;
    readonly editDescriptionFailed: string;
    readonly editDescriptionSuccessful: string;
    readonly clearDescriptionFailed: string;
    readonly clearDescriptionSuccessful: string;
    readonly buyShopItemFailed: string;
    readonly buyShopItemSuccessful: string;
    readonly promoteMemberFailed: string;
    readonly promoteMemberSuccessful: string;
    readonly demoteMemberFailed: string;
    readonly demoteMemberSuccessful: string;
    readonly acceptClanInvitationFailed: string;
    readonly acceptClanInvitationSuccessful: string;
    readonly activatePowerupFailed: string;
    readonly activatePowerupSuccessful: string;
    readonly clanAuctionCancelFailed: string;
    readonly clanAuctionCancelSuccessful: string;
    readonly clanAuctionCreateFailed: string;
    readonly clanAuctionCreateSuccessful: string;
    readonly clanAuctionBidFailed: string;
    readonly clanAuctionBidSuccessful: string;
    readonly clanPowerTransferFailed: string;
    readonly clanPowerTransferSuccessful: string;
    readonly changeRoleColorSuccessful: string;
    readonly changeRoleIconSuccessful: string;
    readonly createClan: string;
    readonly clanChannel: string;
    readonly clanPowerup: string;
    readonly clanRename: string;
    readonly clanRole: string;
    readonly clanRoleColorUnlock: string;
    readonly clanRoleIconUnlock: string;
    readonly leadershipTransfer: string;
    readonly buyShopItem: string;
    readonly bidToAuction: string;
    readonly auctionInfo: string;
    readonly auctionName: string;
    readonly auctionAuctioneer: string;
    readonly creationDate: string;
    readonly expirationDate: string;
    readonly auctionItem: string;
    readonly auctionPowerup: string;
    readonly auctionAmount: string;
    readonly auctionMinimumBid: string;
    readonly auctionBidders: string; // look at 63.38 later
    readonly auctionBidInfo: string;
    readonly activePowerups: string;
    readonly ownedPowerups: string;
    readonly guidelineWebsite: string;
    readonly clanLeader: string;
    readonly clanPower: string;
    readonly clanMemberCount: string;
    readonly clanTotalUpkeepEstimation: string;
    readonly clanName: string;
    readonly discordId: string;
    readonly clanMemberRole: string;
    readonly clanMemberRoleLeader: string;
    readonly clanMemberRoleCoLeader: string;
    readonly clanMemberRoleMember: string;
    readonly clanMemberUpkeepValue: string;
}

/**
 * Localizations for the `clan` command.
 */
export class ClanLocalization extends Localization<ClanStrings> {
    protected override readonly translations: Readonly<
        Translation<ClanStrings>
    > = {
        en: {
            notInMainGuild:
                "I'm sorry, this command is not executable in this server.",
            announcementMessageTooLong:
                "I'm sorry, your announcement message is too long!",
            selfIsNotInClan: "I'm sorry, you are not in a clan!",
            selfIsAlreadyInClan: "I'm sorry, you are already in a clan!",
            userIsNotInClan: "I'm sorry, the user is not in a clan!",
            userIsAlreadyInClan: "I'm sorry, the user is already in a clan!",
            selfHasNoAdministrativePermission:
                "I'm sorry, you do not have enough administrative privileges in the clan to perform this action.",
            userIsAlreadyCoLeader:
                "I'm sorry, this user is already a co-leader!",
            userIsNotCoLeader: "I'm sorry, this user is not a co-leader!",
            noActiveAuctions:
                "I'm sorry, there are no ongoing auctions as of now!",
            noAvailableClans: "I'm sorry, there are no clans as of now!",
            userIsNotInExecutorClan: "I'm sorry, the user is not in your clan!",
            selfInBattleCooldown:
                "You cannot participate in a clan battle for %s.",
            userInBattleCooldown:
                "The user cannot participate in a clan battle for %s.",
            selfNotInBattleCooldown:
                "You are currently not in cooldown from participating a clan battle.",
            userNotInBattleCooldown:
                "The user is currently not in cooldown from participating a clan battle.",
            selfInOldJoinCooldown: "You cannot join your old clan for %s.",
            userInOldJoinCooldown:
                "The user cannot join their old clan for %s.",
            selfNotInOldJoinCooldown:
                "You are currently not in cooldown to join your old clan.",
            userNotInOldJoinCooldown:
                "The user is currently not in cooldown to join their old clan.",
            selfInJoinCooldown: "You cannot join a clan for %s.",
            userInJoinCooldown: "The user cannot join a clan for %s.",
            selfNotInJoinCooldown:
                "You are currently not in cooldown to join a clan.",
            userNotInJoinCooldown:
                "The user is currently not in cooldown to join a clan.",
            roleIconIsNotUnlocked:
                "I'm sorry, your clan has not unlocked the ability to change clan role icon!",
            roleColorIsNotUnlocked:
                "I'm sorry, your clan has not unlocked the ability to change clan role color!",
            cannotDownloadRoleIcon:
                "I'm sorry, I cannot download the role icon!",
            invalidRoleIconURL:
                "I'm sorry, the URL that you have entered doesn't direct to an image!",
            roleIconFileSizeTooBig:
                "I'm sorry, role icons must be less than or equal to 256 kB!",
            invalidRoleIconSize:
                "I'm sorry, role icons must be at least 64x64 pixels and has a 1:1 ratio!",
            clanPowerNotEnoughToBuyItem:
                "I'm sorry, your clan doesn't have enough power points! You need at least %s!",
            shopItemIsUnlocked:
                "I'm sorry, your clan has bought this shop item before!",
            noSpecialClanShopEvent:
                "I'm sorry, there is no ongoing special event now! Please check back soon!",
            invalidClanRoleHexCode:
                "I'm sorry, that doesn't look like a valid hex code color!",
            clanRoleHexCodeIsRestricted:
                "I'm sorry, you cannot change your role color into the same role color as referees and staff members!",
            clanDoesntHaveClanRole:
                "I'm sorry, your clan doesn't have a custom clan role!",
            clanAlreadyHasClanRole:
                "I'm sorry, your clan already has a custom clan role!",
            clanAlreadyHasChannel:
                "I'm sorry, your clan already has a clan channel!",
            powerupGachaNoResult: "Unfortunately, you didn't get anything!",
            powerupGachaWin: "You won a `%s` powerup!",
            powerupActivateInMatchMode:
                "I'm sorry, your clan is currently in match mode, therefore you cannot activate powerups!",
            powerupIsAlreadyActive:
                "I'm sorry, your clan already has a powerup active of that type!",
            clanDoesntHavePowerup:
                "I'm sorry, your clan doesn't have any powerup of that type!",
            clanAuctionHasBeenBid:
                "I'm sorry, a clan has bid for this auction, therefore you cannot cancel it!",
            invalidClanAuctionAmount:
                "Hey, please enter a valid amount of powerups to auction!",
            clanAuctionAmountOutOfBounds:
                "Hey, you don't have that many powerup of that type! You only have %s!",
            invalidClanAuctionMinimumBid:
                "Hey, please enter a valid minimum price for other clans to bid!",
            invalidClanAuctionDuration:
                "I'm sorry, auctions can only last between a minute and a day!",
            invalidClanAuctionBidAmount:
                "Hey, please enter a valid amount of Alice coins to bid!",
            buyShopItemConfirmation:
                "Are you sure you want to buy a %s for %s Alice coins?",
            announcementMessageConfirmation:
                "Are you sure you want to send an announcement for your clan?",
            createClanConfirmation:
                "Are you sure you want to create a clan named `%s` for %s Alice coins?",
            leaveClanConfirmation:
                "Are you sure you want to leave your current clan?",
            disbandClanConfirmation:
                "Are you sure you want to disband the clan?",
            kickMemberConfirmation:
                "Are you sure you want to kick the user out of the clan?",
            removeIconConfirmation:
                "Are you sure you want to remove the clan's icon?",
            removeBannerConfirmation:
                "Are you sure you want to remove the clan's icon?",
            editDescriptionConfirmation:
                "Are you sure you want to edit your clan's description?",
            clearDescriptionConfirmation:
                "Are you sure you want to clear the clan's description?",
            promoteMemberConfirmation:
                "Are you sure you want to promote this user to co-leader?",
            demoteMemberConfirmation:
                "Are you sure you want to demote this user to member?",
            acceptClanInvitationConfirmation:
                "%s, are you sure you want to join this clan?",
            activatePowerupConfirmation:
                "Are you sure you want to activate the `%s` powerup for your clan?",
            clanAuctionCancelConfirmation:
                "Are you sure you want to cancel this auction?",
            clanAuctionCreateConfirmation:
                "Are you sure you want to create a new auction?",
            clanAuctionBidConfirmation:
                "Are you sure you want to bid to this auction?",
            clanPowerTransferConfirmation:
                "Are you sure you want to transfer `%s` power points from `%s` clan to `%s` clan?",
            clanNameIsTooLong:
                "I'm sorry, clan names can only be 25 characters long!",
            clanAuctionNameIsTooLong:
                "I'm sorry, clan auction names can only be 20 characters long!",
            clanNameHasUnicode:
                "I'm sorry, clan name must not contain any unicode characters!",
            notEnoughCoins:
                "I'm sorry, you don't have enough Alice coins to %s! You need %s Alice coins!",
            clanNameIsTaken:
                "I'm sorry, that name is already taken by another clan!",
            clanDoesntExist: "I'm sorry, that clan doesn't exist!",
            auctionDoesntExist: "I'm sorry, that auction doesn't exist!",
            auctionNameIsTaken: "I'm sorry, that auction name has been taken!",
            userToTransferFromNotInClan:
                "Hey, the user to transfer power points from is not in a clan!",
            userToTransferToNotInClan:
                "Hey, the user to transfer power points to is not in a clan!",
            clanToTransferFromNotInMatchMode:
                "I'm sorry, the clan to transfer power points from is not in match mode!",
            clanToTransferToNotInMatchMode:
                "I'm sorry, the clan to transfer power points to is not in match mode!",
            clanHasPowerupActive: "%s has a `%s` powerup active!",
            profileNotFound:
                "I'm sorry, I cannot find your binded osu!droid account's profile!",
            clanUpkeepInformation:
                "Your upkeep cost is somewhere between %s Alice coins, which will be taken from you in %s. Your clan's estimated total weekly upkeep cost is %s Alice coins.",
            clanDescriptionTooLong:
                "I'm sorry, clan description must be less than 2000 characters!",
            createClanSuccessful: "Successfully created clan `%s`.",
            leaveClanFailed: "I'm sorry, you cannot leave the clan: %s.",
            leaveClanSuccessful: "Successfully left `%s` clan.",
            setClanMatchModeFailed:
                "I'm sorry, I couldn't set the clan's match mode: %s.",
            setClanMatchModeSuccess: "Successfully set the clan's match mode.",
            disbandClanFailed: "I'm sorry, I couldn't disband the clan: %s.",
            disbandClanSuccessful: "Successfully disbanded the clan.",
            kickMemberFailed: "I'm sorry, I couldn't kick the user: %s.",
            kickMemberSuccessful: "Successfully kicked %s from the clan.",
            setIconFailed: "I'm sorry, I couldn't set your clan's icon: %s.",
            setIconSuccessful: "Successfully set your clan's icon.",
            setBannerFailed:
                "I'm sorry, I couldn't set your clan's banner: %s.",
            setBannerSuccessful: "Successfully set your banner's icon.",
            removeIconFailed:
                "I'm sorry, I couldn't remove the clan's icon: %s.",
            removeIconSuccessful: "Successfully removed the clan's icon.",
            removeBannerFailed:
                "I'm sorry, I couldn't remove the clan's banner: %s.",
            removeBannerSuccessful: "Successfully removed the clan's banner.",
            modifyClanPowerFailed:
                "I'm sorry, I couldn't modify the clan's power: %s.",
            modifyClanPowerSuccessful:
                "Successfully modified the clan's power.",
            editDescriptionFailed:
                "I'm sorry, I couldn't set your clan's description: %s.",
            editDescriptionSuccessful:
                "Successfully set your clan's description.",
            clearDescriptionFailed:
                "I'm sorry, I couldn't clear the clan's description: %s.",
            clearDescriptionSuccessful:
                "Successfully cleared the clan's description.",
            buyShopItemFailed:
                "I'm sorry, I couldn't purchase this shop item for you: %s.",
            buyShopItemSuccessful:
                "Successfully bought this shop item for %s Alice coins.",
            promoteMemberFailed: "I'm sorry, I couldn't promote this user: %s.",
            promoteMemberSuccessful:
                "Successfully promoted the user to co-leader.",
            demoteMemberFailed: "I'm sorry, I couldn't demote this user: %s.",
            demoteMemberSuccessful: "Successfully demoted the user to member.",
            acceptClanInvitationFailed:
                "%s, I couldn't process your clan invitation: %s.",
            acceptClanInvitationSuccessful: "%s, successfully joined %s.",
            activatePowerupFailed:
                "I'm sorry, I couldn't activate the powerup: %s.",
            activatePowerupSuccessful: "Successfully activated powerup.",
            clanAuctionCancelFailed:
                "I'm sorry, I couldn't cancel the auction: %s.",
            clanAuctionCancelSuccessful: "Successfully canceled the auction.",
            clanAuctionCreateFailed:
                "I'm sorry, I couldn't create the auction: %s.",
            clanAuctionCreateSuccessful: "Successfully created the auction.",
            clanAuctionBidFailed: "I'm sorry, I couldn't process your bid: %s.",
            clanAuctionBidSuccessful: "Successfully bid to the auction.",
            clanPowerTransferFailed:
                "I'm sorry, I couldn't perform the power points transfer: %s.",
            clanPowerTransferSuccessful:
                "Successfully transferred `%s` power points from `%s` clan to `%s` clan.",
            changeRoleColorSuccessful:
                "Successfully changed your clan's role color.",
            changeRoleIconSuccessful:
                "Successfully changed your clan's role icon.",
            createClan: "create a clan",
            clanChannel: "clan channel",
            clanPowerup: "clan powerup",
            clanRename: "clan rename",
            clanRole: "clan role",
            clanRoleColorUnlock: "clan role color unlock ability",
            clanRoleIconUnlock: "clan role color unlock ability",
            leadershipTransfer: "transfer leadership",
            buyShopItem: "buy a %s",
            bidToAuction: "bid",
            auctionInfo: "Auction Information",
            auctionName: "Name",
            auctionAuctioneer: "Auctioneer",
            creationDate: "Creation Date",
            expirationDate: "Expiration Date",
            auctionItem: "Auction Item",
            auctionPowerup: "Powerup",
            auctionAmount: "Amount",
            auctionMinimumBid: "Minimum Bid Amount",
            auctionBidders: "Bidders",
            auctionBidInfo: "Bid Information",
            activePowerups: "Currently Active Powerups for",
            ownedPowerups: "Currently Owned Powerups by",
            guidelineWebsite: "Please go to the website for guidelines.",
            clanLeader: "Clan Leader",
            clanPower: "Power",
            clanMemberCount: "Members",
            clanTotalUpkeepEstimation: "Total Upkeep Estimation",
            clanName: "Clan Name",
            discordId: "Discord ID",
            clanMemberRole: "Role",
            clanMemberRoleLeader: "Leader",
            clanMemberRoleCoLeader: "Co-Leader",
            clanMemberRoleMember: "Member",
            clanMemberUpkeepValue: "Upkeep Value",
        },
        kr: {
            notInMainGuild:
                "죄송해요, 이 명령어는 이 서버에서 사용할 수 없어요.",
            announcementMessageTooLong: "죄송한데, 안내 메시지가 너무 길어요!",
            selfIsNotInClan: "죄송해요, 클랜에 속해있지 않으시네요!",
            selfIsAlreadyInClan: "죄송해요, 이미 클랜에 속해 있으시네요!",
            userIsNotInClan: "죄송해요, 이 유저는 클랜에 속해 있지 않아요!",
            userIsAlreadyInClan: "죄송해요, 이 유저는 이미 클랜에 속해 있어요!",
            selfHasNoAdministrativePermission:
                "죄송해요, 이 행동을 수행하기 위한 클랜에서의 권한이 부족해요.",
            userIsAlreadyCoLeader: "죄송해요, 이 유저는 이미 공동 리더에요!",
            userIsNotCoLeader: "죄송해요, 이 유저는 공동 리더가 아니에요!",
            noActiveAuctions: "죄송해요, 지금 진행중인 경매가 없어요!",
            noAvailableClans: "죄송해요, 지금은 클랜이 없네요!",
            userIsNotInExecutorClan:
                "죄송해요, 이 유저는 당신의 클랜에 속해있지 않아요!",
            selfInBattleCooldown:
                "당신은 다음 시간동안 클랜 배틀에 참가할 수 없어요: %s.",
            userInBattleCooldown:
                "이 유저는 다음 시간동안 클랜 배틀에 참가할 수 없어요: %s.",
            selfNotInBattleCooldown:
                "당신은 현재 클랜 배틀에 참가할 수 있어요.",
            userNotInBattleCooldown:
                "이 유저는 현재 클랜 배틀에 참가할 수 있어요.",
            selfInOldJoinCooldown:
                "당신은 다음 시간동안 이전에 있던 클랜에 가입할 수 없어요: %s.",
            userInOldJoinCooldown:
                "이 유저는 다음 시간동안 이전에 있던 클랜에 가입할 수 없어요: %s",
            selfNotInOldJoinCooldown:
                "당신은 현재 이전에 있던 클랜에 가입할 수 있어요.",
            userNotInOldJoinCooldown:
                "이 유저는 현재 이전에 있던 클랜에 가입할 수 있어요.",
            selfInJoinCooldown:
                "당신은 다음 시간동안 클랜에 가입할 수 없어요: %s.",
            userInJoinCooldown:
                "이 유저는 다음 시간동안 클랜에 가입할 수 없어요: %s.",
            selfNotInJoinCooldown: "당신은 현재 클랜에 가입할 수 있어요.",
            userNotInJoinCooldown: "이 유저는 현재 클랜에 가입할 수 있어요.",
            roleIconIsNotUnlocked:
                "죄송해요, 당신의 클랜은 아직 클랜 역할 아이콘을 바꿀 수 있는 능력을 개방하지 않았어요!",
            roleColorIsNotUnlocked:
                "죄송해요, 당신의 클랜은 아직 클랜 역할 색상을 바꿀 수 있는 능력을 개방하지 않았어요!",
            cannotDownloadRoleIcon:
                "죄송해요, 역할 아이콘을 다운받지 못하겠어요!",
            invalidRoleIconURL:
                "죄송해요, 당신이 입력한 URL은 이미지로 연결되지 않아요!",
            roleIconFileSizeTooBig:
                "죄송해요, 역할 아이콘의 크기는 256 kB이하여야 해요!",
            invalidRoleIconSize:
                "죄송해요, 역할 아이콘은 최소 64x64 픽셀과 1:1 비율을 가지고 있어야 해요!",
            clanPowerNotEnoughToBuyItem:
                "죄송해요, 당신 클랜의 파워 포인트가 충분하지 않아요! 최소 %s이 필요해요!",
            shopItemIsUnlocked:
                "죄송해요, 당신의 클랜은 이 상점 아이템을 이전에 샀어요!",
            noSpecialClanShopEvent:
                "죄송해요, 지금은 진행중인 특별 이벤트가 없어요! 다음에 확인해 주세요!",
            invalidClanRoleHexCode:
                "죄송해요, 그건 유효하지 않은 hex 코드값인 것 같네요!",
            clanRoleHexCodeIsRestricted:
                "죄송해요, 역할 색상을 심판(referee)이나 스태프 멤버와 같게 바꿀 순 없어요!",
            clanDoesntHaveClanRole:
                "죄송해요, 당신의 클랜은 커스텀 클랜 역할을 가지고 있지 않아요!",
            clanAlreadyHasClanRole:
                "죄송해요, 당신의 클랜은 커스텀 클랜 역할을 이미 가지고 있어요!",
            clanAlreadyHasChannel:
                "죄송해요, 당신의 클랜은 이미 클랜 채널을 가지고 있어요!",
            powerupGachaNoResult: "안타깝게도, 아무것도 얻지 못했어요..",
            powerupGachaWin: "%s 파워업을 획득했어요!",
            powerupActivateInMatchMode:
                "죄송해요, 당신의 클랜은 현재 매치 모드이기 때문에 파워업을 활성화 할 수 없어요!",
            powerupIsAlreadyActive:
                "죄송해요, 당신의 클랜은 이미 그 종류의 파워업을 발동했어요!",
            clanDoesntHavePowerup:
                "죄송해요, 당신의 클랜은 그 종류의 파워업을 가지고 있지 않아요!",
            clanAuctionHasBeenBid:
                "죄송해요, 한 클랜이 이 경매에 입찰했기 때문에 취소할 수 없어요!",
            invalidClanAuctionAmount:
                "저기, 경매에 올릴 파워업의 유효한 양을 입력해 주세요!",
            clanAuctionAmountOutOfBounds:
                "저기, 그 종류의 파워업을 그렇게 많이 가지고 있지 않으시네요! %s개만 가지고 있어요!",
            invalidClanAuctionMinimumBid:
                "저기, 유효한 최소 입찰 금액을 입력해 주세요!",
            invalidClanAuctionDuration:
                "죄송해요, 경매는 1분에서 하루까지만 지속할 수 있어요!",
            invalidClanAuctionBidAmount:
                "저기, 입찰에 지불할 유효한 앨리스 코인을 입력해 주세요!",
            buyShopItemConfirmation:
                "%s을 %s개의 앨리스 코인으로 구매하시려는게 확실한가요?",
            announcementMessageConfirmation:
                "클랜에 안내 메시지를 보내려는게 확실한가요?",
            createClanConfirmation:
                "%s라는 이름의 클랜을 %s 앨리스 코인으로 만드려는게 확실한가요?",
            leaveClanConfirmation: "현재 클랜을 떠나려는게 확실한가요?",
            disbandClanConfirmation: "정말 클랜을 해체하실 건가요?",
            kickMemberConfirmation: "정말 이 유저를 클랜에서 추방하실 건가요?",
            removeIconConfirmation: "정말 클랜 아이콘을 제거하실 건가요?",
            removeBannerConfirmation: "정말 클랜 배너를 제거하실 건가요?",
            editDescriptionConfirmation: "클랜 설명을 수정하려는게 확실한가요?",
            clearDescriptionConfirmation: "정말 클랜 설명을 제거하실 건가요?",
            promoteMemberConfirmation:
                "정말 이 유저를 공동 리더로 만드실 건가요?",
            demoteMemberConfirmation:
                "정말 이 유저를 일반 멤버로 강등시키실 건가요?",
            acceptClanInvitationConfirmation:
                "%s, 이 클랜에 가입하고 싶은게 확실한가요?",
            activatePowerupConfirmation:
                "정말 %s 파워업을 클랜에 활성화할 건가요?",
            clanAuctionCancelConfirmation: "정말 이 경매를 취소하실 건가요?",
            clanAuctionCreateConfirmation: "새 경매를 만드려는게 확실한가요?",
            clanAuctionBidConfirmation: "이 경매에 입찰하려는게 확실한가요",
            clanPowerTransferConfirmation:
                "%s 파워 포인트를 %s 클랜에서 %s 클랜으로 옮기려는게 확실한가요?",
            clanNameIsTooLong: "죄송해요, 클랜 이름은 25자까지만 가능해요!",
            clanAuctionNameIsTooLong:
                "죄송해요, 클랜 경매 명칭은 20자 까지만 가능해요!",
            clanNameHasUnicode:
                "죄송해요, 클랜 이름은 유니코드 문자를 포함하면 안돼요!",
            notEnoughCoins:
                "죄송해요, 다음 행동을 하기 위한 앨리스 코인이 부족해요: %s! %s 앨리스 코인이 필요해요!",
            clanNameIsTaken: "죄송해요, 그 이름은 이미 다른 클랜이 가져갔네요!",
            clanDoesntExist: "죄송해요, 그 클랜은 존재하지 않아요!",
            auctionDoesntExist: "죄송해요, 그 경매는 존재하지 않아요!",
            auctionNameIsTaken: "죄송해요, 이 경매 명칭은 이미 존재해요!",
            userToTransferFromNotInClan:
                "저기, 파워 포인트를 가져오려는 대상이 클랜에 존재하지 않아요!",
            userToTransferToNotInClan:
                "저기, 파워 포인트를 전달하려는 대상이 클랜에 존재하지 않아요!",
            clanToTransferFromNotInMatchMode:
                "죄송해요, 파워 포인트를 가져오려는 클랜이 매치 모드가 아니에요!",
            clanToTransferToNotInMatchMode:
                "죄송해요, 파워 포인트를 전달하려는 클랜이 매치 모드가 아니에요!",
            clanHasPowerupActive: "%s 클랜은 %s 파워업을 활성화 했어요!",
            profileNotFound:
                "죄송해요, 당신에게 바인딩된 osu!droid 계정의 프로필을 찾지 못했어요!",
            clanUpkeepInformation:
                "당신의 유지비는 대략 %s 앨리스 코인 정도이며, %s 후에 빠져나갈 예정이에요. 추정되는 클랜의 총 유지비는 %s 앨리스 코인이에요.",
            clanDescriptionTooLong:
                "죄송해요, 클랜 설명은 2000자보다 적어야해요!",
            createClanSuccessful: "성공적으로 %s 클랜을 만들었어요.",
            leaveClanFailed: "죄송해요, 당신은 클랜을 떠날 수 없어요: %s.",
            leaveClanSuccessful: "성공적으로 %s 클랜을 떠났어요.",
            setClanMatchModeFailed:
                "죄송해요, 클랜의 매치 모드를 설정할 수 없었어요: %s.",
            setClanMatchModeSuccess:
                "성공적으로 클랜의 매치 모드를 설정했어요.",
            disbandClanFailed: "죄송해요, 클랜을 해체할 수 없었어요: %s.",
            disbandClanSuccessful: "성공적으로 클랜을 해체했어요.",
            kickMemberFailed: "죄송해요, 이 유저를 추방할 수 없었어요: %s.",
            kickMemberSuccessful: "성공적으로 %s를 클랜에서 추방했어요.",
            setIconFailed: "죄송해요, 클랜의 아이콘을 설정할 수 없었어요: %s.",
            setIconSuccessful: "성공적으로 클랜의 아이콘을 설정했어요.",
            setBannerFailed: "죄송해요, 클랜의 배너를 설정할 수 없었어요: %s.",
            setBannerSuccessful: "성공적으로 클랜의 배너를 설정했어요.",
            removeIconFailed:
                "죄송해요, 클랜의 아이콘을 제거할 수 없었어요: %s.",
            removeIconSuccessful: "성공적으로 클랜의 아이콘을 제거했어요.",
            removeBannerFailed:
                "죄송해요, 클랜의 배너를 제거할 수 없었어요: %s.",
            removeBannerSuccessful: "성공적으로 클랜의 배너를 제거했어요.",
            modifyClanPowerFailed:
                "죄송해요, 클랜의 파워를 수정할 수 없었어요: %s.",
            modifyClanPowerSuccessful: "성공적으로 클랜의 파워를 수정했어요.",
            editDescriptionFailed:
                "죄송해요, 클랜의 설명을 설정할 수 없었어요: %s.",
            editDescriptionSuccessful: "성공적으로 클랜의 설명을 설정했어요.",
            clearDescriptionFailed:
                "죄송해요, 클랜의 설명을 제거할 수 없었어요: %s.",
            clearDescriptionSuccessful: "성공적으로 클랜의 설명을 제거했어요.",
            buyShopItemFailed:
                "죄송해요, 이 상점 아이템을 구매할 수 없었어요: %s.",
            buyShopItemSuccessful:
                "성공적으로 이 상점 아이템을 %s 앨리스 코인으로 구매했어요.",
            promoteMemberFailed:
                "죄송해요, 이 유저를 승급시킬 수 없었어요: %s.",
            promoteMemberSuccessful:
                "성공적으로 이 유저를 공동리더로 승급시켰어요.",
            demoteMemberFailed: "죄송해요, 이 유저를 강등시킬 수 없었어요: %s.",
            demoteMemberSuccessful:
                "성공적으로 이 유저를 일반 멤버로 강등시켰어요.",
            acceptClanInvitationFailed:
                "%s, 클랜 초대를 진행할 수 없었어요: %s.",
            acceptClanInvitationSuccessful: "%s, %s에 성공적으로 가입되었어요.",
            activatePowerupFailed:
                "죄송해요, 파워업을 활성화할 수 없었어요: %s.",
            activatePowerupSuccessful: "성공적으로 파워업을 활성화했어요.",
            clanAuctionCancelFailed: "죄송해요, 경매를 취소할 수 없었어요: %s.",
            clanAuctionCancelSuccessful: "성공적으로 경매를 취소했어요.",
            clanAuctionCreateFailed: "죄송해요, 경매를 만들 수 없었어요: %s.",
            clanAuctionCreateSuccessful: "성공적으로 경매를 만들었어요.",
            clanAuctionBidFailed: "죄송해요, 입찰을 진행할 수 없었어요: %s.",
            clanAuctionBidSuccessful: "성공적으로 경매에 입찰했어요.",
            clanPowerTransferFailed: "성공적으로 경매에 입찰했어요.",
            clanPowerTransferSuccessful:
                "성공적으로 %s 파워 포인트를 %s 클랜에서 %s 클랜으로 전달했어요.",
            changeRoleColorSuccessful:
                "성공적으로 클랜 역할 색상을 변경했어요.",
            changeRoleIconSuccessful:
                "성공적으로 클랜 역할 아이콘을 변경했어요.",
            createClan: "",
            clanChannel: "클랜 채널",
            clanPowerup: "클랜 파워업",
            clanRename: "클랜 이름 바꾸기",
            clanRole: "클랜 역할",
            clanRoleColorUnlock: "클랜 역할 색상 해금",
            clanRoleIconUnlock: "클랜 역할 아이콘 해금",
            leadershipTransfer: "리더 이전",
            buyShopItem: "%s 구매",
            bidToAuction: "입찰",
            auctionInfo: "경매 정보",
            auctionName: "이름",
            auctionAuctioneer: "경매인(경매 시작자)",
            creationDate: "생성일",
            expirationDate: "만료일",
            auctionItem: "경매 아이템",
            auctionPowerup: "파워업",
            auctionAmount: "양",
            auctionMinimumBid: "최소 입찰 금액",
            auctionBidders: "입찰한 클랜 수",
            auctionBidInfo: "입찰 정보",
            activePowerups: "%s 클랜에 현재 활성화된 파워업",
            ownedPowerups: "%s 클랜이 현재 보유한 파워업",
            guidelineWebsite: "이 웹사이트에서 가이드를 참고해 주세요.",
            clanLeader: "클랜 리더",
            clanPower: "파워",
            clanMemberCount: "멤버 수",
            clanTotalUpkeepEstimation: "총 추정 유지비",
            clanName: "클랜명",
            discordId: "디스코드 ID",
            clanMemberRole: "역할",
            clanMemberRoleLeader: "리더",
            clanMemberRoleCoLeader: "공동리더",
            clanMemberRoleMember: "멤버",
            clanMemberUpkeepValue: "",
        },
    };
}
