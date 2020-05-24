const http = require('http');
const request = require('request');
const droidapikey = process.env.DROID_API_KEY;
const PlayInfo = require('./PlayInfo');

class PlayerInfo {
    constructor() {
        /**
         * @type {number}
         * @description The uid of the player.
         */
        this.uid = 0;

        /**
         * @type {string}
         * @description The username of the player.
         */
        this.name = '';

        /**
         * @type {string}
         * @description The avatar URL of the player.
         */
        this.avatarURL = '';
        
        /**
         * @type {string}
         * @description The location of the player based on ISO 3166-1 country codes. See {@link https://en.wikipedia.org/wiki/ISO_3166-1 this} Wikipedia page for more information.
         */
        this.location = '';

        /**
         * @type {string}
         * @description The email used to register the player's account.
         */
        this.email = '';

        /**
         * @type {number}
         * @description The current rank of the player.
         */
        this.rank = 0;

        /**
         * @type {number}
         * @description The current total score of the player.
         */
        this.score = 0;

        /**
         * @type {number}
         * @description The current accuracy of the player.
         */
        this.accuracy = 0;

        /**
         * @type {number}
         * @description The amount of times the player has played.
         */
        this.play_count = 0;

        /**
         * @type {PlayInfo[]}
         * @description Recent plays of the player in `PlayInfo` instance.
         */
        this.recent_plays = [];

        /**
         * @type {boolean}
         * @description Whether or not the fetch result from `get()` returns an error. This should be immediately checked after calling said method.
         */
        this.error = false;
    }

    /**
     * Retrieves a player's info based on uid or username.
     * 
     * Either uid or username must be specified.
     *
     * @param {Object} params An object containing the parameters.
     * @param {number} [params.uid] The uid to retrieve.
     * @param {string} [params.username] The username to retrieve.
     * @returns {Promise<PlayerInfo>} The current instance containing the player's information.
     */
    get(params = {}) {
        return new Promise(resolve => {
            let uid = this.uid = parseInt(params.uid);
            let username = params.username;
            if (isNaN(uid) && !username) throw new TypeError("Uid must be integer or enter username");
            let options = {
                host: "ops.dgsrz.com",
                port: 80,
                path: `/api/getuserinfo.php?apiKey=${droidapikey}&${uid ? `uid=${uid}` : `username=${encodeURIComponent(username)}`}`
            };
            let content = '';
            let req = http.request(options, res => {
                res.setEncoding("utf8");
                res.on("data", chunk => {
                    content += chunk
                });
                res.on("error", err => {
                    console.log(err);
                    this.error = true;
                    return resolve(this);
                });
                res.on("end", () => {
                    let resarr = content.split("<br>");
                    let headerres = resarr[0].split(" ");
                    if (headerres[0] === 'FAILED') {
                        console.log("Player not found");
                        return resolve(this);
                    }
                    let obj;
                    try {
                        obj = JSON.parse(resarr[1])
                    } catch (e) {
                        console.log("Error parsing player info");
                        this.error = true;
                        return resolve(this);
                    }
                    this.uid = parseInt(headerres[1]);
                    this.name = headerres[2];
                    this.score = parseInt(headerres[3]);
                    this.play_count = parseInt(headerres[4]);
                    this.email = headerres[6];
                    this.rank = obj.rank;
                    this.accuracy = parseFloat((parseFloat(headerres[5]) * 100).toFixed(2));
                    let recent_plays = obj.recent ? obj.recent : [];

                    for (let play of recent_plays) {
                        this.recent_plays.push(
                            new PlayInfo({
                                uid: this.uid,
                                player_name: this.name,
                                score: play.score,
                                accuracy: parseFloat((play.accuracy / 1000).toFixed(2)),
                                miss: play.miss,
                                rank: play.mark,
                                combo: play.combo,
                                title: play.filename,
                                date: (play.date + 3600 * 6) * 1000,
                                mods: play.mode,
                                hash: play.hash
                            })
                        )
                    }

                    let avatar_page = `http://ops.dgsrz.com/profile.php?uid=${uid}`;
                    request(avatar_page, (err, response, data) => {
                        if (err) {
                            console.log("Unable to load site");
                            this.error = true;
                            return resolve(this);
                        }
                        let b = data.split("\n");
                        let avalink = '';
                        let location = '';
                        for (let x = 0; x < b.length; x++) {
                            if (b[x].includes('h3 m-t-xs m-b-xs')) {
                                b[x-3]=b[x-3].replace('<img src="',"");
                                b[x-3]=b[x-3].replace('" class="img-circle">',"");
                                b[x-3]=b[x-3].trim();
                                avalink = b[x-3];
                                b[x+1]=b[x+1].replace('<small class="text-muted"><i class="fa fa-map-marker"><\/i>',"");
                                b[x+1]=b[x+1].replace("<\/small>","");
                                b[x+1]=b[x+1].trim();
                                location=b[x+1];
                                break
                            }
                        }
                        this.avatarURL = avalink;
                        this.location = location;
                        resolve(this)
                    })
                })
            });
            req.end()
        })
    }

    /**
     * Returns a string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return `Username: ${this.name}\nUID: ${this.uid}\nRank: ${this.rank}\nScore: ${this.score}\nPlay count: ${this.play_count}`
    }
}

module.exports = PlayerInfo;
