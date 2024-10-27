import { AnniversaryTriviaCurrentAttemptQuestion } from "@structures/utils/AnniversaryTriviaCurrentAttemptQuestion";
import { BaseDocument } from "../BaseDocument";
import { AnniversaryTriviaAttempt } from "@structures/utils/AnniversaryTriviaAttempt";

/**
 * Represents a player in the anniversary trivia game.
 */
export interface DatabaseAnniversaryTriviaPlayer extends BaseDocument {
    /**
     * The Discord ID of the player.
     */
    readonly discordId: string;

    /**
     * The answers of current attempt, if any.
     */
    readonly currentAttempt?: AnniversaryTriviaCurrentAttemptQuestion[];

    /**
     * Past attempts.
     */
    readonly pastAttempts: AnniversaryTriviaAttempt[];

    /**
     * Past attempts from the event duration.
     */
    readonly pastEventAttempts: AnniversaryTriviaAttempt[];
}
