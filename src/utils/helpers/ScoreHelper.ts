import { DroidAPIRequestBuilder, RequestResponse } from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";

/**
 * A helper for global score-related things.
 */
export abstract class ScoreHelper {
    /**
     * Retrieves the leaderboard of a beatmap.
     * 
     * @param hash The MD5 hash of the beatmap.
     * @param page The page to retrieve. Defaults to 1.
     */
    static async fetchDroidLeaderboard(
        hash: string,
        page: number = 1
    ): Promise<Score[]> {
        const apiRequestBuilder: DroidAPIRequestBuilder = new DroidAPIRequestBuilder()
            .setEndpoint("scoresearchv2.php")
            .addParameter("hash", hash)
            .addParameter("page", Math.max(0, page - 1));

        const result: RequestResponse = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            throw new Error("Droid API request failed");
        }

        const data: string[] = result.data.toString("utf-8").split("<br>");

        data.shift();

        return data.map((v) => new Score().fillInformation(v));
    }

    /**
     * Checks if a player has played the verification beatmap.
     * 
     * @param uid The uid of the player.
     */
    static async hasPlayedVerificationMap(
        uid: number
    ): Promise<boolean> {
        const score: Score = await Score.getFromHash({
            uid: uid,
            hash: "0eb866a0f36ce88b21c5a3d4c3d76ab0",
        });

        return !!score.title;
    }
}