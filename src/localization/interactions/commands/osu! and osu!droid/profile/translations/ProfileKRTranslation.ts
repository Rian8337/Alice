import { Translation } from "@alice-localization/base/Translation";
import { ProfileStrings } from "../ProfileLocalization";

/**
 * The Korean translation for the `profile` command.
 */
export class ProfileKRTranslation extends Translation<ProfileStrings> {
    override readonly translations: ProfileStrings = {
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
        selfProfileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
        userProfileNotFound: "죄송해요, 그 유저의 프로필을 찾을 수 없었어요!",
        viewingProfile: "%s의 osu!droid 프로필:\n<%s>",
        invalidRGBAformat: "죄송해요, 그건 유효하지 않은 RGBA 색상 형식이에요!",
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
        unequipBadgeSuccess: "%s, 성공적으로 %s 뱃지를 %s슬롯에서 해제했어요.",
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
        userNotBindedToAccount: "",
        playerCredentialsNotFound: "",
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
        enterBeatmapRestriction: "비트맵은 ranked 또는 approved 상태여야 해요.",
        chooseEquipBadge: "장착하려는 뱃지를 선택하세요.",
        chooseBadgeSlot: "뱃지를 놓을 슬롯 번호를 선택하세요.",
        owned: "소유함",
        droidPpBadgeDescription: "%s droid pp 달성 보상",
        totalScoreBadgeDescription: "총 점수 %s 달성 보상",
        rankedScoreBadgeDescription: "ranked 점수 %s 달성 보상",
        beatmapFcBadgeDescription:
            "ranked/approved 상태의 %s★ 이상 비트맵 풀콤보 달성 보상",
        tournamentBadgeDescription: "%s osu!droid 디스코드 토너먼트 우승 보상",
        unequipBadge: "뱃지를 장착해제할 슬롯 번호를 선택하세요.",
        infoBoxTextColorInfo:
            "당신의 프로필 정보 칸 텍스트 색상의 RGBA/hex값은 %s에요.",
        infoBoxBackgroundColorInfo:
            "당신의 프로필 정보 칸 배경 색상의 RGBA/hex값은 %s에요.",
        changeBackgroundLabel: "배경 변경",
        changeBackgroundDescription: "프로필 카드 배경을 변경합니다.",
        listBackgroundLabel: "배경 목록 보기",
        listBackgroundDescription:
            "현재 가지고 있는 걸 포함해서 모든 프로필 카드 배경을 봅니다.",
        customizationPlaceholder: "커스터마이즈 하고 싶은 것을 선택해 주세요.",
        showBadgeTemplateLabel: "뱃지 탬플릿 보기",
        showBadgeTemplateDescription: "프로필 카드 뱃지의 탬플릿을 봅니다.",
        claimBadgeLabel: "뱃지 획득",
        claimBadgeDescription: "뱃지를 획득합니다.",
        equipBadgeLabel: "뱃지 장착",
        equipBadgeDescription: "뱃지를 장착합니다",
        unequipBadgeLabel: "뱃지 장착 해제",
        unequipBadgeDescription: "뱃지를 장착 해제합니다.",
        listBadgeLabel: "뱃지 목록 보기",
        listBadgeDescription:
            "현재 가지고 있는 걸 포함해서 모든 프로필 카드 뱃지를 봅니다.",
        viewBackgroundColorLabel: "배경 색상 보기",
        viewBackgroundColorDescription:
            "프로필 카드 정보란 배경의 색상을 봅니다.",
        changeBackgroundColorLabel: "배경 색상 변경",
        changeBackgroundColorDescription:
            "프로필 카드 정보란 배경의 색상을 변경합니다.",
        viewTextColorLabel: "텍스트 색상 보기",
        viewTextColorDescription: "프로필 카드 정보란 텍스트의 색상을 봅니다.",
        changeTextColorLabel: "텍스트 색상 변경",
        changeTextColorDescription:
            "프로필 카드 정보란 텍스트의 색상을 변경합니다.",
        playerBindInfo: "%s의 플레이어 정보 (프로필을 보려면 클릭)",
        avatarLink: "아바타 링크",
        uid: "Uid",
        rank: "순위",
        playCount: "플레이 횟수",
        country: "국적",
        bindInformation: "바인딩 정보",
        binded: "%s에게 바인딩됨 (user ID: %s)",
        notBinded: "바인딩 되어있지 않음",
        playerCredentialsInfo: "",
        username: "",
        password: "",
        doNotShareCredentialsWarning: "",
        changeCredentialsDirection: "",
    };
}
