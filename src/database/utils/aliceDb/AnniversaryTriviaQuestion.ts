import { DatabaseManager } from "@database/DatabaseManager";
import { DatabaseAnniversaryTriviaQuestion } from "@structures/database/aliceDb/DatabaseAnniversaryTriviaQuestion";
import { Manager } from "@utils/base/Manager";

/**
 * Represents a question for the anniversary trivia game.
 */
export class AnniversaryTriviaQuestion
    extends Manager
    implements DatabaseAnniversaryTriviaQuestion
{
    readonly id: number;
    readonly question: string;
    readonly answers: string[];
    readonly correctAnswer: string;
    readonly marks: number;

    constructor(
        data: DatabaseAnniversaryTriviaQuestion = DatabaseManager.aliceDb
            ?.collections.anniversaryTriviaQuestion.defaultDocument,
    ) {
        super();

        this.id = data.id;
        this.question = data.question;
        this.answers = data.answers;
        this.correctAnswer = data.correctAnswer;
        this.marks = data.marks;
    }
}
