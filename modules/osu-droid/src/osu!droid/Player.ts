import { Score } from './Score';
import { MD5 } from 'crypto-js';
import { DroidAPIRequestBuilder, RequestResponse } from '../utils/APIRequestBuilder';

interface ExtraInformation {
    readonly rank: number;
    readonly recent: {
        readonly filename: string;
        readonly score: number;
        readonly scoreid: number;
        readonly combo: number;
        readonly mark: string;
        readonly mode: string;
        readonly accuracy: number;
        readonly perfect: number;
        readonly good: number;
        readonly bad: number;
        readonly miss: number;
        readonly date: number;
        readonly hash: string;
    }[];
}

/**
 * Represents an osu!droid player.
 */
export class Player {
    /**
     * The uid of the player.
     */
    uid: number = 0;

    /**
     * The username of the player.
     */
    username: string = "";

    /**
     * The avatar URL of the player.
     */
    avatarURL: string = "";

    /**
     * The location of the player based on ISO 3166-1 country codes. See {@link https://en.wikipedia.org/wiki/ISO_3166-1 this} Wikipedia page for more information.
     */
    location: string = "";

    /**
     * The email that is attached to the player's account.
     */
    email: string = "";

    /**
     * The overall rank of the player.
     */
    rank: number = 0;

    /**
     * The total score of the player.
     */
    score: number = 0;

    /**
     * The overall accuracy of the player.
     */
    accuracy: number = 0;

    /**
     * The amount of times the player has played.
     */
    playCount: number = 0;

    /**
     * Recent plays of the player.
     */
    readonly recentPlays: Score[] = [];

    /**
     * Whether or not the fetch result from `getInformation()` returns an error. This should be immediately checked after calling said method.
     */
    error: boolean = false;

    /**
     * Retrieves a player's info based on uid or username.
     * 
     * Either uid or username must be specified.
     */
    static getInformation(params: {
        uid?: number,
        username?: string
    }): Promise<Player> {
        return new Promise(async resolve => {
            const player: Player = new Player();
            const uid = params.uid;
            const username = params.username;
            if (!Number.isInteger(uid as number) && !username) {
                console.log("Uid must be integer or enter username");
                return resolve(player);
            }

            const apiRequestBuilder: DroidAPIRequestBuilder = new DroidAPIRequestBuilder()
                .setEndpoint("getuserinfo.php");
            if (uid) {
                apiRequestBuilder.addParameter("uid", uid);
            } else if (username) {
                apiRequestBuilder.addParameter("username", username);
            }

            const result: RequestResponse = await apiRequestBuilder.sendRequest();
            if (result.statusCode !== 200) {
                console.log("Error retrieving player data");
                player.error = true;
                return resolve(player);
            }

            const resArr: string[] = result.data.toString("utf-8").split("<br>");
            const headerRes: string[] = resArr[0].split(" ");

            if (headerRes[0] === "FAILED") {
                console.log("Player not found");
                return resolve(player);
            }

            const obj: ExtraInformation = JSON.parse(resArr[1]);

            player.uid = parseInt(headerRes[1]);
            player.username = headerRes[2];
            player.score = parseInt(headerRes[3]);
            player.playCount = parseInt(headerRes[4]);
            player.accuracy = parseFloat((parseFloat(headerRes[5]) * 100).toFixed(2));
            player.email = headerRes[6];
            player.location = headerRes[7];
            player.avatarURL = `https://secure.gravatar.com/avatar/${MD5(player.email.trim().toLowerCase()).toString()}?s=200`;
            player.rank = obj.rank;

            const recent: ExtraInformation["recent"] = obj.recent;
            for (const play of recent) {
                player.recentPlays.push(
                    new Score({
                        uid: player.uid,
                        username: player.username,
                        scoreID: play.scoreid,
                        score: play.score,
                        accuracy: parseFloat((play.accuracy / 1000).toFixed(2)),
                        hit300: play.perfect,
                        hit100: play.good,
                        hit50: play.bad,
                        miss: play.miss,
                        rank: play.mark,
                        combo: play.combo,
                        title: play.filename,
                        date: (play.date + 3600 * 7) * 1000,
                        mods: play.mode,
                        hash: play.hash
                    })
                );
            }
            resolve(player);
        });
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `Username: ${this.username}\nUID: ${this.uid}\nRank: ${this.rank}\nScore: ${this.score}\nPlay count: ${this.playCount}`;
    }
}