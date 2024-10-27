import { Translation } from "@localization/base/Translation";
import { ClanStrings } from "../ClanLocalization";

/**
 * The Korean translation for the `clan` command.
 */
export class ClanKRTranslation extends Translation<ClanStrings> {
    override readonly translations: ClanStrings = {
        notInMainGuild: "죄송해요, 이 명령어는 이 서버에서 사용할 수 없어요.",
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
        selfNotInBattleCooldown: "당신은 현재 클랜 배틀에 참가할 수 있어요.",
        userNotInBattleCooldown: "이 유저는 현재 클랜 배틀에 참가할 수 있어요.",
        selfInOldJoinCooldown:
            "당신은 다음 시간동안 이전에 있던 클랜에 가입할 수 없어요: %s.",
        userInOldJoinCooldown:
            "이 유저는 다음 시간동안 이전에 있던 클랜에 가입할 수 없어요: %s",
        selfNotInOldJoinCooldown:
            "당신은 현재 이전에 있던 클랜에 가입할 수 있어요.",
        userNotInOldJoinCooldown:
            "이 유저는 현재 이전에 있던 클랜에 가입할 수 있어요.",
        selfInJoinCooldown: "당신은 다음 시간동안 클랜에 가입할 수 없어요: %s.",
        userInJoinCooldown:
            "이 유저는 다음 시간동안 클랜에 가입할 수 없어요: %s.",
        selfNotInJoinCooldown: "당신은 현재 클랜에 가입할 수 있어요.",
        userNotInJoinCooldown: "이 유저는 현재 클랜에 가입할 수 있어요.",
        roleIconIsNotUnlocked:
            "죄송해요, 당신의 클랜은 아직 클랜 역할 아이콘을 바꿀 수 있는 능력을 개방하지 않았어요!",
        roleColorIsNotUnlocked:
            "죄송해요, 당신의 클랜은 아직 클랜 역할 색상을 바꿀 수 있는 능력을 개방하지 않았어요!",
        cannotDownloadRoleIcon: "죄송해요, 역할 아이콘을 다운받지 못하겠어요!",
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
        createClanConfirmation:
            "%s라는 이름의 클랜을 %s 앨리스 코인으로 만드려는게 확실한가요?",
        leaveClanConfirmation: "현재 클랜을 떠나려는게 확실한가요?",
        disbandClanConfirmation: "정말 클랜을 해체하실 건가요?",
        kickMemberConfirmation: "정말 이 유저를 클랜에서 추방하실 건가요?",
        removeIconConfirmation: "정말 클랜 아이콘을 제거하실 건가요?",
        removeBannerConfirmation: "정말 클랜 배너를 제거하실 건가요?",
        editDescriptionConfirmation: "클랜 설명을 수정하려는게 확실한가요?",
        clearDescriptionConfirmation: "정말 클랜 설명을 제거하실 건가요?",
        promoteMemberConfirmation: "정말 이 유저를 공동 리더로 만드실 건가요?",
        demoteMemberConfirmation:
            "정말 이 유저를 일반 멤버로 강등시키실 건가요?",
        acceptClanInvitationConfirmation:
            "%s, 이 클랜에 가입하고 싶은게 확실한가요?",
        activatePowerupConfirmation: "정말 %s 파워업을 클랜에 활성화할 건가요?",
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
        clanDescriptionTooLong: "죄송해요, 클랜 설명은 2000자보다 적어야해요!",
        createClanSuccessful: "성공적으로 %s 클랜을 만들었어요.",
        leaveClanFailed: "죄송해요, 당신은 클랜을 떠날 수 없어요: %s.",
        leaveClanSuccessful: "성공적으로 %s 클랜을 떠났어요.",
        setClanMatchModeFailed:
            "죄송해요, 클랜의 매치 모드를 설정할 수 없었어요: %s.",
        setClanMatchModeSuccess: "성공적으로 클랜의 매치 모드를 설정했어요.",
        disbandClanFailed: "죄송해요, 클랜을 해체할 수 없었어요: %s.",
        disbandClanSuccessful: "성공적으로 클랜을 해체했어요.",
        kickMemberFailed: "죄송해요, 이 유저를 추방할 수 없었어요: %s.",
        kickMemberSuccessful: "성공적으로 %s를 클랜에서 추방했어요.",
        setIconFailed: "죄송해요, 클랜의 아이콘을 설정할 수 없었어요: %s.",
        setIconSuccessful: "성공적으로 클랜의 아이콘을 설정했어요.",
        setBannerFailed: "죄송해요, 클랜의 배너를 설정할 수 없었어요: %s.",
        setBannerSuccessful: "성공적으로 클랜의 배너를 설정했어요.",
        removeIconFailed: "죄송해요, 클랜의 아이콘을 제거할 수 없었어요: %s.",
        removeIconSuccessful: "성공적으로 클랜의 아이콘을 제거했어요.",
        removeBannerFailed: "죄송해요, 클랜의 배너를 제거할 수 없었어요: %s.",
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
        buyShopItemFailed: "죄송해요, 이 상점 아이템을 구매할 수 없었어요: %s.",
        buyShopItemSuccessful:
            "성공적으로 이 상점 아이템을 %s 앨리스 코인으로 구매했어요.",
        promoteMemberFailed: "죄송해요, 이 유저를 승급시킬 수 없었어요: %s.",
        promoteMemberSuccessful:
            "성공적으로 이 유저를 공동리더로 승급시켰어요.",
        demoteMemberFailed: "죄송해요, 이 유저를 강등시킬 수 없었어요: %s.",
        demoteMemberSuccessful:
            "성공적으로 이 유저를 일반 멤버로 강등시켰어요.",
        acceptClanInvitationFailed: "%s, 클랜 초대를 진행할 수 없었어요: %s.",
        acceptClanInvitationSuccessful: "%s, %s에 성공적으로 가입되었어요.",
        activatePowerupFailed: "죄송해요, 파워업을 활성화할 수 없었어요: %s.",
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
        changeRoleColorSuccessful: "성공적으로 클랜 역할 색상을 변경했어요.",
        changeRoleIconSuccessful: "성공적으로 클랜 역할 아이콘을 변경했어요.",
        createClan: "클랜 생성",
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
        clanMemberUpkeepValue: "유지비",
        announceModalTitle: "",
        announceModalMessageLabel: "",
        announceModalMessagePlaceholder: "",
    };
}
