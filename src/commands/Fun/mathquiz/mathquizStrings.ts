/**
 * Strings for the `mathquiz` command.
 */
export enum mathquizStrings {
    userStillHasActiveGame = "Hey, you still have an equation to solve! Please solve that one first before creating another equation!",
    invalidDifficultyLevel = "I'm sorry, that's an invalid difficulty level!",
    difficultyLevelOutOfRange = "I'm sorry, difficulty level range is from %s to %s!",
    invalidOperatorAmount = "I'm sorry, that's an invalid operator amount!",
    operatorAmountOutOfRange = "I'm sorry, operator amount range is from %s to %s!",
    equationGeneratorError = "I'm sorry, the equation generator had problems generating your equation, please try again!",
    equationQuestion = "%s, here is your equation:\n`Operator count %s, level %s`\n```fix\n%s = ...```You have 30 seconds to solve it.",
    correctAnswer = "%s, your answer is correct! It took you %ss!\n```fix\n%s = %s```",
    wrongAnswer = "%s, timed out. The correct answer is:\n```fix\n%s = %s```"
}