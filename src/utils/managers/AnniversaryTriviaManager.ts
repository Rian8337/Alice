import { Manager } from "@alice-utils/base/Manager";
import { CacheManager } from "./CacheManager";
import { DatabaseManager } from "@alice-database/DatabaseManager";

/**
 * A manager for anniversary trivia.
 */
export abstract class AnniversaryTriviaManager extends Manager {
    static readonly maximumMarks = 28;

    static override async init() {
        const questions =
            await DatabaseManager.aliceDb.collections.anniversaryTriviaQuestion.get(
                "id",
            );

        for (const question of questions.values()) {
            CacheManager.anniversaryTriviaQuestions.set(question.id, question);
        }
    }
}
