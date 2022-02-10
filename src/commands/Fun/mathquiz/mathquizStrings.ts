/**
 * Strings for the `mathquiz` command.
 */
export enum mathquizStrings {
    userStillHasActiveGame = "Hey, you still have an equation to solve! Please solve that one first before creating another equation!",
    equationGeneratorError = "I'm sorry, the equation generator had problems generating your equation, please try again!",
    equationQuestion = "%s, here is your equation:\n`Operator count %s, level %s`\n```fix\n%s = ...```You have 30 seconds to solve it.",
    correctAnswer = "%s, your answer is correct! It took you %ss!\n```fix\n%s = %s```",
    wrongAnswer = "%s, timed out. The correct answer is:\n```fix\n%s = %s```",
}
