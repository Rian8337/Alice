const MapPP = require('./MapPP');
const MapStars = require('./MapStars');
const StandardDiff = require('./StandardDiff');

/**
 * @param {Object} params An object containing the parameters.
 * @param {StandardDiff} [params.stars] The star rating instance of the beatmap.
 * @param {string} [params.mode] The mode to calculate performance points for.
 * @param {number} [params.miss=0] The amount of misses achieved.
 * @param {number} [params.acc_percent=100] The accuracy achieved.
 * @param {number} [params.combo] The maximum combo achieved. Defaults to the beatmap's maximum combo.
 * @param {string} [params.file] The `.osu` file of the beatmap. Required if `stars` is not defined.
 * @param {string} [params.mods] The applied mods. Required if `stars` is not defined.
 *
 * @returns {MapPP} A MapPP instance containing the results.
 */
function ppv2(params) {
    if (!params.acc_percent || params.acc_percent < 0 || params.acc_percent > 100) params.acc_percent = 100;
    params.miss = params.miss ? params.miss : 0;
    if (params.miss < 0) params.miss = 0;

    if (!params.stars) {
        let star = new MapStars().calculate(params);
        switch (params.mode) {
            case "osu!droid":
            case "droid": params.stars = star.droid_stars; break;
            case "osu!":
            case "osu": params.stars = star.pc_stars; break;
            default: throw new TypeError("Mode is not supported")
        }
    }
    if (!params.combo) params.combo = params.stars.map.max_combo();
    return new MapPP().calculate({
        stars: params.stars,
        combo: params.combo,
        acc_percent: params.acc_percent,
        nmiss: params.miss,
        mode: params.mode
    })
}

module.exports = ppv2;