import { Score } from './Score';
import { MD5 } from 'crypto-js';
import * as request from 'request';
import { config } from 'dotenv';
config();
const droidapikey: string = process.env.DROID_API_KEY as string;

interface ExtraInformation {
    rank: number;
    recent: {
        filename: string;
        score: number;
        scoreid: number;
        combo: number;
        mark: string;
        mode: string;
        accuracy: number;
        miss: number;
        date: number;
        hash: string;
    }[]
}

/**
 * Represents an osu!droid player.
 */
export class Player {
    /**
     * The uid of the player.
     */
    public uid: number;

    /**
     * The username of the player.
     */
    public username: string;

    /**
     * The avatar URL of the player.
     */
    public avatarURL: string;

    /**
     * The location of the player based on ISO 3166-1 country codes. See {@link https://en.wikipedia.org/wiki/ISO_3166-1 this} Wikipedia page for more information.
     */
    public location: string;

    /**
     * The email that is attached to the player's account.
     */
    public email: string;

    /**
     * The overall rank of the player.
     */
    public rank: number;

    /**
     * The total score of the player.
     */
    public score: number;

    /**
     * The overall accuracy of the player.
     */
    public accuracy: number;

    /**
     * The amount of times the player has played.
     */
    public playCount: number;

    /**
     * Recent plays of the player.
     */
    public readonly recentPlays: Score[];

    /**
     * Whether or not the fetch result from `getInformation()` returns an error. This should be immediately checked after calling said method.
     */
    public error: boolean;

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
    getInformation(params: {
        uid?: number,
        username?: string
    }): Promise<Player> {
        return new Promise(resolve => {
            const uid = params.uid;
            const username = params.username;
            if (isNaN(uid as number) && !username) {
                console.log("Uid must be integer or enter username");
                return resolve(this);
            }

            const options: string = `http://ops.dgsrz.com/api/getuserinfo.php?apiKey=${droidapikey}&${uid ? `uid=${uid}` : `username=${encodeURIComponent(username as string)}`}`;
            
            request(options, (err, response, data) => {
                if (err || response.statusCode !== 200) {
                    console.log("Error retrieving player data");
                    this.error = true;
                    return resolve(this);
                }

                const resArr: string[] = (data as string).split("<br>");
                const headerRes: string[] = resArr[0].split(" ");

                if (headerRes[0] === "FAILED") {
                    console.log("Player not found");
                    return resolve(this);
                }

                const obj: ExtraInformation = JSON.parse(resArr[1]);

                this.uid = parseInt(headerRes[1]);
                this.username = headerRes[2];
                this.score = parseInt(headerRes[3]);
                this.playCount = parseInt(headerRes[4]);
                this.accuracy = parseFloat((parseFloat(headerRes[5]) * 100).toFixed(2));
                this.email = headerRes[6];
                this.location = headerRes[7];
                this.avatarURL = `https://secure.gravatar.com/avatar/${MD5(this.email.trim().toLowerCase()).toString()}?s=200`;
                this.rank = obj.rank;

                const recent: ExtraInformation["recent"] = obj.recent;
                for (const play of recent) {
                    this.recentPlays.push(
                        new Score({
                            uid: this.uid,
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
                resolve(this);
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