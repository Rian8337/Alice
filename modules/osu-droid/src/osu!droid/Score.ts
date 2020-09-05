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
    public uid: number;

    /**
     * The ID of the score.
     */
    public scoreID: number;

    /**
     * The player's name.
     */
    public username: string;

    /**
     * The title of the beatmap.
     */
    public title: string;

    /**
     * The maximum combo achieved in the play.
     */
    public combo: number;

    /**
     * The score achieved in the play.
     */
    public score: number;

    /**
     * The rank achieved in the play.
     */
    public rank: string;

    /**
     * The date of which the play was set.
     */
    public date: Date;

    /**
     * The accuracy achieved in the play.
     */
    public accuracy: number;

    /**
     * The amount of misses achieved in the play.
     */
    public miss: number;

    /**
     * Enabled modifications in the play in osu!standard format.
     */
    public mods: string;

    /**
     * MD5 hash of the play.
     */
    public hash: string;

    /**
     * Whether or not the fetch result from `getFromHash()` returns an error. This should be immediately checked after calling said method.
     */
    public error: boolean;

    constructor(values: {
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
        this.uid = values.uid || 0;
        this.scoreID = values.scoreID || 0;
        this.username = values.username || "";
        this.title = values.title || "";
        this.combo = values.combo || 0;
        this.score = values.score || 0;
        this.rank = values.rank || '';
        this.date = new Date(values.date || 0);
        this.accuracy = values.accuracy || 0;
        this.miss = values.miss || 0;
        this.mods = mods.droidToPC(values.mods) || '';
        this.hash = values.hash || '';
        this.error = false;
    }

    /**
     * Retrieves play information.
     */
    getFromHash(params?: {
        uid: number,
        hash: string
    }): Promise<Score> {
        return new Promise(resolve => {
            const uid: number = this.uid = params?.uid || this.uid;
            const hash: string = this.hash = params?.hash || this.hash;

            if (!uid || !hash) {
                console.log("Uid and hash must be specified");
                return resolve(this);
            }

            const options: string = `http://ops.dgsrz.com/api/scoresearchv2.php?apiKey=${droidapikey}&uid=${uid}&hash=${hash}`;
            request(options, (err, response, data) => {
                if (err || response.statusCode !== 200) {
                    console.log("Error retrieving score data");
                    return resolve(this);
                }
                const entry: string[] = (data as string).split("<br>");
                entry.shift();
                if (entry.length === 0) {
                    console.log("No play found");
                    return resolve(this);
                }
                const play: string[] = entry[0].split(" ");
                
                this.scoreID = parseInt(play[0]);
                this.username = play[2];
                this.score = parseInt(play[3]);
                this.combo = parseInt(play[4]);
                this.rank = play[5];
                this.mods = mods.droidToPC(play[6]);
                this.accuracy = parseFloat((parseFloat(play[7]) / 1000).toFixed(2));
                this.miss = parseInt(play[8]);
                const date = new Date(parseInt(play[9]) * 1000);
                date.setUTCHours(date.getUTCHours() + 6);
                this.date = date;
                this.title = play[10].substring(0, play[10].length - 4).replace(/_/g, " ");
                resolve(this);
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