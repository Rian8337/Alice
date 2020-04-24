const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');
const config = require('../../config.json');

function capitalizeString(str = '') {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function scoreCalc(score, maxscore, accuracy, misscount) {
    let newscore = score/maxscore*600000 + (Math.pow((accuracy/100), 4)*400000);
    newscore = newscore - (misscount*0.003*newscore);
    return newscore;
}

async function retrievePlay(uid) {
    const player = await new osudroid.PlayerInfo().get({uid: uid}).catch(console.error);
    return player.recent_plays;
}

module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (args[0] !== "about" && message.author.id !== '386742340968120321' && message.author.id !== '132783516176875520') return message.channel.send("❎ **| I'm sorry, this command is still in testing!**");

    const binddb = maindb.collection("binddb");
    const multi = alicedb.collection("multiplayer");
    const point = alicedb.collection("playerpoints");
    let query = {channel: message.channel.id};
    const current_time = Math.floor(Date.now() / 1000);
    let insertVal;
    let updateVal;

    let rolecheck;
    try {
        rolecheck = message.member.roles.highest.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setColor(rolecheck)
        .setFooter("Alice Synthesis Thirty", footer[index]);

    switch (args[0]) {


        // about section
        case "about": {
            let about_array = [
                [
                    // 1
                    "Introduction",
                    "This is a multiplayer system that attempts to emulate the feeling of multiplayer mode in the official game. It is originally made to help organizing clan battles for referees and moderators.\n" +
                    "Because this system is mostly based off of the official multiplayer system, the general functionality of this system is *almost* the same as the official multiplayer system. You can see [this](https://osu.ppy.sh/help/wiki/Multi) osu!wiki page for general explanation.\n" +
                    "\n" +
                    "Despite the major goal of this system, as said before, there are many major differences of this system compared to the official multiplayer system:\n" +
                    "- **The inability to automatically submit scores**. This is due to how score submission in osu!droid works. Unlike the official game, osu!droid doesn't store failed scores and retries, eliminating the ability to track certain scores.\n" +
                    "\n" +
                    "- The only available modes are Head to Head and Team Vs. Tag mode and Tag Team Vs mode are not available due to the way both modes function.\n" +
                    "\n" +
                    "- The unsupported usage of unranked mods (RX and AP). Both mods will cause inconsistencies in some win conditions, mainly score, due to RX and AP having a fixed score multiplier of 1 (as opposed of the official game, which is 0).\n" +
                    "\n" +
                    "- The entire system is command-based as opposed to real UIs in official multiplayer system. This is simply a limitation from creating a Discord bot-based multiplayer system that can't be helped.\n" +
                    "\n" +
                    "- Channels are treated as multiplayer rooms, meaning there cannot be more than one multiplayer game in a channel. This prevents channel cluttering which will cause confusion among players.\n" +
                    "\n" +
                    "- Some win conditions are altered. This will be explained later.\n" +
                    "\n" +
                    "Remember that server rules apply everywhere in the server unless otherwise stated, including this system. **Any kind of infringement of server rules (i.e. inappropriate multiplayer game name) will result in a mute, kick, or ban depending on the infringement's severity.**\n" +
                    "\n" +
                    "To move through pages, simply write the page in chat.\n"
                ],
                [
                    // 2
                    "Contents",
                    "- Page 1: Introduction\n" +
                    "- Page 2: Contents\n" +
                    "- Page 3: Starting\n" +
                    "- Page 4: Game Host\n" +
                    "- Page 5: Setting a Beatmap\n" +
                    "- Page 6: Win Condition\n" +
                    "- Page 7: Team Mode\n" +
                    "- Page 8: Mods\n" +
                    "- Page 9: Starting a Round\n" +
                    "- Page 10: Submitting a Score\n" +
                    "- Page 11: Dealing with Foul Submissions\n" +
                    "- Page 12-13: Command Information"
                ],
                [
                    // 3
                    "Starting",
                    "To start with the system, **you must have an online osu!droid account binded to this bot or Elaina**. If you've done so, you can create a multiplayer game or join an existing one.\n" +
                    "\n" +
                    "To create a multiplayer game, use `a!mp create <max players> <name>`. Do note that multiplayer game names must not exceed 40 characters and must be bound to server rules.\n" +
                    "To join an existing game, use `a!mp join` in the channel where the game is ongoing.\n" +
                    "\n" +
                    "Do note that a multiplayer game can have up to 16 players. Once reached, players can no longer join the game.\n" +
                    "\n" +
                    "To leave a multiplayer game, use `a!mp leave`. This is required if you want to join another multiplayer game."
                ],
                [
                    // 4
                    "Game Host",
                    "A multiplayer game has a host. When you create a multiplayer game, you automatically become the game's host.\n" +
                    "Game hosts can change the password of their multiplayer game by using `a!mp password <password>` __**in DM**__ to <@627321230902689813>. If a password is set, players are prompted to enter the password in their DM to join the game. A password can be up to 20 characters long.\n" +
                    "Aside of that, game hosts can also change their multiplayer game name using `a!mp rename <name>`. The general rule for multiplayer game names applies.\n" +
                    "\n" +
                    "Game hosts can also change the beatmap that will be played, win condition (explained in page 6), team mode (explained in page 7), and mods (explained in page 8). The host can initiate a round and also transfer its position to another player in the game.\n" +
                    "When a game host leaves their game, a random user will be picked in the game. If there are no more players in it, it will be ended.\n" +
                    "\n" +
                    "Game hosts can also kick players out of their game. They can use `a!mp kick <user>` to kick the specified user from their game.\n"
                ],
                [
                    // 5
                    "Setting a Beatmap",
                    "If you're the game's host, you can set a beatmap to be played in the next round by using `a!mp beatmap <beatmap link/ID>`. All players must have the beatmap downloaded before the round can proceed.\n" +
                    "Note that the beatmap must be valid; remember to use *beatmap ID*, not *beatmap set ID*."
                ],
                [
                    // 6
                    "Win Condition",
                    "Win condition represents the way a match will be decided. There are four available ways:\n" +
                    "- Score: The player with highest score will win the match.\n" +
                    "- Accuracy: The player with the highest accuracy wins. If there are two players with 100% accuracy, the player with the highest score (from spinners) wins.\n" +
                    "- Combo: The player with the highest maximum combo wins. If two players have the same highest maximum combo, the player with the highest score wins.\n" +
                    "- ScoreV2: The player with the highest standardised score wins.\n" +
                    "\n" +
                    "Upon starting a multiplayer game, the win condition is automatically set to `score`. Game hosts can change this by using `a!mp condition <score/acc/combo/scorev2>`."
                ],
                [
                    // 7
                    "Team Mode",
                    "Team mode represents the way a match will be played. There are two available ways:\n" +
                    "- Head to Head: Compete against other players to reach the top spot of the match's leaderboard.\n" +
                    "- Team Vs: Players are grouped in forms of team (Team Red and Team Blue) and teams compete against each other.\n" +
                    "\n" +
                    "Upon starting a multiplayer game, the team mode is automatically set to `Head to Head`. Game hosts can change this by using `a!mp mode <hth/teamvs>`.\n" +
                    "\n" +
                    "In a Team Vs team mode, players can assign themselves to a team by using `a!mp team set <red/blue>`. Game hosts can assign other players to a team by using `a!mp team move <user> <red/blue>`."
                ],
                [
                    // 8
                    "Mods",
                    "Game hosts can set mods that will be enforced upon players.\n" +
                    "\n" +
                    "All ranked mods are available to use (EZ/NF/HT/HD/HR/DT/NC). Do note that you *cannot* set EZ along with HR and only one speed-changing mods (DT/NC/HT) can be used at a time.\n" +
                    "Game hosts can set a free mod (FM) round; during this round, players are allowed to use any rankable mods except speed-changing mods. They are forced upon all players in the match if the game host decides to enable one of them.\n" +
                    "\n" +
                    "Upon starting a multiplayer game, mods are automatically set to `No Mod`. To set mods, game hosts can use `a!mp mod <mods>` with mods being the combination of enabled mods (EZ/NF/HT/HD/HR/DT/NC/FM)."
                ],
                [
                    // 9
                    "Starting a Round",
                    "Before starting a round, all players must be in ready state. Players can enter ready state by using `a!mp ready`. If players have something to do after entering ready state, they can use `a!mp unready` to leave from ready state.\n" +
                    "\n" +
                    "After the settings of a round is complete, game hosts can use `a!mp start` to start the round. After executing the command, a 15-second countdown will be put to give time for players to switch to the game. After the countdown has finished, all players play the beatmap set for that round.\n" +
                    "\n" +
                    "When the beatmap is finished, players can submit their score (despite the score not being submitted to the server) using a way that will be explained in the next page."
                ],
                [
                    // 10
                    "Submitting a Score",
                    "Upon finishing a beatmap, players have 1 minute to submit their score using `a!mp submit`. Depending on the win condition, certain type of command parameters must be provided. Do note that ScoreV1 is required for every win condition.\n" +
                    "- Score: Only the score needs to be submitted\n" +
                    "- Accuracy: Score and accuracy must be submitted in case two or more players tie in accuracy\n" +
                    "- Combo: Score and maximum combo must be submitted in case two or more players tie in combo\n" +
                    "- ScoreV2: Score, accuracy, and miss count must be submitted in order to calculate ScoreV2\n" +
                    "\n" +
                    "All score submissions can be done by using `a!mp submit <score> [<combo>x <accuracy>% <miss count>m]` and matching the parameter needed for the applied win condition.\n" +
                    "Alternatively, if the player's score was submitted to the server, the player can use `a!mp submit recent` to automatically submit their score."
                ],
                [
                    // 11
                    "Dealing with Foul Submission",
                    "After score submission period is over, the game host has 30 seconds to remove any foul submissions from players.\n" +
                    "\n" +
                    "Game hosts can use `a!mp remove <user>` to remove a foul submission from a player.\n" +
                    "\n" +
                    "To prevent foul submissions post-round from manual submissions (aka submissions that did not use the `a!mp submit recent` command), require players to send a screenshot of their score from local leaderboard (allows time check) to validate their submission."
                ],
                [
                    // 12
                    "Command Information",
                    "`a!mp about`\n" +
                    "Prints this wiki.\n" +
                    "\n" +
                    "`a!mp beatmap <beatmap link/ID>`\n" +
                    "Sets the beatmap to play for next round (Game Host only).\n" +
                    "\n" +
                    "`a!mp condition <score/combo/acc/scorev2>`\n" +
                    "Sets the win condition for the next round (Score/Combo/Accuracy/ScoreV2) (Game Host only).\n" +
                    "\n" +
                    "`a!mp create <max players> <name>`\n" +
                    "Creates a multiplayer game with given name in the channel. Name must be at most 20 characters.\n" +
                    "\n" +
                    "`a!mp host <user>`\n" +
                    "Transfers host position to another user in the game (Game Host only).\n" +
                    "\n" +
                    "`a!mp info`\n" +
                    "Prints information about current ongoing multiplayer game in the channel (if available).\n" +
                    "\n" +
                    "`a!mp join`\n" +
                    "Joins a multiplayer game. If password for the game exists, the user will be prompted to enter it in DM.\n" +
                    "\n" +
                    "`a!mp kick <user>`\n" +
                    "Kicks a user from the multiplayer game (Game Host only).\n" +
                    "\n" +
                    "`a!mp leave`\n" +
                    "Leaves a multiplayer game.\n" +
                    "\n" +
                    "`a!mp max <amount>`\n" +
                    "Sets the amount of max players in the game. Maximum amount is 16 (Game Host only)."
                ],
                [
                    // 13
                    "Command Information",
                    "`a!mp mod [mods]`\n" +
                    "Sets the mods to be played for the next round. If omitted, will default to No Mod (Game Host only).\n" +
                    "Accepted mods are EZ | NF | HT | HD | HR | DT | NC | FM (FreeMod).\n" +
                    "\n" +
                    "`a!mp mode <hth/teamvs>`\n" +
                    "Sets the team mode for next round (Game Host only).\n" +
                    "\n" +
                    "`a!mp password [password]`\n" +
                    "Sets the password for your current ongoing multiplayer game. If omitted, the password will be emptied (all players can join).\n" +
                    "This command only works in DM to keep passwords secret (Game Host only).\n" +
                    "\n" +
                    "`a!mp ready`\n" +
                    "Enters ready state.\n" +
                    "\n" +
                    "`a!mp remove <user>`\n" +
                    "Removes the submitted play of the mentioned user. Only works if submission period is over (Game Host only).\n" +
                    "\n" +
                    "`a!mp start`\n" +
                    "Starts a round of the multiplayer game. Only works if all players in the game have entered ready state (Game Host only).\n" +
                    "\n" +
                    "`a!mp submit <recent | <score> [<combo>x <accuracy>% <miss count>m]>`\n" +
                    "Submits a play after a beatmap in a round is done.\n" +
                    "\n" +
                    "`a!mp team <params>`\n" +
                    "The base command for organizing teams in Team Vs team mode.\n" +
                    "Parameters:\n" +
                    "- `move <user> <red/blue>`: Moves a user to Red or Blue Team (Game Host only).\n" +
                    "- `set <red/blue>`: Sets your team to Red or Blue Team.\n" +
                    "\n" +
                    "`a!mp unready`\n" +
                    "Leaves ready state."
                ]
            ];

            let page = 1;
            embed.setTitle(about_array[page - 1][0]).setAuthor("Multiplayer Wiki", "https://image.frl/p/beyefgeq5m7tobjg.jpg").setDescription(about_array[page - 1][1]).setFooter(`Alice Synthesis Thirty | Page ${page}/${about_array.length}`, footer[index]);
            message.channel.send({embed: embed}).then(msg => {
                const collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, {time: 600000});
                collector.on("collect", m => {
                    let page_number = parseInt(m.content);
                    if (isNaN(page_number) || page_number < 1 || page_number > about_array.length) return;
                    m.delete().catch(console.error);
                    page = page_number;
                    embed.setTitle(about_array[page - 1][0]).setDescription(about_array[page - 1][1]).setFooter(`Alice Synthesis Thirty | Page ${page}/${about_array.length}`, footer[index]);
                    msg.edit({embed: embed}).catch(console.error)
                })
            });
            break
        }


        // create multiplayer match
        case "create": {
            let max_players = parseInt(args[2]);
            if (isNaN(max_players) || max_players < 1 || max_players > 16) return message.channel.send("❎ **| I'm sorry, amount of players must be between 1-16 players!**");

            let name = args.slice(3).join(" ");
            if (!name) return message.channel.send("❎ **| Hey, please enter a name for your multiplayer game!**");
            if (name.length > 40) return message.channel.send("❎ **| I'm sorry, multiplayer game name must not exceed 40 characters!**");

            query = {discordid: message.author.id};
            binddb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let username = res.username;
                let uid = res.uid;

                query = {channel: message.channel.id};
                multi.findOne(query, (err, mres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (mres) return message.channel.send("❎ **| I'm sorry, there is an ongoing multiplayer game in this channel!**");
                    let insertVal = {
                        channel: message.channel.id,
                        name: name,
                        max_players: max_players,
                        createdTimestamp: current_time,
                        last_activity: current_time,
                        host: message.author.id,
                        password: '',
                        isOngoing: false,
                        match_settings: {
                            beatmap: {
                                id: 0,
                                hash: ''
                            },
                            mods: 'none',
                            isFreeMod: false,
                            win_condition: 'score',
                            team_mode: 'hth',
                            teams: {
                                red: [],
                                blue: []
                            }
                        },
                        temporary_scores: [],
                        players: [
                            {
                                discordid: message.author.id,
                                username: username,
                                uid: uid,
                                score: 0,
                                isReady: false,
                                hasSubmitted: false
                            }
                        ]
                    };

                    multi.insertOne(insertVal, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        message.channel.send(`✅ **| Successfully added multiplayer game \`${name}\`.**`)
                    })
                })
            });
            break
        }


        // sets a password for multiplayer game
        case 'password': {
            if (!(message.channel instanceof Discord.DMChannel)) return message.channel.send("❎ **| Hey, you can only change your multiplayer game password in DMs!**");

            let password = args.slice(1).join(" ");
            if (!password) password = '';
            if (password.length > 20) return message.channel.send("❎ **| I'm sorry, a password can only be up to 20 characters long!**");

            query = {host: message.author.id};
            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, you do not currently host a multiplayer game!**");

                updateVal = {
                    $set: {
                        password: password
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| Successfully ${password ? `set your multiplayer game password to ${password}` : "cleared your multiplayer game password"}.**`)
                })
            });
            break
        }


        // views match information
        case "info": {
            multi.findOne(query, async (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let beatmap_id = res.match_settings.beatmap.id;
                if (!beatmap_id) return message.channel.send("❎ **| I'm sorry, there is no beatmap set for multiplayer game in this channel!**");
                let mod = res.match_settings.mods;
                if (mod === 'FreeMod') mod = '';
                let name = res.name;
                let host = res.host;
                let max_players = res.max_players;
                let date = new Date(res.createdTimestamp);

                let win_condition = res.match_settings.win_condition;
                if (win_condition === 'acc') win_condition = 'accuracy';

                let team_mode = res.match_settings.team_mode;
                switch (team_mode) {
                    case 'hth':
                        team_mode = 'Head to Head';
                        break;
                    case 'teamvs':
                        team_mode = 'Team Vs'
                }

                let players = res.players;
                let player_string = '';
                for (let i = 0; i < players.length; i++) {
                    let player = players[i];
                    player_string += `${player.username} (${player.score})`;
                    if (i + 1 < players.length) player_string += ' | ';
                }
                player_string = player_string.trimRight().split(" ").join(", ");

                const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmap_id}).catch(console.error);
                if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the map!**");
                if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the map is invalid!**");
                if (!mapinfo.osu_file) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");

                let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});

                embed.setTitle("Match Information")
                    .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
                    .setDescription(`**Name**: ${name}\n**Host**: <@${host}>\n**Players**: ${players.length}/${max_players}\n**Date created**: ${date.toUTCString()}`)
                    .addField(`**Beatmap Information**`, `**[${mapinfo.showStatistics(mod, 0)}](https://osu.ppy.sh/b/${mapinfo.beatmap_id})**\n${mapinfo.showStatistics(mod, 1)}\n\n${mapinfo.showStatistics(mod, 2)}\n${mapinfo.showStatistics(mod, 3)}\n${mapinfo.showStatistics(mod, 4)}\n${mapinfo.showStatistics(mod, 5)}\n${"★".repeat(Math.min(10, parseInt(star.droid_stars)))} ${parseFloat(star.droid_stars).toFixed(2)} droid stars\\n${"★".repeat(Math.min(10, parseInt(star.pc_stars)))} ${parseFloat(star.pc_stars).toFixed(2)} PC stars`)
                    .addField("**Match Settings**", `**Mods**: ${capitalizeString(mod)}\n**Win Condition**: ${capitalizeString(win_condition)}\n**Team Mode**: ${team_mode}`)
                    .addField("**Players**", player_string);

                message.channel.send({embed: embed})
            });
            break
        }


        // joins multiplayer match
        case "join": {
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let discordid = res.discordid;
                let uid = res.uid;
                let username = res.username;

                point.findOne(query, (err, pres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (pres && pres.multi) return message.channel.send("❎ **| I'm sorry, you are currently in a multiplayer match! Please leave that one before joining another multiplayer match!**");

                    query = {channel: message.channel.id};
                    multi.findOne(query, (err, mres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!mres) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                        if (mres.isOngoing) return message.channel.send("❎ **| I'm sorry, a match is currently ongoing! Please join later!**");
                        let players = mres.players;
                        let player_index = players.findIndex((player) => player.discordid === message.author.id);
                        if (player_index !== -1) return message.channel.send("❎ **| Hey, you're already in this multiplayer game!**");
                        if (players.length === mres.max_players) return message.channel.send("❎ **| I'm sorry, there is no more room for a player to join this multiplayer game!**");

                        if (res.password) {
                            try {
                                message.author.send("❗**| The multiplayer game that you're about to join has a password! Please enter a password to join the game!**");
                                let collector = message.author.dmChannel.createMessageCollector(m => m.content === res.password, {time: 30000});

                                let correct = false;
                                collector.on('collect', () => {
                                    correct = true;
                                    message.author.send("✅ **| Password correct!**");

                                    players.push({
                                        discordid: discordid,
                                        username: username,
                                        uid: uid,
                                        score: 0,
                                        isReady: false,
                                        hasSubmitted: false
                                    });

                                    if (pres) {
                                        updateVal = {
                                            $set: {
                                                multi: mres.name
                                            }
                                        };
                                        point.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                            }
                                        })
                                    } else {
                                        insertVal = {
                                            username: username,
                                            uid: uid,
                                            discordid: message.author.id,
                                            challenges: [],
                                            points: 0,
                                            dailycooldown: 0,
                                            alicecoins: 0,
                                            multi: mres.name
                                        };
                                        point.insertOne(insertVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                            }
                                        })
                                    }

                                    updateVal = {
                                        $set: {
                                            players: players
                                        }
                                    };

                                    multi.updateOne(query, updateVal, err => {
                                        if (err) {
                                            console.log(err);
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                        }
                                        message.channel.send(`✅ **| ${message.author}, successfully joined multiplayer game.**`)
                                    })
                                });
                                collector.on('end', () => {
                                    if (!correct) message.author.dmChannel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                                })
                            } catch (e) {
                                message.channel.send("❎ **| I'm sorry, this multiplayer game has a password, therefore you must have your DM unlocked!**")
                            }
                        } else {
                            players.push({
                                discordid: discordid,
                                username: username,
                                uid: uid,
                                score: 0,
                                isReady: false,
                                hasSubmitted: false
                            });

                            if (pres) {
                                updateVal = {
                                    $set: {
                                        multi: mres.name
                                    }
                                };
                                point.updateOne({discordid: message.author.id}, updateVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                    }
                                })
                            } else {
                                insertVal = {
                                    username: username,
                                    uid: uid,
                                    discordid: message.author.id,
                                    challenges: [],
                                    points: 0,
                                    dailycooldown: 0,
                                    alicecoins: 0,
                                    multi: mres.name
                                };
                                point.insertOne(insertVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                    }
                                })
                            }

                            updateVal = {
                                $set: {
                                    players: players
                                }
                            };

                            multi.updateOne(query, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully joined multiplayer game.**`)
                            })
                        }
                    })
                })
            });
            break
        }


        // leaves multiplayer match
        case "leave": {
            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");
                let players = res.players;
                let player_index = players.findIndex((player) => player.discordid === message.author.id);
                if (player_index === -1) return message.channel.send("❎ **| Hey, you're not in this multiplayer game!**");

                players.splice(player_index, 1);

                let host = res.host;
                if (host === message.author.id && players.length > 0) host = players[Math.random() * players.length].discordid

                updateVal = {
                    $set: {
                        multi: ''
                    }
                };

                point.updateOne({discordid: message.author.id}, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                });

                if (players.length === 0) {
                    multi.deleteOne(query, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        message.channel.send(`✅ **| ${message.author}, successfully left multiplayer game.**`)
                    })
                    return
                }

                updateVal = {
                    $set: {
                        host: host,
                        players: players
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully left multiplayer game.**`)
                })
            });
            break
        }


        // sets max players
        case 'max': {
            let amount = parseInt(args[1]);
            if (isNaN(amount)) return message.channel.send("❎ **| Hey, please enter a valid amount of maximum players!**");
            if (amount < 2 || amount > 16) return message.channel.send("❎ **| I'm sorry, the valid limit of maximum players is 2-16!**");

            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");
                if (res.players.length > amount) return message.channel.send(`❎ **| I'm sorry, the amount of players in your game now is ${res.players.length}! Please enter a higher amount!**`);

                updateVal = {
                    $set: {
                        max_players: amount
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully set maximum players to ${amount}.**`)
                })
            });
            break
        }


        // settings for team vs mode
        case 'team': {
            switch (args[1]) {
                case 'set': {
                    let team = args[2];
                    if (typeof team !== "string") return message.channel.send("❎ **| Hey, please enter a valid team!**");
                    if (['red', 'blue'].includes(team)) return message.channel.send("❎ **| Hey, that's not a valid team! Accepted teams are `blue` and `red`.**");

                    multi.findOne(query, (err, res) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                        if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");
                        let match_settings = res.match_settings;
                        if (match_settings.team_mode !== 'teamvs') return message.channel.send("❎ **| I'm sorry, the current team mode is not Team Vs!**");

                        let players = res.players;
                        let player_index = players.findIndex((player) => player.discordid === message.author.id);
                        if (player_index === -1) return message.channel.send("❎ **| I'm sorry, you're not in this multiplayer game!**");
                        let player = players[player_index];
                        if (player.isReady) return message.channel.send("❎ **| I'm sorry, you cannot change teams as you're in ready state!**");

                        let red_team = match_settings.teams.red;
                        let blue_team = match_settings.teams.blue;

                        let team_index;
                        if (team === 'red') {
                            team_index = blue_team.findIndex((player) => player.discordid === message.author.id);
                            if (team_index !== -1) blue_team.splice(team_index, 1);
                            red_team.push({
                                discordid: player.discordid,
                                username: player.username
                            })
                        } else {
                            team_index = red_team.findIndex((player) => player.discordid === message.author.id);
                            if (team_index !== -1) red_team.splice(team_index, 1);
                            blue_team.push({
                                discordid: player.discordid,
                                username: player.username
                            })
                        }

                        match_settings.teams.red = red_team;
                        match_settings.teams.blue = blue_team;

                        updateVal = {
                            $set: {
                                match_settings: match_settings
                            }
                        };

                        multi.updateOne(query, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send(`✅ **| ${message.author}, successfully set your team to \`${capitalizeString(team)} Team\`.**`)
                        })
                    });
                    break
                }
                case 'move': {
                    let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[2]));
                    if (!user) return message.channel.send("❎ **| Hey, please specify a valid user!**");

                    let team = args[2];
                    if (typeof team !== "string") return message.channel.send("❎ **| Hey, please enter a valid team!**");
                    if (['red', 'blue'].includes(team)) return message.channel.send("❎ **| Hey, that's not a valid team! Accepted teams are `blue` and `red`.**");

                    multi.findOne(query, (err, res) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                        let host = res.host;
                        if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                        if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                        let match_settings = res.match_settings;
                        if (match_settings.team_mode !== 'teamvs') return message.channel.send("❎ **| I'm sorry, the current team mode is not Team Vs!**");

                        let players = res.players;
                        let player_index = players.findIndex((player) => player.discordid === user.id);
                        if (player_index === -1) return message.channel.send("❎ **| I'm sorry, the user is not in your multiplayer game!**");
                        let player = players[player_index];
                        if (player.isReady) return message.channel.send("❎ **| I'm sorry, you cannot change this user's team as the user is in ready state!**");

                        let red_team = match_settings.teams.red;
                        let blue_team = match_settings.teams.blue;

                        let team_index;
                        if (team === 'red') {
                            team_index = blue_team.findIndex((player) => player.discordid === user.id);
                            if (team_index !== -1) blue_team.splice(team_index, 1);
                            red_team.push({
                                discordid: player.discordid,
                                username: player.username
                            })
                        } else {
                            team_index = red_team.findIndex((player) => player.discordid === user.id);
                            if (team_index !== -1) red_team.splice(team_index, 1);
                            blue_team.push({
                                discordid: player.discordid,
                                username: player.username
                            })
                        }

                        match_settings.teams.red = red_team;
                        match_settings.teams.blue = blue_team;

                        updateVal = {
                            $set: {
                                match_settings: match_settings
                            }
                        };

                        multi.updateOne(query, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send(`✅ **| ${message.author}, successfully set ${user}'s team to \`${capitalizeString(team)} Team\`.**`)
                        })
                    });
                    break
                }
                default: return message.channel.send("❎ **| I'm sorry, your second arguments are invalid! Accepted arguments are `move` and `set`.**")
            }
            break
        }


        // kick a user from multiplayer game
        case 'kick': {
            let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
            if (!user) return message.channel.send("❎ **| Hey, please specify a valid user!**");
            if (user.id === message.author.id) return message.channel.send("❎ **| Hey, you cannot kick yourself!**");

            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                let players = res.players;
                let player_index = players.findIndex((player) => player.discordid === user.id);
                if (player_index === -1) return message.channel.send("❎ **| I'm sorry, the user is not in your multiplayer game!**");

                players.splice(player_index, 1);

                updateVal = {
                    $set: {
                        players: players
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully kicked ${user} from multiplayer game.**`)
                })
            });
            break
        }


        // transfers host
        case 'host': {
            let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
            if (!user) return message.channel.send("❎ **| Hey, please specify a valid user!**");
            if (user.id === message.author.id) return message.channel.send("❎ **| Hey, you cannot transfer host to yourself!**");
            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                let players = res.players;
                let player_index = players.findIndex((player) => player.discordid === user.id);
                if (player_index === -1) return message.channel.send("❎ **| I'm sorry, the user is not in your multiplayer game!**");

                updateVal = {
                    $set: {
                        host: user.id,
                        players: players
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully transferred host to ${user}.**`)
                })
            });
            break
        }


        // renames multiplayer game
        case 'rename': {
            let name = args.slice(2).join(" ");
            if (!name) return message.channel.send("❎ **| Hey, please enter the new name for your multiplayer game!**");
            if (name.length > 40) return message.channel.send("❎ **| I'm sorry, multiplayer game name must not exceed 40 characters!**");

            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                if (res.name === name) return message.channel.send("❎ **| I'm sorry, your multiplayer game already has the name you have provided!**");

                updateVal = {
                    $set: {
                        name: name
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully changed multiplayer game name to \`${name}\`.**`)
                })
            });
            break
        }


        // set beatmap
        case 'beatmap': {
            let map = args[1];
            if (map.includes("/")) {
                const a = map.split("/");
                map = parseInt(a[a.length - 1]);
            }
            else map = parseInt(map);

            if (isNaN(map)) return message.channel.send("❎ **| Hey, please enter a valid beatmap link or ID!**")

            const mapinfo = await new osudroid.MapInfo().get({beatmap_id: map}).catch(console.error);
            if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the map!**");
            if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the map is invalid!**");
            if (!mapinfo.osu_file) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");

            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                let match_settings = res.match_settings;
                let mod = match_settings.mods;
                let beatmap = match_settings.beatmap.id;
                if (beatmap === mapinfo.beatmap_id) return message.channel.send("❎ **| Hey, the beatmap specified is the same as current beatmap!**")

                if (mod === 'FreeMod') mod = '';

                let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});

                embed.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
                    .setColor(mapinfo.statusColor(mapinfo.approved))
                    .setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
                    .setTitle(mapinfo.showStatistics(mod, 0))
                    .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
                    .setDescription(mapinfo.showStatistics(mod, 1))
                    .addField(mapinfo.showStatistics(mod, 2), mapinfo.showStatistics(mod, 3))
                    .addField(mapinfo.showStatistics(mod, 4), mapinfo.showStatistics(mod, 5))
                    .addField("**Star Rating**", `${"★".repeat(Math.min(10, parseInt(star.droid_stars)))} **${parseFloat(star.droid_stars).toFixed(2)} droid stars**\n${"★".repeat(Math.min(10, parseInt(star.pc_stars)))} **${parseFloat(star.pc_stars).toFixed(2)} PC stars**`);

                match_settings.beatmap.id = mapinfo.beatmap_id;
                match_settings.beatmap.hash = mapinfo.hash;

                updateVal = {
                    $set: {
                        match_settings: match_settings
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully set beatmap for multiplayer game.**`, {embed: embed})
                })
            });
            break
        }


        // set mods
        case 'mod': {
            let mod = args[1];
            if (typeof mod !== "string") mod = '';
            mod = mod.toUpperCase();

            const free_mod = mod.includes('FM');
            if (free_mod) mod = mod.replace("FM", "");

            mod = osudroid.mods.modbits_from_string(mod);
            if (((mod & osudroid.mods.dt) !== 0 || (mod & osudroid.mods.nc) !== 0) && ((mod & osudroid.mods.ht) !== 0)) return message.channel.send("❎ **| I'm sorry, you cannot have DT, NC, and HT as mod requirement!**");
            if (((mod & osudroid.mods.ez) !== 0) && ((mod & osudroid.mods.hr) !== 0)) return message.channel.send("❎ **| I'm sorry, you cannot have both EZ and HR as mod requirement!**");
            if (((mod & osudroid.mods.rx) !== 0) || ((mod & osudroid.mods.ap) !== 0)) return message.channel.send("❎ **| I'm sorry, you cannot use unranked mods as of now!**");

            if (!mod) mod = 'None';
            else mod = osudroid.mods.modbits_to_string(mod)

            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                let match_settings = res.match_settings;
                if (match_settings.mods === mod) return message.channel.send("❎ **| Hey, the mod entry is the same as current mod entry!**");

                match_settings.mods = mod;
                match_settings.isFreeMod = free_mod;

                updateVal = {
                    $set: {
                        match_settings: match_settings
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully set mods to \`${mod}\`.**`)
                })
            });
            break
        }


        // enter ready state
        case 'ready': {
            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                let players = res.players;
                let player_index = players.findIndex((player) => player.discordid === message.author.id);
                if (player_index === -1) return message.channel.send("❎ **| I'm sorry, you are not in this multiplayer game!**");
                players[player_index].isReady = true;

                const ready_amount = players.filter((player) => player.isReady).length;

                if (res.match_settings.team_mode === 'teamvs') {
                    let teams = res.match_settings.teams;
                    let red_index = teams.red.findIndex((player) => player.discordid === message.author.id);
                    let blue_index = teams.blue.findIndex((player) => player.discordid === message.author.id);
                    if (red_index + blue_index === -2) return message.channel.send("❎ **| Hey, you're not in a team yet! You must be in a team as the game's team mode is set to Team Vs!**")
                }

                updateVal = {
                    $set: {
                        players: players
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author.username} is ready (${ready_amount}/${players.length})!**`)
                })
            });
            break
        }


        // leave from ready state
        case 'unready': {
            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                let players = res.players;
                let player_index = players.findIndex((player) => player.discordid === message.author.id);
                if (player_index === -1) return message.channel.send("❎ **| I'm sorry, you are not in this multiplayer game!**");
                players[player_index].isReady = false;

                const ready_amount = players.filter((player) => player.isReady).length;

                updateVal = {
                    $set: {
                        players: players
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author.username} is not ready (${ready_amount}/${players.length})!**`)
                })
            });
            break
        }


        // start match
        case 'start': {
            multi.findOne(query, async (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                let players = res.players;
                const is_ready = players.filter((player) => player.isReady);
                if (is_ready.length !== players.length) return message.channel.send("❎ **| I'm sorry, not every player is in ready state!**");

                let beatmap_id = res.match_settings.beatmap.id;

                const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmap_id, file: false}).catch(console.error);
                if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the map!**");
                if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the map is invalid!**");

                let length = mapinfo.total_length;

                let last_activity = res.last_activity + length + 90;

                updateVal = {
                    $set: {
                        last_activity: last_activity,
                        isOngoing: true
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    let date = new Date(last_activity * 1000);
                    message.channel.send(`✅ **| ${message.author}, successfully initiated match. Match will be started in 10 seconds.**`);
                    setTimeout(() => {
                        message.channel.send(`❗**| The match has started! Players will have to submit their play before \`${date.toUTCString()}\`!**`);

                        setTimeout(() => {
                            message.channel.send("❗**| The map has finished! Players have 1 minute to submit their play!**");

                            setTimeout(() => {
                                message.channel.send("❗**| Players have 30 seconds left to submit their play!**");

                                setTimeout(() => {
                                    message.channel.send("❗**| Players have  seconds left to submit their play!**");

                                    setTimeout(() => {
                                        message.channel.send("❗**| Score submission closed! The game host has 30 seconds to remove invalid scores!**");

                                        setTimeout(() => {
                                            multi.findOne(query, (err, mres) => {
                                                if (err) {
                                                    console.log(err);
                                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                                }
                                                if (!mres) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");

                                                let temp_scores = mres.temporary_scores;
                                                let match_settings = mres.match_settings;
                                                let condition = match_settings.win_condition;
                                                let mode = match_settings.team_mode;
                                                let teams = match_settings.teams;
                                                let mod = match_settings.mods;
                                                if (mod === 'FM') mod = '';
                                                let winner = temp_scores.filter(entry => entry.value === temp_scores[0].value);

                                                if (winner.length > 1 && (condition === 'acc' || condition === 'combo')) {
                                                    temp_scores.sort((a, b) => {return b.score - a.score});
                                                    winner = temp_scores.filter(entry => entry.score === temp_scores[0].score);
                                                }

                                                embed.setTitle("Match Result")
                                                    .setDescription(mapinfo.showStatistics(mod, 0) + "\n\n" + mapinfo.showStatistics(mod, 1))
                                                    .addField(mapinfo.showStatistics(mod, 2), mapinfo.showStatistics(mod, 3))
                                                    .addField(mapinfo.showStatistics(mod, 4), mapinfo.showStatistics(mod, 5))
                                                    .setColor(mapinfo.statusColor(mapinfo.approved))
                                                    .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
                                                    .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)

                                                if (winner.length > 1) {
                                                    let winners = '';
                                                    winner.forEach(w => {
                                                        let player_index = players.findIndex((player) => player.discordid === w.discordid);
                                                        ++players[player_index].score;
                                                        winners += `${w.username} - ${w.value.toLocaleString()}\n`
                                                    });

                                                    embed.addField("**Winners**", winners)
                                                } else {
                                                    if (mode === 'teamvs') {
                                                        let winner_team = winner.team;
                                                        for (let i = 0; i < teams[winner_team].length; i++) {
                                                            let team_member = teams[winner_team][i];
                                                            let player_index = players.findIndex((player) => player.discordid === team_member.discordid);
                                                            ++players[player_index].score
                                                        }
                                                        embed.addField("**Winner**", `${winner_team} Team - ${winner.value.toLocaleString()}`)
                                                    } else {
                                                        let player_index = players.findIndex((player) => player.discordid === winner.discordid);
                                                        ++players[player_index].score;
                                                        embed.addField("**Winner**", `${winner.username} - ${winner.value.toLocaleString()}`)
                                                    }
                                                }

                                                players.map((player) => {
                                                    player.isReady = player.hasSubmitted = false
                                                });

                                                let rank_string = '';
                                                for (let i = 0; i < temp_scores.length; i++) {
                                                    switch (mode) {
                                                        case 'hth':
                                                            rank_string += `#${i+1}: <@${temp_scores[i].discordid}> (${temp_scores[i].username}) - **${temp_scores[i].value.toLocaleString()}**\n`;
                                                            break;
                                                        case 'teamvs':
                                                            rank_string += `#${i+1}: ${temp_scores[i].team} Team - **${temp_scores[i].value.toLocaleString()}**\n`
                                                    }
                                                }

                                                embed.addField("**Player Ranking**", rank_string);

                                                updateVal = {
                                                    $set: {
                                                        temporary_scores: [],
                                                        players: players
                                                    }
                                                };

                                                multi.updateOne(query, updateVal, err => {
                                                    if (err) {
                                                        console.log(err);
                                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                                    }
                                                    message.channel.send("✅ **| Match has been decided!**", {embed: embed})
                                                })
                                            })
                                        }, 30000);

                                    }, 15000);

                                },  15000);

                            }, 30000);

                        }, length * 1000);

                    }, 10000)
                })
            });
            break
        }


        // set win condition
        case 'condition': {
            let condition = args[1];
            if (typeof condition !== "string") return message.channel.send("❎ **| Hey, please enter a valid win condition!**");
            condition = condition.toLowerCase()
            if (!['score', 'combo', 'acc', 'scorev2'].includes(condition)) return message.channel.send("❎ **| Hey, that's not a valid win condition! Accepted conditions are `acc`, `combo`, `score`, and `scorev2`.**");

            query = {channel: message.channel.id};
            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                let match_settings = res.match_settings;
                if (match_settings.win_condition === condition) return message.channel.send("❎ **| Hey, the win condition you have specified is the same as current win condition!**");

                match_settings.win_condition = condition;

                switch (condition) {
                    case 'acc':
                        condition = 'accuracy';
                        break;
                    case 'scorev2':
                        condition = 'scoreV2'
                }

                updateVal = {
                    $set: {
                        match_settings: match_settings
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully set win condition to \`${capitalizeString(condition)}\``)
                })
            });
            break
        }


        // set team mode
        case 'mode': {
            let mode = args[1];
            if (typeof mode !== "string") return message.channel.send("❎ **| Hey, please enter a valid team mode!**");
            mode = mode.toLowerCase();
            if (!['hth', 'teamvs'].includes(mode)) return message.channel.send("❎ **| Hey, that's not a valid team mode! Accepted modes are `hth` and `teamvs`.**");

            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");
                if (res.isOngoing) return message.channel.send("❎ **| Hey, a match is currently ongoing!**");

                let match_settings = res.match_settings;
                if (match_settings.team_mode === mode) return message.channel.send("❎ **| Hey, the team mode you have specified is the same as current team mode!**");

                match_settings.team_mode = mode;
                if (match_settings.team_mode === 'hth')
                    match_settings.teams = {
                        red: [],
                        blue: []
                    };

                let team_string = 'Head to Head';
                if (mode === 'teamvs') team_string = "Team Vs";

                updateVal = {
                    $set: {
                        match_settings: match_settings
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully set team mode to \`${team_string}\`.**`)
                })
            });
            break
        }


        // removes submission if score is invalid
        case 'remove': {
            let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
            if (!user) return message.channel.send("❎ **| Hey, please mention a valid user to remove score from!**");

            multi.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                if (!res.isOngoing) return message.channel.send("❎ **| Hey, no match is currently ongoing!**");
                let host = res.host;
                if (host !== message.author.id) return message.channel.send("❎ **| I'm sorry, you're not the host of this multiplayer game!**");

                let players = res.players;
                let player_index = players.findIndex((player) => player.discordid === user.id);
                if (player_index === -1) return message.channel.send("❎ **| I'm sorry, the user is not in your multiplayer game!**");
                let player = players[player_index];
                if (!player.hasSubmitted) return message.channel.send("❎ **| I'm sorry, the user hasn't submitted their play!**");

                let temp_scores = res.temporary_scores;
                let match_settings = res.match_settings;
                let condition = match_settings.win_condition;
                let mode = match_settings.team_mode;
                let teams = match_settings.teams;

                if (mode === 'hth') {
                    let temp_index = temp_scores.findIndex(score => score.discordid === user.id);
                    temp_scores.splice(temp_index, 1)
                } else {
                    let red_team = teams.red;
                    let blue_team = teams.blue;
                    let red_team_index = red_team.findIndex((player) => player.discordid === user.id);
                    let blue_team_index = blue_team.findIndex((player) => player.discordid === user.id);
                    let team;

                    if (red_team_index !== -1) team = 'red';
                    if (blue_team_index !== -1) team = 'blue';
                    if (!team) return message.channel.send("❎ **| I'm sorry, the user is not in a team!**");

                    let team_index = temp_scores.findIndex(team => team.team === team);
                    let submit_index = temp_scores.submitters.findIndex(prop => prop.discordid === user.id);
                    if (condition === 'acc') {
                        temp_scores[team_index].value *= temp_scores[team_index].submitted_scores;
                        temp_scores[team_index].value -= temp_scores.submitters[submit_index].value;
                        --temp_scores[team_index].submitted_scores;
                        temp_scores[team_index].value /= temp_scores[team_index].submitted_scores
                    } else {
                        temp_scores[team_index].value -= temp_scores.submitters[submit_index].value;
                        --temp_scores[team_index].submitted_scores
                    }

                    temp_scores[team_index].submitters.splice(submit_index, 1)
                }

                updateVal = {
                    $set: {
                        temp_scores: temp_scores
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully removed ${user}'s submitted score.**`)
                })
            });
            break
        }


        // submit play manually or automatically
        case 'submit': {
            multi.findOne(query, async (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, there is no ongoing multiplayer game in this channel!**");
                if (!res.isOngoing) return message.channel.send("❎ **| Hey, no match is currently ongoing!**");

                let players = res.players;
                let player_index = players.findIndex((player) => player.discordid === message.author.id);
                if (player_index === -1) return message.channel.send("❎ **| I'm sorry, you are not in this multiplayer game!**");
                let player = players[player_index];
                if (player.hasSubmitted) return message.channel.send("❎ **| I'm sorry, you have submitted your play!**");

                if (current_time - res.last_activity > 90) return message.channel.send("❎ **| Hey, the beatmap isn't done yet!**");
                if (current_time - res.last_activity < 30) return message.channel.send("❎ **| I'm sorry, score submission time limit has expired!**");

                let match_settings = res.match_settings;
                let condition = match_settings.win_condition;
                let mode = match_settings.team_mode;
                let teams = match_settings.teams;
                let mods = osudroid.mods.modbits_from_string(match_settings.mods);
                const free_mod = match_settings.isFreeMod;

                let temp_scores = res.temporary_scores;

                let hash = match_settings.beatmap.hash;
                let combo = 0;
                let mod = '';
                let score = 0;
                let acc = 100;
                let miss = 0;
                let date = 0;
                if (args[1] === 'recent') {
                    let recent_play = await retrievePlay(player.uid)[0];
                    if (!recent_play) return message.channel.send("❎ **| I'm sorry, you don't have any recent plays!**");
                    combo = recent_play.combo;
                    mod = osudroid.mods.droid_to_modbits(recent_play.mode);
                    acc = parseFloat(recent_play.accuracy) / 1000;
                    score = recent_play.score;
                    miss = recent_play.miss;

                    if (recent_play.hash !== hash) return message.channel.send("❎ **| I'm sorry, your recent play is deemed invalid as the play's MD5 hash is different from the map's MD5 hash!**");

                    let ptime = new Date(recent_play.date * 1000);
                    ptime.setUTCHours(ptime.getUTCHours() + 6);
                    date = Math.floor(ptime.getTime() / 1000);
                    if (date > res.last_activity - 30) return message.channel.send("❎ **| I'm sorry, your recent play is deemed as invalid! Either you've played the map too early or the score submission is late!**");
                } else {
                    score = parseInt(args[1]);
                    for (let i = 2; i < args.length; i++) {
                        if (args[i].endsWith("%")) acc = parseFloat(args[i]);
                        else if (args[i].endsWith("m")) miss = parseInt(args[i]);
                        else if (args[i].endsWith("x")) combo = parseInt(args[i]);
                        else if (args[i].startsWith("+")) mod = osudroid.mods.modbits_from_string(args[i].replace("+", ""))
                    }
                    switch (condition) {
                        case 'score':
                            if (isNaN(score) || score < 0) return message.channel.send("❎ **| Hey, that's an invalid score!**");
                            break;
                        case 'combo':
                            if (isNaN(combo) || combo < 0) return message.channel.send("❎ **| I'm sorry, the combo of your play is invalid!**");
                            if (isNaN(score) || score < 0) return message.channel.send("❎ **| Hey, that's an invalid score!**");
                            break;
                        case 'acc':
                            if (isNaN(acc) || acc < 0 || acc > 100) return message.channel.send("❎ **| I'm sorry, the accuracy of your play is invalid!**");
                            if (isNaN(score) || score < 0) return message.channel.send("❎ **| Hey, that's an invalid score!**");
                            break;
                        case 'scorev2':
                            if (isNaN(score) || score < 0) return message.channel.send("❎ **| Hey, that's an invalid score!**");
                            if (isNaN(acc) || acc < 0 || acc > 100) return message.channel.send("❎ **| I'm sorry, the accuracy of your play is invalid!**");
                            if (isNaN(miss) || miss < 0) return message.channel.send("❎ **| I'm sorry, the miss count of your play is invalid!**")
                    }
                }

                if (!free_mod && mod !== mods) return message.channel.send("❎ **| I'm sorry, your recent play is deemed invalid as the mods you have used doesn't match with forced mods!**");
                else {
                    const if_speed_up = (mods & osudroid.mods.dt) | (mods & osudroid.mods.nc) | (mods & osudroid.mods.ht);
                    if (if_speed_up) {
                        if ((mods & osudroid.mods.dt) !== (mod & osudroid.mods.dt)) return message.channel.send("❎ **| I'm sorry, your recent play is deemed invalid as you don't use the required speed-changing mod (DT)!**");
                        if ((mods & osudroid.mods.nc) !== (mod & osudroid.mods.nc)) return message.channel.send("❎ **| I'm sorry, your recent play is deemed invalid as you don't use the required speed-changing mod (NC)!**");
                        if ((mods & osudroid.mods.ht) !== (mod & osudroid.mods.ht)) return message.channel.send("❎ **| I'm sorry, your recent play is deemed invalid as you don't use the required speed-changing mod (HT)!**")
                    }
                }

                const mapinfo = await new osudroid.MapInfo().get({hash: hash, file: false}).catch(console.error);
                if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the map!**");
                if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the map is invalid!**");

                if (mapinfo.max_combo < combo) combo = mapinfo.max_combo;

                let max_score = mapinfo.max_score(mods);

                let props = {
                    discordid: player.discordid,
                    username: player.username
                };

                switch (condition) {
                    case 'score':
                        props.value = props.score = score;
                        break;
                    case 'combo':
                        props.value = combo;
                        props.score = score;
                        break;
                    case 'acc':
                        props.value = acc;
                        props.score = score;
                        break;
                    case 'scorev2':
                        props.value = scoreCalc(score, max_score, acc, miss)
                }

                if (mode === 'hth') temp_scores.push(props);
                else {
                    let red_team = teams.red;
                    let blue_team = teams.blue;
                    let red_team_index = red_team.findIndex((player) => player.discordid === message.author.id);
                    let blue_team_index = blue_team.findIndex((player) => player.discordid === message.author.id);
                    let team;

                    if (red_team_index !== -1) team = 'red';
                    if (blue_team_index !== -1) team = 'blue';
                    if (!team) return message.channel.send("❎ **| I'm sorry, you are not in a team!**");

                    let team_index = temp_scores.findIndex(team => team.team === team);
                    if (team_index !== -1) {
                        if (condition === 'acc') {
                            temp_scores[team_index].value *= temp_scores[team_index].submitted_scores;
                            temp_scores[team_index].value += props.value;
                            ++temp_scores[team_index].submitted_scores;
                            temp_scores[team_index].value /= temp_scores[team_index].submitted_scores;
                        } else {
                            temp_scores[team_index].value += props.value;
                            ++temp_scores[team_index].submitted_scores
                        }
                        temp_scores.submitters.push(props)
                    } else temp_scores.push({
                        submitted_scores: 1,
                        team: team,
                        value: props.value,
                        submitters: [props]
                    })
                }

                temp_scores.sort((a, b) => {return b.value - a.value});
                player.hasSubmitted = true;
                players[player_index] = player;

                updateVal = {
                    $set: {
                        players: players,
                        temporary_scores: temp_scores
                    }
                };

                multi.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully submitted your score.**`)
                })
            });
            break
        }
        default: return message.channel.send("❎ **| I'm sorry, your first argument is invalid! Accepted arguments are `about`, `beatmap`, `condition`, `create`, `host`, `info`, `join`, `kick`, `max`, `mod`, `mode`, `password`, `ready`, `rename`, `submit`, `start`, `team`, and `unready`.**")
    }
};

module.exports.config = {
    name: "multiplayer",
    aliases: "mp",
    description: "Main command for multiplayer.",
    usage: "multiplayer about\nmp about",
    detail: "Usage outputs information which contains every information about multiplayer.",
    permission: "None"
};