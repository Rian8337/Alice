const CursorData = require('./CursorData');
const ReplayObjectData = require('./ReplayObjectData');

class ReplayData {
    /**
     * @param {Object} values An object containing the parameters.
     * @param {number} values.replay_version The version of the replay.
     * @param {string} values.folder_name The folder name containing the beatmap played.
     * @param {string} values.file_name The file name of the beatmap played.
     * @param {string} values.hash MD5 hash of the replay.
     * @param {number} values.date The epoch date of which the play was set in milliseconds. This will be automatically converted into a `Date` object.
     * @param {number} values.hit300k The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
     * @param {number} values.hit300 The amount of 300s achieved in the play.
     * @param {number} values.hit100k The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
     * @param {number} values.hit100 The amount of 100s achieved in the play.
     * @param {number} values.hit50 The amount of 50s achieved in the play.
     * @param {number} values.hit0 The amount of misses achieved in the play.
     * @param {number} values.score The total score achieved in the play.
     * @param {number} values.max_combo The maximum combo achieved in the play.
     * @param {number} values.accuracy The accuracy achieved in the play.
     * @param {number} values.is_full_combo Whether or not the play achieved the beatmap's maximum combo (1 for `true`, 0 for `false`).
     * @param {string} values.player_name The name of the player in the replay.
     * @param {string} values.mods Enabled modifications in the replay.
     * @param {CursorData[]} values.cursor_movement The cursor movement data of the replay.
     * @param {ReplayObjectData[]} values.hit_object_data The hitobject data of the replay.
     */
    constructor(values = {}) {
        /**
         * @type {number}
         * @description The version of the replay.
         */
        this.replay_version = values.replay_version;

        /**
         * @type {string}
         * @description The folder name containing the beatmap played.
         */
        this.folder_name = values.folder_name;
        
        /**
         * @type {string}
         * @description The file name of the beatmap played.
         */
        this.file_name = values.file_name;

        /**
         * @type {string}
         * @description MD5 hash of the replay.
         */
        this.hash = values.hash;

        /**
         * @type {Date}
         * @description The date of which the play was set.
         */
        this.time = new Date(values.time);

        /**
         * @type {number}
         * @description The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         */
        this.hit300k = values.hit300k;

        /**
         * @type {number}
         * @description The amount of 300s achieved in the play.
         */
        this.hit300 = values.hit300;

        /**
         * @type {number}
         * The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         */
        this.hit100k = values.hit100k;

        /**
         * @type {number}
         * @description The amount of 100s achieved in the play.
         */
        this.hit100 = values.hit100;

        /**
         * @type {number}
         * @description The amount of 50s achieved in the play.
         */
        this.hit50 = values.hit50;

        /**
         * @type {number}
         * @description The amount of misses achieved in the play.
         */
        this.hit0 = values.hit0;

        /** 
         * @type {number}
         * @description The total score achieved in the play.
         */
        this.score = values.score;

        /**
         * @type {number}
         * @description The maximum combo achieved in the play.
         */
        this.max_combo = values.max_combo;

        /**
         * @type {number}
         * @description The accuracy achieved in the play.
         */
        this.accuracy = values.accuracy;

        /**
         * @type {number}
         * @description Whether or not the play achieved the beatmap's maximum combo (1 for `true`, 0 for `false`).
         */
        this.is_full_combo = values.is_full_combo;

        /**
         * @type {number}
         * @description The name of the player in the replay.
         */
        this.player_name = values.player_name;

        /** 
         * @type {string}
         * @description Enabled modifications during the play.
         */
        this.mods = values.mods;

        /**
         * @type {CursorData[]}
         * @description The cursor movement data of the replay.
         */
        this.cursor_movement = values.cursor_movement;

        /**
         * @type {ReplayObjectData[]}
         * @description The hit object data of the replay.
         */
        this.hit_object_data = values.hit_object_data
    }
}

module.exports = ReplayData;