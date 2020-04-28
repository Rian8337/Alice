const rankImage = {
    /**
     * @type {string}
     * @description Image link for S rank.
     */
    S: "http://ops.dgsrz.com/assets/images/ranking-S-small.png",

    /**
     * @type {string}
     * @description Image link for A rank.
     */
    A: "http://ops.dgsrz.com/assets/images/ranking-A-small.png",

    /**
     * @type {string}
     * @description Image link for B rank.
     */
    B: "http://ops.dgsrz.com/assets/images/ranking-B-small.png",

    /**
     * @type {string}
     * @description Image link for C rank.
     */
    C: "http://ops.dgsrz.com/assets/images/ranking-C-small.png",

    /**
     * @type {string}
     * @description Image link for D rank.
     */
    D: "http://ops.dgsrz.com/assets/images/ranking-D-small.png",

    /**
     * @type {string}
     * @description Image link for SH rank.
     */
    SH: "http://ops.dgsrz.com/assets/images/ranking-SH-small.png",

    /**
     * @type {string}
     * @description Image link for X (SS) rank.
     */
    X: "http://ops.dgsrz.com/assets/images/ranking-X-small.png",

    /**
     * @type {string}
     * @description Image link for XH (SSH) rank.
     */
    XH: "http://ops.dgsrz.com/assets/images/ranking-XH-small.png",

    /**
     * Returns a rank image URL based on given rank.
     *
     * @param {string} [rank] The rank to return.
     * @returns {string} The image URL of the rank.
     */
    get(rank = "") {
        rank = rank.toUpperCase();
        if (this.hasOwnProperty(rank)) {
            return this[rank]
        } else {
            return "Unknown"
        }
    }
};

module.exports = rankImage;