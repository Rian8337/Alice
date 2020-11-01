import * as request from 'request';
import { mods } from '../utils/mods';
import { config } from 'dotenv';
config();
const droidapikey: string = process.env.DROID_API_KEY as string;

/**
 * Represents an osu!droid score.
 */
export class Score {
    /**
     * The uid of the player.
     */
    uid: number;

    /**
     * The ID of the score.
     */
    scoreID: number;

    /**
     * The player's name.
     */
    username: string;

    /**
     * The title of the beatmap.
     */
    title: string;

    /**
     * The maximum combo achieved in the play.
     */
    combo: number;

    /**
     * The score achieved in the play.
     */
    score: number;

    /**
     * The rank achieved in the play.
     */
    rank: string;

    /**
     * The date of which the play was set.
     */
    date: Date;

    /**
     * The accuracy achieved in the play.
     */
    accuracy: number;

    /**
     * The amount of misses achieved in the play.
     */
    miss: number;

    /**
     * Enabled modifications in the play in osu!standard format.
     */
    mods: string;

    /**
     * Enabled modifications in the play in osu!droid format.
     */
    droidMods: string;

    /**
     * MD5 hash of the play.
     */
    hash: string;

    /**
     * Whether or not the fetch result from `getFromHash()` returns an error. This should be immediately checked after calling said method.
     */
    error: boolean;

    constructor(values?: {
        uid?: number,
        scoreID?: number,
        username?: string,
        title?: string,
        combo?: number,
        score?: number,
        rank?: string,
        date?: number,
        accuracy?: number,
        miss?: number,
        mods?: string,
        hash?: string
    }) {
        this.uid = values?.uid || 0;
        this.scoreID = values?.scoreID || 0;
        this.username = values?.username || "";
        this.title = values?.title || "";
        this.combo = values?.combo || 0;
        this.score = values?.score || 0;
        this.rank = values?.rank || '';
        this.date = new Date(values?.date || 0);
        this.accuracy = values?.accuracy || 0;
        this.miss = values?.miss || 0;
        this.droidMods = values?.mods || "";
        this.mods = mods.droidToPC(this.droidMods);
        this.hash = values?.hash || '';
        this.error = false;
    }

    /**
     * Retrieves play information.
     */
    static getFromHash(params?: {
        uid: number,
        hash: string
    }): Promise<Score> {
        return new Promise(resolve => {
            const score: Score = new Score();
            const uid: number = score.uid = params?.uid || score.uid;
            const hash: string = score.hash = params?.hash || score.hash;

            if (!uid || !hash) {
                console.log("Uid and hash must be specified");
                return resolve(score);
            }

            const options: string = `http://ops.dgsrz.com/api/scoresearchv2.php?apiKey=${droidapikey}&uid=${uid}&hash=${hash}`;
            request(options, (err, response, data) => {
                if (err || response.statusCode !== 200) {
                    console.log("Error retrieving score data");
                    return resolve(score);
                }
                const entry: string[] = (data as string).split("<br>");
                entry.shift();
                if (entry.length === 0) {
                    console.log("No play found");
                    return resolve(score);
                }
                const play: string[] = entry[0].split(" ");
                
                score.scoreID = parseInt(play[0]);
                score.username = play[2];
                score.score = parseInt(play[3]);
                score.combo = parseInt(play[4]);
                score.rank = play[5];
                score.mods = mods.droidToPC(play[6]);
                score.accuracy = parseFloat((parseFloat(play[7]) / 1000).toFixed(2));
                score.miss = parseInt(play[8]);
                const date = new Date(parseInt(play[9]) * 1000);
                date.setUTCHours(date.getUTCHours() + 7);
                score.date = date;
                score.title = play[10].substring(0, play[10].length - 4).replace(/_/g, " ");
                resolve(score);
            });
        });
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `Player: ${this.username}, uid: ${this.uid}, title: ${this.title}, score: ${this.score}, combo: ${this.combo}, rank: ${this.rank}, acc: ${this.accuracy}%, miss: ${this.miss}, date: ${this.date}, mods: ${this.mods}, hash: ${this.hash}`;
    }
}