import { Translation } from "@localization/base/Translation";
import { MathgameStrings } from "../MathgameLocalization";

/**
 * The English translation for the `mathgame` command.
 */
export class MathgameENTranslation extends Translation<MathgameStrings> {
    override readonly translations: MathgameStrings = {
        userHasOngoingGame:
            "Hey, you still have a game ongoing! Play that one instead!",
        channelHasOngoingGame:
            "Hey, there is a game ongoing in this channel! Play that one instead!",
        gameStartedNotification: "Game started!",
        couldNotFetchEquationGameEnd:
            "Unfortunately, the equation generator could not generate any equation after %s attempts! As a result, the game has ended!",
        noAnswerGameEnd: `Game ended! The correct answer is:\n\`\`\`fix\n%s = %s\`\`\`Game statistics can be found in embed.`,
        singleGamemodeQuestion: `%s, solve this equation within 30 seconds!\n\`Operator count %s, level %s\`\n\`\`\`fix\n%s = ...\`\`\``,
        multiGamemodeQuestion: `Solve this equation within 30 seconds (level %s, %s operator(s))!\n\`\`\`fix\n%s = ...\`\`\``,
        correctAnswer: `%s got the correct answer! That took %s seconds.\n\`\`\`fix\n%s = %s\`\`\``,
        gameStatistics: "Math Game Statistics",
        gameStarter: "Game starter",
        timeStarted: "Time started",
        duration: "Duration",
        levelReached: "Level reached",
        operatorCount: "Operator count",
        level: "Level",
        totalCorrectAnswers: "Total correct answers",
        answers: "answer(s)",
    };
}
