import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface DailyStrings {
    readonly tooManyOptions: string;
    readonly noOngoingChallenge: string;
    readonly challengeNotFound: string;
    readonly challengeFromReplayNotFound: string;
    readonly startChallengeFailed: string;
    readonly startChallengeSuccess: string;
    readonly userHasPlayedChallenge: string;
    readonly userHasNotPlayedChallenge: string;
    readonly userHasNotPlayedAnyChallenge: string;
    readonly scoreNotFound: string;
    readonly challengeNotOngoing: string;
    readonly challengeNotCompleted: string;
    readonly challengeCompleted: string;
    readonly invalidReplayURL: string;
    readonly replayDownloadFail: string;
    readonly replayInvalid: string;
    readonly replayDoesntHaveSameUsername: string;
    readonly replayTooOld: string;
    readonly manualSubmissionConfirmation: string;
    readonly aboutTitle: string;
    readonly aboutDescription: string;
    readonly aboutQuestion1: string;
    readonly aboutAnswer1: string;
    readonly aboutQuestion2: string;
    readonly aboutAnswer2: string;
    readonly aboutQuestion3: string;
    readonly aboutAnswer3: string;
    readonly aboutQuestion4: string;
    readonly aboutAnswer4: string;
    readonly aboutQuestion5: string;
    readonly aboutAnswer5: string;
    readonly username: string;
    readonly uid: string;
    readonly points: string;
    readonly scoreStatistics: string;
    readonly totalScore: string;
    readonly maxCombo: string;
    readonly accuracy: string;
    readonly rank: string;
    readonly time: string;
    readonly hitGreat: string;
    readonly hitGood: string;
    readonly hitMeh: string;
    readonly misses: string;
    readonly bonusLevelReached: string;
    readonly geki: string;
    readonly katu: string;
    readonly profile: string;
    readonly challengesCompleted: string;
    readonly statistics: string;
}

/**
 * Localizations for the `daily` command.
 */
export class DailyLocalization extends Localization<DailyStrings> {
    protected override readonly translations: Readonly<
        Translation<DailyStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            noOngoingChallenge: "I'm sorry, there is no ongoing challenge now!",
            challengeNotFound: "I'm sorry, I cannot find the challenge!",
            challengeFromReplayNotFound:
                "I'm sorry, I cannot find the challenge associated with that replay!",
            startChallengeFailed:
                "I'm sorry, I couldn't start the challenge: %s.",
            startChallengeSuccess: "Successfully started challenge `%s`.",
            userHasPlayedChallenge:
                "The player has played challenge `%s` with highest bonus level achieved `%s`.",
            userHasNotPlayedChallenge:
                "The player has not played challenge `%s`.",
            userHasNotPlayedAnyChallenge:
                "I'm sorry, this user has not played any challenges at all!",
            scoreNotFound:
                "I'm sorry, you haven't played the challenge beatmap!",
            challengeNotOngoing:
                "I'm sorry, this challenge has not been started or has ended!",
            challengeNotCompleted:
                "I'm sorry, you did not complete the ongoing challenge: %s.",
            challengeCompleted:
                "Congratulations! You have completed challenge `%s` with challenge bonus level `%s`, earning `%s` point(s) and `%s` Alice coins! You now have `%s` point(s) and `%s` Alice coins.",
            invalidReplayURL: "Hey, please enter a valid URL!",
            replayDownloadFail: "I'm sorry, I couldn't download your replay!",
            replayInvalid:
                "Hey, please provide the proper download link to your replay!",
            replayDoesntHaveSameUsername:
                "I'm sorry, that replay file does not contain the same username as your binded osu!droid account!",
            replayTooOld: "I'm sorry, that replay's format version is too old!",
            manualSubmissionConfirmation:
                "Please ask a staff member to confirm your manual submission!",
            aboutTitle: "osu!droid Daily/Weekly Challenges",
            aboutDescription:
                "This is a system that provides daily and weekly challenges for you to complete. Gain points and %sAlice coins as you complete challenges!",
            aboutQuestion1: "How does it work?",
            aboutAnswer1:
                "Every day, there will be a new daily challenge to complete. Each challenges grant a different amount of points depending on how hard the challenge is. You can get points and %sAlice coins by passing the challenge. There will be a few bonuses that allows you to gain more points and %sAlice coins, too! Each challenge bonus level converts to 2 challenge points, which also converts to %s`4` Alice coins.\n\nThe weekly bounty challenge, which is only available once per week, grants more points and %sAlice coins as this challenge is considerably harder than any daily challenges. That's also why you have a week to complete it, too!",
            aboutQuestion2: "How can I submit challenges?",
            aboutAnswer2:
                "There will be a separate beatmap set for you to download in case you have played the original map. In fact, you **must** download the set in order to submit your play.\n\nOnce you complete a challenge, use the `/daily submit` command to submit your play.",
            aboutQuestion3: "How can I use my points and Alice coins?",
            aboutAnswer3:
                "As of now, there is no use for points. However, %sAlice coins can be used for clans and cosmetics.",
            aboutQuestion4:
                "Is there a leaderboard for points and Alice coins?",
            aboutAnswer4:
                "There is no leaderboard for %sAlice coins, however there is a leaderboard for points. You can use `/daily leaderboard` to view the leaderboard.",
            aboutQuestion5:
                "I have more questions that are not mentioned in here!",
            aboutAnswer5:
                "You can ask <@386742340968120321> for more information about daily a2nd weekly challenges.",
            username: "Username",
            uid: "UID",
            points: "Points",
            scoreStatistics: "Score Statistics",
            totalScore: "Total Score",
            maxCombo: "Max Combo",
            accuracy: "Accuracy",
            rank: "Rank",
            time: "Time",
            hitGreat: "Hit Great (300)",
            hitGood: "Hit Good (100)",
            hitMeh: "Hit Meh (50)",
            misses: "Misses",
            bonusLevelReached: "Bonus Level Reached",
            geki: "geki",
            katu: "katu",
            profile: "Daily/Weekly Challenge Profile for %s",
            challengesCompleted: "Challenges completed",
            statistics: "Statistics",
        },
        kr: {
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
            scoreNotFound:
                "죄송해요, 이 유저는 어떤 챌린지도 플레이하지 않았어요!",
            challengeNotOngoing:
                "죄송해요, 챌린지 비트맵을 플레이하지 않으셨어요!",
            challengeNotCompleted:
                "죄송해요, 이 챌린지는 시작되거나 끝나지 않았어요!",
            challengeCompleted:
                "축하드려요! %s 챌린지를 보너스 레벨 %s(으)로 완료해서 %s 포인트와 %s 앨리스 코인을 획득했어요! 이제 %s 포인트와 %s 앨리스 코인을 보유중이에요.",
            invalidReplayURL: "저기, 유효한 URL을 입력해 주세요!",
            replayDownloadFail:
                "죄송해요, 당신의 리플레이를 다운로드 할 수 없었어요!",
            replayInvalid:
                "저기, 리플레이의 적절한 다운로드 링크를 제공해 주세요!",
            replayDoesntHaveSameUsername:
                "죄송해요, 이 리플레이 파일의 유저네임은 당신이 바인딩된 osu!droid 계정의 유저네임과 달라요!",
            replayTooOld:
                "죄송해요, 이 리플레이 형식의 버전이 너무 오래됐어요!",
            manualSubmissionConfirmation:
                "수동 제출을 확인받기 위해선 스태프 멤버에게 부탁하세요!",
            aboutTitle: "osu!droid 데일리/위클리 챌린지",
            aboutDescription:
                "이건 여러분에게 일간, 주간 챌린지를 제공해 주는 시스템이에요. 챌린지를 완료하면 포인트와 %s앨리스 코인을 획득할 수 있어요! ",
            aboutQuestion1: "어떻게 작동하나요?",
            aboutAnswer1:
                "매일 새로운 데일리 챌린지가 나와요. 각각의 챌린지는 난이도를 기반으로 다른 양의 포인트가 부여돼요. 챌린지를 통과함으로써 포인트와 %s앨리스 코인을 얻을 수 있어요. 각 챌린지에는 몇몇 보너스 미션도 있는데, 완료하면 더 많은 포인트와 %s앨리스 코인을 받을 수 있어요! 각각의 챌린지 보너스 레벨은 2 챌린지 포인트로 변환되며, 이것도 역시 %s`4`앨리스 코인으로 변환돼요.\n\n위클리 챌린지는 일주일에 한번만 가능한데, 데일리 챌린지들보다 상당히 어렵기 때문에 더 많은 포인트와 %s앨리스 코인을 줘요. 이는 일주일의 기간을 주는 이유이기도 하죠!",
            aboutQuestion2: "어떻게 챌린지 기록을 제출하나요?",
            aboutAnswer2:
                "기존 맵을 이미 플레이 했을 경우를 고려해서, 다운로드 받을 수 있는 별개의 비트맵이 제공돼요. 사실, 챌린지 달성을 인정받을 수 있는 기록을 제출하려면 **반드시** 이 비트맵을 다운로드해서 플레이해야 해요.\n\n챌린지를 완료하면, 기록을 제출하기 위해 `/daily submit` 명령어를 사용 해 주세요.",
            aboutQuestion3: "포인트와 앨리스 코인은 어디에 쓰나요?",
            aboutAnswer3:
                "현재로서는, 포인트는 사용처가 없어요. 하지만, %s앨리스 코인은 클랜과 치장을 위해 사용할 수 있어요.",
            aboutQuestion4: "포인트와 앨리스 코인의 리더보드가 있나요?",
            aboutAnswer4:
                "%s앨리스 코인 리더보드는 없지만, 포인트 리더보드는 있어요. `/daily leaderboard`를 사용하시면 리더보드를 볼 수 있어요.",
            aboutQuestion5: "여기서 언급되지 않은 질문이 더 있어요!",
            aboutAnswer5:
                "<@386742340968120321>에게 데일리, 위클리 챌린지에 관한 더 많은 정보를 물어보실 수 있어요.",
            username: "",
            uid: "",
            points: "",
            scoreStatistics: "",
            totalScore: "",
            maxCombo: "",
            accuracy: "",
            rank: "",
            time: "",
            hitGreat: "",
            hitGood: "",
            hitMeh: "",
            misses: "",
            bonusLevelReached: "",
            geki: "",
            katu: "",
            profile: "",
            challengesCompleted: "",
            statistics: "",
        },
    };
}
