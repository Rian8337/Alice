import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ProfileStrings {
    readonly tooManyOptions: string;
    readonly selfProfileNotFound: string;
    readonly userProfileNotFound: string;
    readonly viewingProfile: string;
    readonly invalidRGBAformat: string;
    readonly invalidHexCode: string;
    readonly changeInfoTextColorConfirmation: string;
    readonly changeInfoBackgroundColorConfirmation: string;
    readonly changeInfoTextColorSuccess: string;
    readonly changeInfoBackgroundColorSuccess: string;
    readonly coinsToBuyBackgroundNotEnough: string;
    readonly buyBackgroundConfirmation: string;
    readonly switchBackgroundConfirmation: string;
    readonly switchBackgroundSuccess: string;
    readonly aliceCoinAmount: string;
    readonly userDoesntOwnAnyBadge: string;
    readonly badgeIsAlreadyClaimed: string;
    readonly equipBadgeSuccess: string;
    readonly unequipBadgeSuccess: string;
    readonly badgeUnclaimable: string;
    readonly beatmapToClaimBadgeNotValid: string;
    readonly beatmapToClaimBadgeNotFound: string;
    readonly beatmapToClaimBadgeNotRankedOrApproved: string;
    readonly userDoesntHaveScoreinBeatmap: string;
    readonly userCannotClaimBadge: string;
    readonly claimBadgeSuccess: string;
    readonly chooseBackground: string;
    readonly changeInfoBoxBackgroundColorTitle: string;
    readonly enterColor: string;
    readonly supportedColorFormat: string;
    readonly changeInfoBoxTextColorTitle: string;
    readonly chooseClaimBadge: string;
    readonly claimBadge: string;
    readonly enterBeatmap: string;
    readonly enterBeatmapRestriction: string;
    readonly chooseEquipBadge: string;
    readonly chooseBadgeSlot: string;
    readonly owned: string;
    readonly droidPpBadgeDescription: string;
    readonly totalScoreBadgeDescription: string;
    readonly rankedScoreBadgeDescription: string;
    readonly beatmapFcBadgeDescription: string;
    readonly tournamentBadgeDescription: string;
    readonly unequipBadge: string;
    readonly infoBoxTextColorInfo: string;
    readonly infoBoxBackgroundColorInfo: string;
    readonly changeBackgroundLabel: string;
    readonly changeBackgroundDescription: string;
    readonly listBackgroundLabel: string;
    readonly listBackgroundDescription: string;
    readonly customizationPlaceholder: string;
    readonly showBadgeTemplateLabel: string;
    readonly showBadgeTemplateDescription: string;
    readonly claimBadgeLabel: string;
    readonly claimBadgeDescription: string;
    readonly equipBadgeLabel: string;
    readonly equipBadgeDescription: string;
    readonly unequipBadgeLabel: string;
    readonly unequipBadgeDescription: string;
    readonly listBadgeLabel: string;
    readonly listBadgeDescription: string;
    readonly viewBackgroundColorLabel: string;
    readonly viewBackgroundColorDescription: string;
    readonly changeBackgroundColorLabel: string;
    readonly changeBackgroundColorDescription: string;
    readonly viewTextColorLabel: string;
    readonly viewTextColorDescription: string;
    readonly changeTextColorLabel: string;
    readonly changeTextColorDescription: string;
    readonly playerBindInfo: string;
    readonly avatarLink: string;
    readonly uid: string;
    readonly rank: string;
    readonly playCount: string;
    readonly country: string;
    readonly bindInformation: string;
    readonly binded: string;
    readonly playedVerificationMap: string;
    readonly notBinded: string;
}

/**
 * Localizations for the `profile` command.
 */
export class ProfileLocalization extends Localization<ProfileStrings> {
    protected override readonly translations: Readonly<
        Translation<ProfileStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            selfProfileNotFound: "I'm sorry, I cannot find your profile!",
            userProfileNotFound:
                "I'm sorry, I cannot find the player's profile!",
            viewingProfile: "osu!droid profile for %s:\n<%s>",
            invalidRGBAformat:
                "I'm sorry, that's an invalid RGBA color format!",
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
            badgeIsAlreadyClaimed:
                "I'm sorry, you've already owned this badge!",
            equipBadgeSuccess:
                "%s, successfully equipped badge `%s` at slot %s.",
            unequipBadgeSuccess:
                "%s, successfully unequipped badge at slot %s.",
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
                "This can be in RGBA format (e.g. 255,0,0,1) or hex code (e.g. #008BFF)",
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
            infoBoxTextColorInfo:
                "Your information box text RGBA/hex color is %s.",
            infoBoxBackgroundColorInfo:
                "Your information box background RGBA/hex color is %s.",
            changeBackgroundLabel: "Change Background",
            changeBackgroundDescription:
                "Change your profile card's background.",
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
            binded: "Binded to %s (user ID: %s)",
            playedVerificationMap: "Has played verification map",
            notBinded: "Not binded",
        },
        kr: {
            tooManyOptions:
                "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
            selfProfileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
            userProfileNotFound:
                "죄송해요, 그 유저의 프로필을 찾을 수 없었어요!",
            viewingProfile: "%s의 osu!droid 프로필:",
            invalidRGBAformat:
                "죄송해요, 그건 유효하지 않은 RGBA 색상 형식이에요!",
            invalidHexCode: "죄송해요, 그건 유효하지 않은 hex 코드값이에요!",
            changeInfoTextColorConfirmation:
                "%s, 프로필 설명의 텍스트 색상을 %s로 바꾸려는게 확실한가요?",
            changeInfoBackgroundColorConfirmation:
                "%s, 프로필 설명의 배경 색상을 %s로 바꾸려는게 확실한가요?",
            changeInfoTextColorSuccess:
                "%s, 성공적으로 프로필 설명의 텍스트 색상을 %s로 바꿨어요.",
            changeInfoBackgroundColorSuccess:
                "%s, 성공적으로 프로필 설명의 배경 색상을 %s로 바꿨어요.",
            coinsToBuyBackgroundNotEnough:
                "죄송해요, 이 행동을 하기 위한 %s앨리스 코인이 부족해요! 배경 가격은 %s`500` 앨리스 코인이에요. 현재 %s%s 앨리스 코인을 가지고 계세요s.",
            buyBackgroundConfirmation:
                "%s, 아직 이 배경을 가지고 있지 않아요! %s`500` 앨리스 코인으로 이 배경을 사고 프로필 배경으로 지정할까요?",
            switchBackgroundConfirmation: "%s, 정말 프로필 배경을 바꿀건가요?",
            switchBackgroundSuccess:
                "%s, 성공적으로 프로필 배경을 %s로 바꿨어요. 당신은 이제 %s%s 앨리스 코인이 남았어요.",
            aliceCoinAmount: "",
            userDoesntOwnAnyBadge: "죄송해요, 가지고 계신 뱃지가 없네요!",
            badgeIsAlreadyClaimed: "죄송해요, 이미 이 뱃지를 가지고 계시네요!",
            equipBadgeSuccess: "%s, 성공적으로 %s 뱃지를 %s슬롯에 장착했어요.",
            unequipBadgeSuccess:
                "%s, 성공적으로 %s 뱃지를 %s슬롯에서 해제했어요.",
            badgeUnclaimable: "죄송해요, 이 뱃지는 얻을 수 없어요!",
            beatmapToClaimBadgeNotValid:
                "저기, 유효한 비트맵 ID나 링크를 입력해 주세요!",
            beatmapToClaimBadgeNotFound:
                "죄송해요, 얘기해주신 비트맵을 찾을 수 없어요!",
            beatmapToClaimBadgeNotRankedOrApproved:
                "죄송해요, ranked 또는 approved 상태의 비트맵만 카운트돼요!",
            userDoesntHaveScoreinBeatmap:
                "죄송해요, 비트맵에 당신의 기록이 없네요!",
            userCannotClaimBadge:
                "죄송해요, 뱃지를 얻기위한 조건을 충족시키지 못하셨어요!",
            claimBadgeSuccess: "%s, 성공적으로 %s 뱃지를 얻었어요.",
            chooseBackground: "사용하고자 하는 배경을 선택하세요.",
            changeInfoBoxBackgroundColorTitle: "프로필 정보 칸 배경 색 바꾸기",
            enterColor: "사용하고자 하는 색상을 입력하세요.",
            supportedColorFormat:
                "RGBA 형식(예: 255,0,0,1) 또는 hex 코드(예: #008BFF)를 입력해주세요",
            changeInfoBoxTextColorTitle: "프로필 정보 칸 텍스트 색 바꾸기 ",
            chooseClaimBadge: "얻으려는 뱃지를 선택해 주세요.",
            claimBadge: "프로필 뱃지 획득하기",
            enterBeatmap:
                "PC 레이팅이 %s★ 이상이며 당신이 풀콤보를 달성한 비트맵의 ID나 링크를 입력해 주세요.",
            enterBeatmapRestriction:
                "비트맵은 ranked 또는 approved 상태여야 해요.",
            chooseEquipBadge: "장착하려는 뱃지를 선택하세요.",
            chooseBadgeSlot: "뱃지를 놓을 슬롯 번호를 선택하세요.",
            owned: "소유함",
            droidPpBadgeDescription: "%s droid pp 달성 보상",
            totalScoreBadgeDescription: "총 점수 %s 달성 보상",
            rankedScoreBadgeDescription: "ranked 점수 %s 달성 보상",
            beatmapFcBadgeDescription:
                "ranked/approved 상태의 %s★ 이상 비트맵 풀콤보 달성 보상",
            tournamentBadgeDescription:
                "%s osu!droid 디스코드 토너먼트 우승 보상",
            unequipBadge: "뱃지를 장착해제할 슬롯 번호를 선택하세요.",
            infoBoxTextColorInfo:
                "당신의 프로필 정보 칸 텍스트 색상의 RGBA/hex값은 %s에요.",
            infoBoxBackgroundColorInfo:
                "당신의 프로필 정보 칸 배경 색상의 RGBA/hex값은 %s에요.",
            changeBackgroundLabel: "",
            changeBackgroundDescription: "",
            listBackgroundLabel: "",
            listBackgroundDescription: "",
            customizationPlaceholder: "",
            showBadgeTemplateLabel: "",
            showBadgeTemplateDescription: "",
            claimBadgeLabel: "",
            claimBadgeDescription: "",
            equipBadgeLabel: "",
            equipBadgeDescription: "",
            unequipBadgeLabel: "",
            unequipBadgeDescription: "",
            listBadgeLabel: "",
            listBadgeDescription: "",
            viewBackgroundColorLabel: "",
            viewBackgroundColorDescription: "",
            changeBackgroundColorLabel: "",
            changeBackgroundColorDescription: "",
            viewTextColorLabel: "",
            viewTextColorDescription: "",
            changeTextColorLabel: "",
            changeTextColorDescription: "",
            playerBindInfo: "",
            avatarLink: "",
            uid: "Uid",
            rank: "",
            playCount: "",
            country: "",
            bindInformation: "",
            binded: "",
            playedVerificationMap: "",
            notBinded: "",
        },
    };
}
