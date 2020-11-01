import { Score } from './Score';
import { MD5 } from 'crypto-js';
import * as request from 'request';
import { config } from 'dotenv';
config();
const droidapikey: string = process.env.DROID_API_KEY as string;

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
        readonly miss: number;
        readonly date: number;
        readonly hash: string;
    }[]
}

/**
 * Represents an osu!droid player.
 */
export class Player {
    /**
     * The uid of the player.
     */
    uid: number;

    /**
     * The username of the player.
     */
    username: string;

    /**
     * The avatar URL of the player.
     */
    avatarURL: string;

    /**
     * The location of the player based on ISO 3166-1 country codes. See {@link https://en.wikipedia.org/wiki/ISO_3166-1 this} Wikipedia page for more information.
     */
    location: string;

    /**
     * The email that is attached to the player's account.
     */
    email: string;

    /**
     * The overall rank of the player.
     */
    rank: number;

    /**
     * The total score of the player.
     */
    score: number;

    /**
     * The overall accuracy of the player.
     */
    accuracy: number;

    /**
     * The amount of times the player has played.
     */
    playCount: number;

    /**
     * Recent plays of the player.
     */
    readonly recentPlays: Score[];

    /**
     * Whether or not the fetch result from `getInformation()` returns an error. This should be immediately checked after calling said method.
     */
    error: boolean;

    constructor() {
        this.uid = 0;
        this.rank = 0;
        this.score = 0;
        this.accuracy = 0;
        this.playCount = 0;

        this.username = "";
        this.avatarURL = "";
        this.location = "";
        this.email = "";
        this.error = false;
        this.recentPlays = [];
    }

    /**
     * Retrieves a player's info based on uid or username.
     * 
     * Either uid or username must be specified.
     */
    static getInformation(params: {
        uid?: number,
        username?: string
    }): Promise<Player> {
        return new Promise(resolve => {
            const player: Player = new Player();
            const uid = params.uid;
            const username = params.username;
            if (isNaN(uid as number) && !username) {
                console.log("Uid must be integer or enter username");
                return resolve(player);
            }

            const options: string = `http://ops.dgsrz.com/api/getuserinfo.php?apiKey=${droidapikey}&${uid ? `uid=${uid}` : `username=${encodeURIComponent(username as string)}`}`;
            
            request(options, (err, response, data) => {
                if (err || response.statusCode !== 200) {
                    console.log("Error retrieving player data");
                    player.error = true;
                    return resolve(player);
                }

                const resArr: string[] = (data as string).split("<br>");
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
                            scoreID: play.scoreid,
                            score: play.score,
                            accuracy: parseFloat((play.accuracy / 1000).toFixed(2)),
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
        });
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `Username: ${this.username}\nUID: ${this.uid}\nRank: ${this.rank}\nScore: ${this.score}\nPlay count: ${this.playCount}`;
    }
}