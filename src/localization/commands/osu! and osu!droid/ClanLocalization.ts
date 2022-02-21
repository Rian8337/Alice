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
            guidelineWebsite: "Please go to [this](%s) website for guidelines.",
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
    };
}
