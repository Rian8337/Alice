import { Translation } from "@alice-localization/base/Translation";
import { ProfileStrings } from "../ProfileLocalization";

/**
 * The English translation for the `profile` command.
 */
export class ProfileENTranslation extends Translation<ProfileStrings> {
    override readonly translations: ProfileStrings = {
        tooManyOptions:
            "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        selfProfileNotFound: "I'm sorry, I cannot find your profile!",
        userProfileNotFound: "I'm sorry, I cannot find the player's profile!",
        viewingProfile: "osu!droid profile for %s:\n<%s>",
        invalidRGBAformat: "I'm sorry, that's an invalid RGBA color format!",
        invalidHexCode: "I'm sorry, that's an invalid hex code!",
        changeInfoTextColorConfirmation:
            "%s, are you sure you want to change your profile picture description box text color to `%s`?",
        changeInfoBackgroundColorConfirmation:
            "%s, are you sure you want to change your profile picture description box background color to `%s`?",
        changeInfoTextColorSuccess:
            "%s, successfully changed your profile picture description box text color to `%s`.",
        changeInfoBackgroundColorSuccess:
            "%s, successfully changed your profile picture description box background color to `%s`.",
        coinsToBuyBackgroundNotEnough:
            "I'm sorry, you don't have enough %sAlice coins to perform this action! A background costs %s`500` Alice coins. You currently have %s`%s` Alice coins.",
        buyBackgroundConfirmation:
            "%s, you don't have this background yet! Are you sure you want to purchase this background for %s`500` Alice coins and change your background profile picture to the background?",
        switchBackgroundConfirmation:
            "%s, are you sure you want to change your background profile picture?",
        switchBackgroundSuccess:
            "%s, successfully set your background profile picture to `%s`.",
        aliceCoinAmount: "You now have %s`%s` Alice coins.",
        userDoesntOwnAnyBadge: "I'm sorry, you don't own any badges!",
        badgeIsAlreadyClaimed: "I'm sorry, you've already owned this badge!",
        equipBadgeSuccess: "%s, successfully equipped badge `%s` at slot %s.",
        unequipBadgeSuccess: "%s, successfully unequipped badge at slot %s.",
        badgeUnclaimable: "I'm sorry, this badge cannot be claimed!",
        beatmapToClaimBadgeNotValid:
            "Hey, please enter a valid beatmap ID or link!",
        beatmapToClaimBadgeNotFound:
            "I'm sorry, I cannot find the beatmap that you have specified!",
        beatmapToClaimBadgeNotRankedOrApproved:
            "I'm sorry, only ranked or approved beatmaps count!",
        userDoesntHaveScoreinBeatmap:
            "I'm sorry, you don't have a score in the beatmap!",
        userCannotClaimBadge:
            "I'm sorry, you do not fulfill the requirement to get the badge!",
        claimBadgeSuccess: "%s, successfully claimed badge `%s`.",
        chooseBackground: "Choose the background that you want to use.",
        changeInfoBoxBackgroundColorTitle:
            "Change Information Box Background Color",
        enterColor: "Enter the color that you want to use.",
        supportedColorFormat:
            "This can be in RGBA format (e.g. 255,0,0,1) or hex code (e.g. #008BFF).",
        changeInfoBoxTextColorTitle: "Change Information Box Text Color",
        chooseClaimBadge: "Choose the badge that you want to claim.",
        claimBadge: "Claim a Profile Badge",
        enterBeatmap:
            "Enter the beatmap ID or link that is at least %s%s in PC rating and you have a full combo on.",
        enterBeatmapRestriction:
            "The beatmap must be a ranked or approved beatmap.",
        chooseEquipBadge: "Choose the badge that you want to equip.",
        chooseBadgeSlot:
            "Choose the slot number where you want to put the badge on.",
        owned: "Owned",
        droidPpBadgeDescription: "Rewarded for reaching %s droid pp",
        totalScoreBadgeDescription: "Rewarded for reaching %s total score",
        rankedScoreBadgeDescription: "Rewarded for getting %s ranked score",
        beatmapFcBadgeDescription:
            "Rewarded for getting a full combo on a ranked/approved %s%s beatmap",
        tournamentBadgeDescription:
            "Rewarded for winning the %s iteration of osu!droid Discord Tournament",
        unequipBadge:
            "Choose the slot number that you want to unequip the badge on.",
        infoBoxTextColorInfo: "Your information box text RGBA/hex color is %s.",
        infoBoxBackgroundColorInfo:
            "Your information box background RGBA/hex color is %s.",
        changeBackgroundLabel: "Change Background",
        changeBackgroundDescription: "Change your profile card's background.",
        listBackgroundLabel: "List Backgrounds",
        listBackgroundDescription:
            "List all profile card backgrounds, including those that you own.",
        customizationPlaceholder: "Choose what you want to customize.",
        showBadgeTemplateLabel: "Show Badge Template",
        showBadgeTemplateDescription:
            "Show the template of badges in a profile card.",
        claimBadgeLabel: "Claim Badge",
        claimBadgeDescription: "Claim a badge.",
        equipBadgeLabel: "Equip Badge",
        equipBadgeDescription: "Equip a badge.",
        unequipBadgeLabel: "Unequip Badge",
        unequipBadgeDescription: "Unequip a badge.",
        listBadgeLabel: "List Badges",
        listBadgeDescription:
            "List all profile card badges, including those that you own.",
        viewBackgroundColorLabel: "View Background Color",
        viewBackgroundColorDescription:
            "View the background color of your profile card's information box.",
        changeBackgroundColorLabel: "Change Background Color",
        changeBackgroundColorDescription:
            "Change the background color of your profile card's information box.",
        viewTextColorLabel: "View Text Color",
        viewTextColorDescription:
            "View the text color of your profile card's information box.",
        changeTextColorLabel: "Change Text Color",
        changeTextColorDescription:
            "Change the text color of your profile card's information box.",
        playerBindInfo: "Player Information for %s (click to view profile)",
        avatarLink: "Avatar Link",
        uid: "Uid",
        rank: "Rank",
        playCount: "Play Count",
        country: "Country",
        bindInformation: "Bind Information",
        binded: "Binded to <@%s> (user ID: %s)",
        playedVerificationMap: "Has played verification map",
        notBinded: "Not binded",
    };
}
