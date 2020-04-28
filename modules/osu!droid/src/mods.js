const mods = {
    /**
     * @type {number}
     * @description No Fail (osu!droid).
     */
    n: 1<<0,

    /**
     * @type {number}
     * @description Easy (osu!droid).
     */
    e: 1<<1,

    /**
     * @type {number}
     * @description Hidden (osu!droid).
     */
    h: 1<<3,

    /**
     * @type {number}
     * @description Hard Rock (osu!droid).
     */
    r: 1<<4,

    /**
     * @type {number}
     * @description Double Time (osu!droid).
     */
    d: 1<<6,

    /**
     * @type {number}
     * @description Half Time (osu!droid).
     */
    t: 1<<8,

    /**
     * @type {number}
     * @description Nightcore (osu!droid).
     */
    c: 1<<9,
    
    /**
     * @type {number}
     * @description No Mod (osu!standard).
     */
    nomod: 0,

    /**
     * @type {number}
     * @description No Fail (osu!standard).
     */
    nf: 1<<0,

    /**
     * @type {number}
     * @description Easy (osu!standard).
     */
    ez: 1<<1,

    /**
     * @type {number}
     * @description Touch Device (osu!standard).
     */
    td: 1<<2,

    /**
     * @type {number}
     * @description Hidden (osu!standard).
     */
    hd: 1<<3,

    /**
     * @type {number}
     * @description Hard Rock (osu!standard).
     */
    hr: 1<<4,

    /**
     * @type {number}
     * @description Double Time (osu!standard).
     */
    dt: 1<<6,

    /**
     * @type {number}
     * @description Relax (osu!standard)
     */
    rx: 1<<7,

    /**
     * @type {number}
     * @description Half Time (osu!standard).
     */
    ht: 1<<8,

    /**
     * @type {number}
     * @description Nightcore (osu!standard).
     */
    nc: 1<<9,

    /**
     * @type {number}
     * @description Flashlight (osu!standard).
     */
    fl: 1<<10,

    /**
     * @type {number}
     * @description Spun Out (osu!standard).
     */
    so: 1<<12,

    /**
     * @type {number}
     * @description Auto Pilot (osu!standard).
     */
    ap: 1<<13,

    /**
     * @type {number}
     * @description Score V2 (osu!standard).
     */
    v2: 1<<29,

    /**
     * @type {number}
     * @description The bitwise enum of speed-changing mods combined (DT, NC, and HT).
     */
    speed_changing: 1<<6 | 1<<8 | 1<<9,

    /**
     * @type {number}
     * @description The bitwise enum of map-changing mods combined (speed-changing mods (DT, NC, and HT), EZ, and HR).
     */
    map_changing: 1<<1 | 1<<4 | 1<<6 | 1<<8 | 1<<9,

    /**
     * @type {number}
     * @description The bitwise enum of unranked mods combined (RX and AP).
     */
    unranked: 1<<7 | 1<<13,

    /**
     * Converts droid mod string to modbits.
     *
     * @param {string} [mod] The mod string to convert.
     * @returns {number} The mods bitwise.
     */
    droid_to_modbits(mod = "") {
        let modbits = 4;
        if (!mod || mod === '-') {
            return modbits;
        }
        mod = mod.toLowerCase();
        while (mod !== '') {
            for (let property in this) {
                if (!this.hasOwnProperty(property)) continue;
                if (property.length !== 1) continue;
                if (mod.startsWith(property)) {
                    modbits |= this[property];
                    break
                }
            }
            mod = mod.substr(1)
        }
        return modbits
    },

    /**
     * Converts droid mod string to PC mod string.
     * 
     * You can choose to return a detailed string by specifying `detailed = true`.
     *
     * @param {string} [mod] The mod string to convert.
     * @param {boolean} [detailed=false] Whether or not to return detailed string such as [Hidden, DoubleTime] as opposed of [HDDT].
     * @returns {string} The converted mods.
     */
    droid_to_PC(mod = "", detailed = false) {
        if (!mod) return '';
        mod = mod.toLowerCase();
        if (detailed) {
            let res = '';
            let count = 0;
            if (mod.includes("-")) {res += 'None '; count++}
            if (mod.includes("n")) {res += 'NoFail '; count++}
            if (mod.includes("e")) {res += 'Easy '; count++}
            if (mod.includes("t")) {res += 'HalfTime '; count++}
            if (mod.includes("h")) {res += 'Hidden '; count++}
            if (mod.includes("d")) {res += 'DoubleTime '; count++}
            if (mod.includes("r")) {res += 'HardRock '; count++}
            if (mod.includes("c")) {res += 'NightCore '; count++}
            if (count > 1) {
                return res.trimRight().split(" ").join(", ");
            } else {
                return res.trimRight()
            }
        }
        let modbits = 0;
        while (mod !== '') {
            for (let property in this) {
                if (!this.hasOwnProperty(property)) continue;
                if (property.length !== 1) continue;
                if (mod.startsWith(property)) {
                    modbits |= this[property];
                    break
                }
            }
            mod = mod.substr(1)
        }
        return this.modbits_to_string(modbits)
    },

    /**
     * Converts PC mods to a detailed string.
     *
     * @param {string} [mod] The mods to convert.
     * @returns {string} The detailed mod string.
     */
    pc_to_detail(mod = "") {
        let res = '';
        if (!mod) return 'None';
        mod = mod.toLowerCase();
        let count = 0;
        if (mod.includes("nf")) {res += 'NoFail '; count++}
        if (mod.includes("ez")) {res += 'Easy '; count++}
        if (mod.includes("ht")) {res += 'HalfTime '; count++}
        if (mod.includes("td")) {res += 'TouchDevice '; count++}
        if (mod.includes("hd")) {res += 'Hidden '; count++}
        if (mod.includes("dt")) {res += 'DoubleTime '; count++}
        if (mod.includes("hr")) {res += 'HardRock '; count++}
        if (mod.includes("nc")) {res += 'NightCore '; count++}
        if (count > 1) {
            return res.trimRight().split(" ").join(", ");
        } else {
            return res.trimRight()
        }
    },

    /**
     * Construct the mods bitwise from a string such as "HDHR".
     *
     * @param {string} [str] The mod string to construct the mods bitwise from.
     * @returns {number} The mods bitwise.
     */
    modbits_from_string(str = "") {
        let mask = 0;
        str = str.toLowerCase();
        while (str !== "") {
            let nchars = 1;
            for (let property in this) {
                if (!this.hasOwnProperty(property)) continue;
                if (property.length !== 2) continue;
                if (str.startsWith(property)) {
                    mask |= this[property];
                    nchars = 2;
                    break
                }
            }
            str = str.slice(nchars)
        }
        return mask
    },

    /**
     * Convert mods bitwise into a string, such as "HDHR".
     *
     * @param {number} [mod] The mods bitwise to convert.
     * @returns {string} The converted mods.
     */
    modbits_to_string(mod = 0) {
        let res = "";
        for (let property in this) {
            if (!this.hasOwnProperty(property)) continue;
            if (property.length !== 2) continue;
            if (mod & this[property]) res += property.toUpperCase()
        }
        if (res.indexOf("DT") >= 0 && res.indexOf("NC") >= 0) res = res.replace("DT", "");
        return res
    }
};

module.exports = mods;