import { Translation } from "@alice-localization/base/Translation";
import {
    bold,
    chatInputApplicationCommandMention,
    userMention,
} from "discord.js";
import { DailyStrings } from "../DailyLocalization";

/**
 * The English translation for the `daily` command.
 */
export class DailyENTranslation extends Translation<DailyStrings> {
    override readonly translations: DailyStrings = {
        tooManyOptions:
            "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        noOngoingChallenge: "I'm sorry, there is no ongoing challenge now!",
        challengeNotFound: "I'm sorry, I cannot find the challenge!",
        challengeFromReplayNotFound:
            "I'm sorry, I cannot find the challenge associated with that replay!",
        startChallengeFailed: "I'm sorry, I couldn't start the challenge: %s.",
        startChallengeSuccess: "Successfully started challenge `%s`.",
        userHasPlayedChallenge:
            "The player has played challenge `%s` with highest bonus level achieved `%s`.",
        userHasNotPlayedChallenge: "The player has not played challenge `%s`.",
        userHasNotPlayedAnyChallenge:
            "I'm sorry, this user has not played any challenges at all!",
        scoreNotFound: "I'm sorry, you haven't played the challenge beatmap!",
        challengeIsOngoing:
            "I'm sorry, this challenge has either started or ended!",
        challengeNotOngoing:
            "I'm sorry, this challenge has not been started or has ended!",
        challengeNotCompleted:
            "I'm sorry, you did not complete the ongoing challenge: %s.",
        challengeCompleted:
            "Congratulations! You have completed challenge `%s` with challenge bonus level `%s`, earning `%s` point(s) and `%s` Alice coins! You now have `%s` point(s) and `%s` Alice coins.",
        replayDownloadFail: "I'm sorry, I couldn't download your replay!",
        replayInvalid:
            "Hey, please provide the proper download link to your replay!",
        replayDoesntHaveSameUsername:
            "I'm sorry, that replay file does not contain the same username as your binded osu!droid account!",
        replayTooOld: "I'm sorry, that replay's format version is too old!",
        manualSubmissionConfirmation:
            "Please ask a staff member to confirm your manual submission!",
        invalidChallengeId:
            'I\'m sorry, challenge IDs need to start with "d" (for daily) or "w" (for weekly)!',
        challengeWithIdExists: "I'm sorry, a challenge with that ID exists!",
        noBeatmapProvided: "Hey, please enter a valid beatmap!",
        beatmapNotFound:
            "Hey, I cannot find the beatmap with the provided link or ID!",
        passValueOutOfRange:
            "Hey, that pass value is out of range! It must be between %s and %s.",
        bonusValueOutOfRange:
            "Hey, that bonus value is out of range! It must be between %s and %s.",
        unrankedModsIncluded: "Hey, you cannot include unranked mods!",
        noBonuses: "I'm sorry, this challenge doesn't have any bonus!",
        noDownloadLink: "Hey, please set a beatmapset download link first!",
        beatmapDownloadFailed:
            "I'm sorry, I couldn't download the beatmap of the challenge!",
        addNewChallengeFailed: "I'm sorry, I couldn't add a new challenge: %s.",
        addNewChallengeSuccess: "Successfully added challenge `%s`.",
        modifyBonusFailed: "I'm sorry, I couldn't modify the bonus: %s",
        modifyBonusSuccess:
            "Successfully modified challenge `%s` bonus type `%s` level `%s` to `%s`.",
        modifyBeatmapFailed: "I'm sorry, I couldn't change the beatmap: %s.",
        modifyBeatmapSuccess:
            "Successfully changed challenge `%s`'s beatmap to `%s`.",
        deleteChallengeFailed:
            "I'm sorry, I couldn't delete the challenge: %s.",
        deleteChallengeSuccess: "Successfully deleted challenge `%s`.",
        setConstrainFailed: "I'm sorry, I couldn't set the constrain: %s.",
        setConstrainSuccess:
            "Successfully set the constrain of challenge `%s` to `%s`.",
        setDownloadLinkFailed:
            "I'm sorry, I couldn't set the download link: %s.",
        setDownloadLinkSuccess:
            "Successfully set download link of challenge `%s` to `%s`.",
        setPassReqFailed: "I'm sorry, I couldn't set the pass requirement: %s.",
        setPassReqSuccess:
            "Successfully set challenge `%s` pass requirement to type `%s` with value `%s`.",
        setPointsFailed: "I'm sorry, I couldn't set the points: %s.",
        setPointsSuccess:
            "Successfully set points awarded for completing challenge `%s` to `%s`.",
        setFeaturedFailed: "I'm sorry, I couldn't set the featured user: %s.",
        setFeaturedSuccess:
            "Successfully set the featured user of challenge `%s` to `%s`.",
        aboutTitle: "osu!droid Daily/Weekly Challenges",
        aboutDescription:
            "This is a system that provides daily and weekly challenges for you to complete. Gain points and %sAlice coins as you complete challenges!",
        aboutQuestion1: "How does it work?",
        aboutAnswer1:
            "Every day, there will be a new daily challenge to complete. Each challenges grant a different amount of points depending on how hard the challenge is. You can get points and %sAlice coins by passing the challenge. There will be a few bonuses that allows you to gain more points and %sAlice coins, too! Each challenge bonus level converts to 2 challenge points, which also converts to %s`4` Alice coins.\n\nThe weekly bounty challenge, which is only available once per week, grants more points and %sAlice coins as this challenge is considerably harder than any daily challenges. That's also why you have a week to complete it, too!",
        aboutQuestion2: "How can I submit challenges?",
        aboutAnswer2: `There will be a separate beatmap set for you to download in case you have played the original map. In fact, you ${bold(
            "must"
        )} download the set in order to submit your play.\n\nOnce you complete a challenge, use the ${chatInputApplicationCommandMention(
            "daily",
            "submit",
            "889506666498895942"
        )} command to submit your play.`,
        aboutQuestion3: "How can I use my points and Alice coins?",
        aboutAnswer3:
            "As of now, there is no use for points. However, %sAlice coins can be used for clans and cosmetics.",
        aboutQuestion4: "Is there a leaderboard for points and Alice coins?",
        aboutAnswer4: `There is no leaderboard for %sAlice coins, however there is a leaderboard for points. You can use ${chatInputApplicationCommandMention(
            "daily",
            "leaderboard",
            "889506666498895942"
        )} to view the leaderboard.`,
        aboutQuestion5: "I have more questions that are not mentioned in here!",
        aboutAnswer5: `You can ask ${userMention(
            "386742340968120321"
        )} for more information about daily and weekly challenges.`,
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
        none: "None",
    };
}
