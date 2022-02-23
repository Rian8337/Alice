import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface EmbedCreatorStrings {
    readonly exitMenu: string;
    readonly result: string;
    readonly droidPP: string;
    readonly pcPP: string;
    readonly estimated: string;
    readonly droidStars: string;
    readonly pcStars: string;
    readonly starRating: string;
    readonly rebalanceCalculationNote: string;
    readonly beatmapInfo: string;
    readonly dateAchieved: string;
    readonly penalized: string;
    readonly forFC: string;
    readonly sliderTicks: string;
    readonly sliderEnds: string;
    readonly hitErrorAvg: string;
    readonly challengeId: string;
    readonly timeLeft: string;
    readonly weeklyChallengeTitle: string;
    readonly dailyChallengeTitle: string;
    readonly featuredPerson: string;
    readonly download: string;
    readonly points: string;
    readonly passCondition: string;
    readonly constrain: string;
    readonly modOnly: string;
    readonly rankableMods: string;
    readonly challengeBonuses: string;
    readonly auctionInfo: string;
    readonly auctionName: string;
    readonly auctionAuctioneer: string;
    readonly creationDate: string;
    readonly auctionMinimumBid: string;
    readonly auctionItemInfo: string;
    readonly auctionPowerup: string;
    readonly auctionItemAmount: string;
    readonly auctionBidInfo: string;
    readonly auctionBidders: string;
    readonly auctionTopBidders: string;
    readonly broadcast: string;
    readonly broadcast1: string;
    readonly broadcast2: string;
    readonly mapShareSubmission: string;
    readonly mapShareStatusAndSummary: string;
    readonly mapShareStatus: string;
    readonly mapShareSummary: string;
    readonly mapShareStatusAccepted: string; // see MapshareLocalization
    readonly mapShareStatusDenied: string;
    readonly mapShareStatusPending: string;
    readonly mapShareStatusPosted: string;
    readonly musicYoutubeChannel: string;
    readonly musicDuration: string;
    readonly musicQueuer: string;
    readonly ppProfileTitle: string; // see PrototypecheckLocalization
    readonly totalPP: string;
    readonly ppProfile: string;
    readonly warningInfo: string;
    readonly warnedUser: string;
    readonly warningId: string;
    readonly warningIssuedBy: string;
    readonly expirationDate: string; // see 22.140
    readonly reason: string; // see 43.9
    readonly channel: string;
}

/**
 * Localizations for the `EmbedCreator` creator utility.
 */
export class EmbedCreatorLocalization extends Localization<EmbedCreatorStrings> {
    protected override readonly translations: Readonly<
        Translation<EmbedCreatorStrings>
    > = {
        en: {
            exitMenu: 'Type "exit" to exit this menu',
            result: "Result",
            droidPP: "Droid pp",
            pcPP: "PC pp",
            estimated: "estimated",
            droidStars: "droid stars",
            pcStars: "PC stars",
            starRating: "Star Rating",
            rebalanceCalculationNote:
                "The resulting values are subject to change.",
            beatmapInfo: "Beatmap Information",
            dateAchieved: "Achieved on %s",
            penalized: "penalized",
            forFC: "for %s FC",
            sliderTicks: "slider ticks",
            sliderEnds: "slider ends",
            hitErrorAvg: "hit error avg",
            challengeId: "Challenge ID",
            timeLeft: "Challenge ID",
            weeklyChallengeTitle: "osu!droid Weekly Bounty Challenge",
            dailyChallengeTitle: "osu!droid Daily Challenge",
            featuredPerson: "Featured by %s",
            download: "Download",
            points: "Points",
            passCondition: "Pass Condition",
            constrain: "Constrain",
            modOnly: "%s mod only",
            rankableMods: "Any rankable mod except EZ, NF, and HT",
            challengeBonuses: "Use `/daily challenges` to check bonuses.",
            auctionInfo: "Auction Information",
            auctionName: "Name",
            auctionAuctioneer: "Auctioneer",
            creationDate: "Creation Date",
            auctionMinimumBid: "Minimum Bid Amount",
            auctionItemInfo: "Item Information",
            auctionPowerup: "Powerup",
            auctionItemAmount: "Amount",
            auctionBidInfo: "Bid Information",
            auctionBidders: "Bidders",
            auctionTopBidders: "Top Bidders",
            broadcast: "Broadcast",
            broadcast1:
                "If you see a user violating the rules, misbehaving, or intentionally trying to be annoying, please report the user using `/report` command (more information is available using `/help report`)",
            broadcast2:
                "Keep in mind that only staff members can view reports, therefore your privacy is safe. We appreciate your contribution towards bringing a friendly environment!",
            mapShareSubmission: "Submission by %s",
            mapShareStatusAndSummary: "Status and Summary",
            mapShareStatus: "Status",
            mapShareSummary: "Summary",
            mapShareStatusAccepted: "accepted",
            mapShareStatusDenied: "denied",
            mapShareStatusPending: "pending",
            mapShareStatusPosted: "posted",
            musicYoutubeChannel: "Channel",
            musicDuration: "Duration",
            musicQueuer: "Queued/requested by %s",
            ppProfileTitle: "PP Profile for %s",
            totalPP: "Total PP",
            ppProfile: "PP Profile",
            warningInfo: "Warning Info",
            warningId: "Warning ID",
            warnedUser: "Warned User",
            warningIssuedBy: "Issued by <@%s> (%s)",
            expirationDate: "Expiration Date",
            reason: "Reason",
            channel: "Channel",
        },
        kr: {
            exitMenu: '이 메뉴를 종료하려면 "exit"을 입력하세요',
            result: "결과",
            droidPP: "Droid pp",
            pcPP: "PC pp",
            estimated: "추정됨",
            droidStars: "droid stars",
            pcStars: "PC stars",
            starRating: "스타 레이팅",
            rebalanceCalculationNote: "결과값은 변할 수 있어요.",
            beatmapInfo: "비트맵 정보",
            dateAchieved: "%s에 달성함",
            penalized: "패널티를 받음",
            forFC: "for %s% FC",
            sliderTicks: "슬라이더 틱",
            sliderEnds: "슬라이더 끝(ends)",
            hitErrorAvg: "평균 타격 오차(hit error avg)",
            challengeId: "챌린지 ID",
            timeLeft: "남은 시간",
            weeklyChallengeTitle: "osu!droid 위클리 챌린지",
            dailyChallengeTitle: "osu!droid 데일리 챌린지",
            featuredPerson: "%s가 제안함",
            download: "다운로드",
            points: "포인트",
            passCondition: "패스 조건",
            constrain: "제한사항",
            modOnly: "%s 모드만 사용",
            rankableMods: "EZ, NF 및 HT를 제외한 모든 랭크 가능 모드",
            challengeBonuses:
                "보너스를 확인하려면 `/daily challenges`를 사용하세요.",
            auctionInfo: "경매 정보",
            auctionName: "이름",
            auctionAuctioneer: "경매인(경매 시작자)",
            creationDate: "생성 날짜",
            auctionMinimumBid: "최소 입찰 금액",
            auctionItemInfo: "아이템 정보",
            auctionPowerup: "파워업",
            auctionItemAmount: "양",
            auctionBidInfo: "입찰 정보",
            auctionBidders: "입찰한 클랜 수",
            auctionTopBidders: "최고 입찰자",
            broadcast: "안내",
            broadcast1:
                "유저가 규칙을 위반하거나, 적절하지 못한 행동을 하거나, 의도적으로 짜증나게 한다면, `/report` 명령어를 사용해서 유저를 신고해 주세요(`/help report`로 더 많은 정보를 얻을 수 있어요)",
            broadcast2:
                "오직 스태프 멤버만 신고를 볼 수 있기 때문에, 여러분의 프라이버시는 안전하다는걸 알아주세요. 더욱 깨끗한 서버 환경을 위한 여러분의 노력과 기여에는 언제나 감사드려요!",
            mapShareSubmission: "%s의 제출",
            mapShareStatusAndSummary: "상태 및 요약",
            mapShareStatus: "상태",
            mapShareSummary: "요약",
            mapShareStatusAccepted: "수락됨",
            mapShareStatusDenied: "거부됨",
            mapShareStatusPending: "처리중",
            mapShareStatusPosted: "포스트됨",
            musicYoutubeChannel: "채널",
            musicDuration: "길이",
            musicQueuer: "%s에 의해 요청됨/재생목록에 넣어짐",
            ppProfileTitle: "%s의 PP 프로필",
            totalPP: "총 PP",
            ppProfile: "PP 프로필",
            warningInfo: "",
            warningId: "",
            warnedUser: "",
            warningIssuedBy: "",
            expirationDate: "만료일",
            reason: "이유",
            channel: "채널",
        },
        id: {
            exitMenu: "",
            result: "",
            droidPP: "",
            pcPP: "",
            estimated: "",
            droidStars: "",
            pcStars: "",
            starRating: "",
            rebalanceCalculationNote: "",
            beatmapInfo: "",
            dateAchieved: "",
            penalized: "",
            forFC: "",
            sliderTicks: "",
            sliderEnds: "",
            hitErrorAvg: "",
            challengeId: "",
            timeLeft: "",
            weeklyChallengeTitle: "",
            dailyChallengeTitle: "",
            featuredPerson: "",
            download: "",
            points: "",
            passCondition: "",
            constrain: "",
            modOnly: "",
            rankableMods: "",
            challengeBonuses: "",
            auctionInfo: "",
            auctionName: "",
            auctionAuctioneer: "",
            creationDate: "",
            auctionMinimumBid: "",
            auctionItemInfo: "",
            auctionPowerup: "",
            auctionItemAmount: "",
            auctionBidInfo: "",
            auctionBidders: "",
            auctionTopBidders: "",
            broadcast: "",
            broadcast1: "",
            broadcast2: "",
            mapShareSubmission: "",
            mapShareStatusAndSummary: "",
            mapShareStatus: "",
            mapShareSummary: "",
            mapShareStatusAccepted: "",
            mapShareStatusDenied: "",
            mapShareStatusPending: "",
            mapShareStatusPosted: "",
            musicYoutubeChannel: "채널",
            musicDuration: "",
            musicQueuer: "",
            ppProfileTitle: "",
            totalPP: "",
            ppProfile: "",
            warningInfo: "",
            warningId: "",
            warnedUser: "",
            warningIssuedBy: "",
            expirationDate: "",
            reason: "",
            channel: "",
        },
    };
}
