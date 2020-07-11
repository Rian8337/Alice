const MapStats = require('./MapStats');
const Parser = require('./Parser');
const StandardDiff = require('./StandardDiff');
const mods = require('./mods');

/**
 * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
 */
class MapStars {
    constructor() {
        /**
         * @type {StandardDiff}
         * @description The osu!droid star rating of the beatmap.
         */
        this.droid_stars = new StandardDiff();

        /**
         * @type {StandardDiff}
         * @description The osu!standard star rating of the beatmap.
         */
        this.pc_stars = new StandardDiff()
    }

    /**
     * Calculates the star rating of a map.
     * 
     * The beatmap will be automatically parsed using parser utilities.
     *
     * @param {Object} params An object containing the parameters.
     * @param {string} params.file The `.osu` file of the map.
     * @param {string} [params.mods] The applied mods.
     * @returns {MapStars} The current instance, which contains the results.
     */
    calculate(params) {
        let osu_file = params.file;
        if (!osu_file) {
            console.log("Invalid osu file");
            return this
        }
        let pmod = params.mods;
        if (!pmod) {
            pmod = '';
        }

        let nparser = new Parser();
        let pcparser = new Parser();
        try {
            nparser.parse(osu_file);
            pcparser.parse(osu_file)
        } catch (e) {
            console.log("Invalid osu file");
            return this
        }
        let nmap = nparser.map;
        let pcmap = pcparser.map;

        let stats = new MapStats({
            cs: nmap.cs,
            ar: nmap.ar,
            od: nmap.od,
            hp: nmap.hp,
            mods: pmod
        }).calculate({mode: "droid"});

        let droid_mod = mods.modbits_from_string(pmod);
        if (!(droid_mod & mods.td)) {
            droid_mod += mods.td
        }
        droid_mod -= droid_mod & (mods.hr | mods.ez);
        if (pmod.includes("SU")) {
            droid_mod -= droid_mod & mods.speed_changing
        }
        droid_mod = mods.modbits_to_string(droid_mod);
        if (pmod.includes("SU")) {
            droid_mod += "SU"
        }

        nmap.cs = stats.cs;
        nmap.ar = stats.ar;
        nmap.od = stats.od;

        this.droid_stars.calculate({mode: "droid", map: nmap, mods: droid_mod});
        this.pc_stars.calculate({mode: "osu", map: pcmap, mods: pmod});

        return this
    }

    /**
     * Returns a string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return `${this.droid_stars.toString()}\n${this.pc_stars.toString()}`
    }
}

module.exports = MapStars;