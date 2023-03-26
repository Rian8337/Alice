import { TriviaCachedAnswer } from "./TriviaCachedAnswer";

/**
 * Represents a cached trivia map answer.
 */
export interface TriviaMapCachedAnswer extends TriviaCachedAnswer {
    /**
     * The answer.
     */
    readonly answer: {
        /**
         * The answer for the beatmap's artist.
         */
        artist: string;

        /**
         * The answer for the beatmap's title.
         */
        title: string;
    };

    /**
     * The UNIX time at which the artist answer was submitted, in milliseconds.
     */
    artistAnswerSubmissionTime: number;

    /**
     * The UNIX time at which the title answer was submitted, in milliseconds.
     */
    titleAnswerSubmissionTime: number;

    /**
     * The amount of characters that match with the beatmap's artist.
     */
    artistMatchingCharacterCount: number;

    /**
     * The amount of characters that match with the beatmap's title.
     */
    titleMatchingCharacterCount: number;
}
