import { Translation } from "@alice-localization/base/Translation";
import {
    bold,
    chatInputApplicationCommandMention,
    userMention,
} from "discord.js";
import { DailyStrings } from "../DailyLocalization";

/**
 * The Korean translation for the `daily` command.
 */
export class DailyKRTranslation extends Translation<DailyStrings> {
    override readonly translations: DailyStrings = {
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
        noOngoingChallenge: "죄송해요, 지금은 플레이어가 없네요!",
        challengeNotFound: "죄송해요, 지금 진행중인 챌린지가 없네요!",
        challengeFromReplayNotFound: "죄송해요, 챌린지를 찾을 수 없었어요!",
        startChallengeFailed:
            "죄송해요, 이 리플레이와 연관된 챌린지를 찾을 수 없었어요!",
        startChallengeSuccess: "죄송해요, 챌린지를 시작할 수 없었어요: %s.",
        userHasPlayedChallenge: "성공적으로 챌린지 %s를 시작했어요.",
        userHasNotPlayedChallenge:
            "이 유저는 %s 챌린지를 최대 %s 보너스 레벨로 플레이했어요.",
        userHasNotPlayedAnyChallenge:
            "이 유저는 %s 챌린지를 플레이하지 않았어요.",
        scoreNotFound: "죄송해요, 이 유저는 어떤 챌린지도 플레이하지 않았어요!",
        challengeNotOngoing: "죄송해요, 챌린지 비트맵을 플레이하지 않으셨어요!",
        challengeNotCompleted:
            "죄송해요, 이 챌린지는 시작되거나 끝나지 않았어요!",
        challengeCompleted:
            "축하드려요! %s 챌린지를 보너스 레벨 %s(으)로 완료해서 %s 포인트와 %s 앨리스 코인을 획득했어요! 이제 %s 포인트와 %s 앨리스 코인을 보유중이에요.",
        replayDownloadFail:
            "죄송해요, 당신의 리플레이를 다운로드 할 수 없었어요!",
        replayInvalid: "저기, 리플레이의 적절한 다운로드 링크를 제공해 주세요!",
        replayDoesntHaveSameUsername:
            "죄송해요, 이 리플레이 파일의 유저네임은 당신이 바인딩된 osu!droid 계정의 유저네임과 달라요!",
        replayTooOld: "죄송해요, 이 리플레이 형식의 버전이 너무 오래됐어요!",
        manualSubmissionConfirmation:
            "수동 제출을 확인받기 위해선 스태프 멤버에게 부탁하세요!",
        aboutTitle: "osu!droid 데일리/위클리 챌린지",
        aboutDescription:
            "이건 여러분에게 일간, 주간 챌린지를 제공해 주는 시스템이에요. 챌린지를 완료하면 포인트와 %s앨리스 코인을 획득할 수 있어요! ",
        aboutQuestion1: "어떻게 작동하나요?",
        aboutAnswer1:
            "매일 새로운 데일리 챌린지가 나와요. 각각의 챌린지는 난이도를 기반으로 다른 양의 포인트가 부여돼요. 챌린지를 통과함으로써 포인트와 %s앨리스 코인을 얻을 수 있어요. 각 챌린지에는 몇몇 보너스 미션도 있는데, 완료하면 더 많은 포인트와 %s앨리스 코인을 받을 수 있어요! 각각의 챌린지 보너스 레벨은 2 챌린지 포인트로 변환되며, 이것도 역시 %s`4`앨리스 코인으로 변환돼요.\n\n위클리 챌린지는 일주일에 한번만 가능한데, 데일리 챌린지들보다 상당히 어렵기 때문에 더 많은 포인트와 %s앨리스 코인을 줘요. 이는 일주일의 기간을 주는 이유이기도 하죠!",
        aboutQuestion2: "어떻게 챌린지 기록을 제출하나요?",
        aboutAnswer2: `기존 맵을 이미 플레이 했을 경우를 고려해서, 다운로드 받을 수 있는 별개의 비트맵이 제공돼요. 사실, 챌린지 달성을 인정받을 수 있는 기록을 제출하려면 ${bold(
            "반드시"
        )} 이 비트맵을 다운로드해서 플레이해야 해요.\n\n챌린지를 완료하면, 기록을 제출하기 위해 ${chatInputApplicationCommandMention(
            "daily",
            "submit",
            "1075209201049153617"
        )} 명령어를 사용 해 주세요.`,
        aboutQuestion3: "포인트와 앨리스 코인은 어디에 쓰나요?",
        aboutAnswer3:
            "현재로서는, 포인트는 사용처가 없어요. 하지만, %s앨리스 코인은 클랜과 치장을 위해 사용할 수 있어요.",
        aboutQuestion4: "포인트와 앨리스 코인의 리더보드가 있나요?",
        aboutAnswer4: `%s앨리스 코인 리더보드는 없지만, 포인트 리더보드는 있어요. ${chatInputApplicationCommandMention(
            "daily",
            "leaderboard",
            "1075209201049153617"
        )}를 사용하시면 리더보드를 볼 수 있어요.`,
        aboutQuestion5: "여기서 언급되지 않은 질문이 더 있어요!",
        aboutAnswer5: `${userMention(
            "386742340968120321"
        )}에게 데일리, 위클리 챌린지에 관한 더 많은 정보를 물어보실 수 있어요.`,
        username: "유저네임",
        uid: "UID",
        points: "포인트",
        scoreStatistics: "기록 통계",
        totalScore: "총 점수",
        maxCombo: "최대 콤보",
        accuracy: "정확도",
        rank: "랭크",
        time: "시간",
        hitGreat: "Great(300) 타격 수",
        hitGood: "Good(100) 타격 수",
        hitMeh: "Meh(50) 타격 수",
        misses: "미스",
        bonusLevelReached: "달성한 보너스 레벨",
        geki: "geki",
        katu: "katu",
        profile: "%s의 데일리/위클리 챌린지 프로필",
        challengesCompleted: "완료한 챌린지 수",
        statistics: "통계",
        challengeIsOngoing: "",
        invalidChallengeId: "",
        challengeWithIdExists: "",
        noBeatmapProvided: "",
        beatmapNotFound: "",
        passValueOutOfRange: "",
        bonusValueOutOfRange: "",
        unrankedModsIncluded: "",
        beatmapDownloadFailed: "",
        addNewChallengeFailed: "",
        addNewChallengeSuccess: "",
        modifyBonusFailed: "",
        modifyBonusSuccess: "",
        modifyBeatmapFailed: "",
        modifyBeatmapSuccess: "",
        deleteChallengeFailed: "",
        deleteChallengeSuccess: "",
        setConstrainFailed: "",
        setConstrainSuccess: "",
        setDownloadLinkFailed: "",
        setDownloadLinkSuccess: "",
        setPassReqFailed: "",
        setPassReqSuccess: "",
        setPointsFailed: "",
        setPointsSuccess: "",
        setFeaturedFailed: "",
        setFeaturedSuccess: "",
        none: "",
        noBonuses: "",
        noDownloadLink: "",
    };
}
