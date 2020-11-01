const osudroid = require('osu-droid');

module.exports.run = async (client, message, maindb, alicedb) => {
    let msgArray = message.content.split(/\s+/g);
    for await (const entry of msgArray) {
        if (!entry.startsWith("http://ops.dgsrz.com/profile")) continue;
        const a = entry.split("=");
        const uid = parseInt(a[a.length - 1]);
        if (isNaN(uid)) continue;
        const player = await osudroid.Player.getInformation({uid: uid});
        if (player.error || !player.username) continue;
        client.commands.get("pfid").run(client, message, [uid], maindb, alicedb);
    }
};

module.exports.config = {
    name: "profileFetch"
};