import { mods } from '../utils/mods';
import { DroidAPIRequestBuilder, RequestResponse } from '../utils/APIRequestBuilder';

interface ScoreInformation {
    /**
     * The uid of the player.
     */
    uid?: number;

    /**
     * The ID of the score.
     */
    scoreID?: number;

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
    date: Date|number;

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
     * MD5 hash of the play.
     */
    hash: string;
}

/**
 * Represents an osu!droid score.
 */
export class Score implements ScoreInformation {
    uid: number;
    scoreID: number;
    username: string;
    title: string;
    combo: number;
    score: number;
    rank: string;
    date: Date;
    accuracy: number;
    miss: number;
    mods: string;
    hash: string;

    /**
     * Enabled modifications in the play in osu!standard format.
     */
    droidMods: string;

    /**
     * Whether or not the fetch result from `getFromHash()` returns an error. This should be immediately checked after calling said method.
     */
    error: boolean = false;

    constructor(values?: ScoreInformation) {
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
    }

    /**
     * Retrieves play information.
     * 
     * @param values Function parameters.
     */
    static getFromHash(params: {
        /**
         * The uid of the player.
         */
        uid: number,

        /**
         * The MD5 hash to retrieve.
         */
        hash: string
    }): Promise<Score> {
        return new Promise(async resolve => {
            const score = new Score();
            const uid: number = score.uid = params.uid;
            const hash: string = score.hash = params.hash;

            if (!uid || !hash) {
                console.log("Uid and hash must be specified");
                return resolve(score);
            }

            const apiRequestBuilder: DroidAPIRequestBuilder = new DroidAPIRequestBuilder();
            apiRequestBuilder.setEndpoint("scoresearchv2.php")
                .addParameter("uid", uid)
                .addParameter("hash", hash);

            const result: RequestResponse = await apiRequestBuilder.sendRequest();
            if (result.statusCode !== 200) {
                console.log("Error retrieving score data");
                return resolve(score);
            }

            const entry: string[] = result.data.toString("utf-8").split("<br>");
            entry.shift();
            if (entry.length === 0) {
                console.log("No play found");
                return resolve(score);
            }
            score.fillInformation(entry[0]);
            resolve(score);
        });
    }

    /**
     * Fills this instance with score information.
     * 
     * @param info The score information to fill with.
     */
    fillInformation(info: string): Score {
        const play: string[] = info.split(" ");
            
        this.scoreID = parseInt(play[0]);
        this.username = play[2];
        this.score = parseInt(play[3]);
        this.combo = parseInt(play[4]);
        this.rank = play[5];
        this.mods = mods.droidToPC(play[6]);
        this.accuracy = parseFloat((parseFloat(play[7]) / 1000).toFixed(2));
        this.miss = parseInt(play[8]);
        const date: Date = new Date(parseInt(play[9]) * 1000);
        date.setUTCHours(date.getUTCHours() + 7);
        this.date = date;
        this.title = play[10].substring(0, play[10].length - 4).replace(/_/g, " ");
        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `Player: ${this.username}, uid: ${this.uid}, title: ${this.title}, score: ${this.score}, combo: ${this.combo}, rank: ${this.rank}, acc: ${this.accuracy}%, miss: ${this.miss}, date: ${this.date}, mods: ${this.mods}, hash: ${this.hash}`;
    }
}