const droidapikey = process.env.DROID_API_KEY;
const request = require('request');
const mods = require('./mods');

/**
 * Represents a play in osu!droid.
 */
class PlayInfo {
    /**
     * @param {Object} values An object containing the parameters.
     * @param {number} [values.uid] The uid of the user.
     * @param {number} [values.score_id] The ID of the score.
     * @param {string} [values.player_name] The player's name.
     * @param {string} [values.title] The title of the beatmap.
     * @param {number} [values.combo] The maximum combo achieved in the play.
     * @param {number} [values.score] The score achieved in the play.
     * @param {string} [values.rank] The rank achieved in the play.
     * @param {number} [values.date] The date of score in milliseconds epoch. This will be automatically converted to a `Date` object.
     * @param {number} [values.accuracy] The accuracy achieved in the play.
     * @param {number} [values.miss] The miss count of the play.
     * @param {string} [values.mods] Mods string of the play. This will be automatically converted to PC mods.
     * @param {string} [values.hash] MD5 hash of the play.
     */
    constructor(values = {}) {
        /**
         * @type {number}
         * @description The uid of the player.
         */
        this.player_uid = values.uid || 0;
        
        /**
         * @type {number}
         * @description The ID of the score.
         */
        this.score_id = values.score_id || 0;

        /**
         * @type {string}
         * @description The player's name.
         */
        this.player_name = values.player_name || '';

        /**
         * @type {string}
         * @description The title of the beatmap.
         */
        this.title = values.title || '';

        /**
         * @type {number}
         * @description The maximum combo achieved in the play.
         */
        this.combo = values.combo || 0;

        /**
         * @type {number}
         * @description The score achieved in the play.
         */
        this.score = values.score || 0;

        /**
         * @type {string}
         * @description The rank achieved in the play.
         */
        this.rank = values.rank || '';

        /**
         * @type {Date}
         * @description The date of which the play was set.
         */
        this.date = new Date(values.date || 0);

        /**
         * @type {number}
         * @description The accuracy achieved in the play.
         */
        this.accuracy = values.accuracy || 0;

        /**
         * @type {number}
         * @description The amount of misses achieved in the play.
         */
        this.miss = values.miss || 0;

        /**
         * @type {string}
         * @description Enabled modifications in the play in osu!standard format.
         */
        this.mods = mods.droid_to_PC(values.mods) || '';

        /**
         * @type {string}
         * @description MD5 hash of the play.
         */
        this.hash = values.hash || '';

        /**
         * @type {boolean}
         * @description Whether or not the fetch result from `getFromHash()` returns an error. This should be immediately checked after calling said method.
         */
        this.error = false;
    }

    /**
     * Retrieves play information.
     *
     * @param {Object} [params] An object containing the parameters.
     * @param {number} params.uid The uid to retrieve. If specified in the constructor, can be omitted.
     * @param {string} params.hash The MD5 hash of the beatmap. If specified in the constructor, can be omitted.
     * @returns {Promise<PlayInfo>} The current instance containing the play information.
     */
    getFromHash(params = {}) {
        return new Promise(resolve => {
            let uid = this.player_uid = this.player_uid || params.uid;
            let hash = this.hash = this.hash || params.hash;
            if (!uid || !hash) {
                throw new TypeError("Uid and hash must be specified");
            }

            let options = `http://ops.dgsrz.com/api/scoresearchv2.php?apiKey=${droidapikey}&uid=${uid}&hash=${hash}`;
            request(options, (err, response, data) => {
                if (err || !data) {
                    console.log("Error retrieving player data");
                    this.error = true;
                    return resolve(this)
                }
                let entry = data.split("<br>");
                entry.shift();
                if (entry.length === 0) {
                    console.log("No play found");
                    return resolve(this)
                }
                let play = entry[0].split(" ");
                this.score_id = parseInt(play[0]);
                this.player_uid = parseInt(play[1]);
                this.player_name = play[2];
                this.score = parseInt(play[3]);
                this.combo = parseInt(play[4]);
                this.rank = play[5];
                this.mods = mods.droid_to_PC(play[6]);
                this.accuracy = parseFloat((play[7] / 1000).toFixed(2));
                this.miss = parseInt(play[8]);
                let date = new Date(parseInt(play[9]) * 1000);
                date.setUTCHours(date.getUTCHours() + 6);
                this.date = date;
                this.title = play[10].substring(0, play[10].length - 4).replace(/_/g, " ");
                this.hash = play[11];
                resolve(this);
            })
        })
    }

    /**
     * Returns a string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return `Player: ${this.player_name}, uid: ${this.player_uid}, title: ${this.title}, score: ${this.score}, combo: ${this.combo}, rank: ${this.rank}, acc: ${this.accuracy}%, miss: ${this.miss}, date: ${this.date}, mods: ${this.mods}, hash: ${this.hash}`
    }
}

module.exports = PlayInfo;