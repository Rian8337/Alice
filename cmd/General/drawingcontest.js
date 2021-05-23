const { loadImage } = require('canvas');
const Discord = require('discord.js');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (!(message.channel instanceof Discord.DMChannel)) {
        return message.channel.send("❎ **| I'm sorry, this command is only available in DM.**");
    }

    const database = alicedb.collection("drawingcontest");
    const imageChannel = client.guilds.cache.get("528941000555757598").channels.cache.get("845913749419327529");
    if (!(imageChannel instanceof Discord.TextChannel)) {
        return;
    }

    switch (args[0]) {
        case "submit": {
            if (message.attachments.size !== 1) {
                return message.channel.send("❎ **| Hey, I need an attachment of your work!**");
            }

            const attachment = message.attachments.first();

            const url = attachment.url;
            const length = url.length;
            if (
                url.indexOf("png", length - 3) === -1 &&
                url.indexOf("jpg", length - 3) === -1 &&
                url.indexOf("jpeg", length - 4) === -1
            ) {
                return message.channel.send("❎ **| Hey, accepted file formats are PNG, JPG, and JPEG!**");
            }

            if (attachment.size > 8e6) {
                return message.channel.send("❎ **| I'm sorry, the file's size must be less than 8 MB!**");
            }

            const image = await loadImage(url);
            if (image.naturalWidth !== 1920 || image.naturalHeight !== 1080) {
                return message.channel.send("❎ **| I'm sorry, the entry's final resolution must be 1920x1080!**");
            }

            // Check for existing entry and overwrite it if it exists
            const res = await database.findOne({ discordid: message.author.id });
            if (res) {
                const { attachmentMessageID } = res;

                const attachmentMessage = await imageChannel.messages.fetch(attachmentMessageID);

                if (attachmentMessage) {
                    const oldEntry = attachmentMessage.attachments.first();
                    await message.channel.send("❗**| Showing your latest entry before this submission in case you need it later.**", { files: [oldEntry] })
                    attachmentMessage.delete();
                }
            }

            imageChannel.send(`Submitter: ${message.author} (${message.author.id})`, { files: [attachment] }).then(async msg => {
                await database.updateOne({ discordid: message.author.id }, { $set: { attachmentMessageID: msg.id } }, { upsert: true });

                message.channel.send("✅ **| Successfully submitted your entry.**");
            });

            break;
        }

        case "view": {
            const res = await database.findOne({ discordid: message.author.id });

            if (!res) {
                return message.channel.send("❎ **| I'm sorry, you do not have any submission!**");
            }

            const { attachmentMessageID } = res;

            const attachmentMessage = await imageChannel.messages.fetch(attachmentMessageID);

            message.channel.send("✅ **| Showing your current submission.**", { files: [attachmentMessage.attachments.first()] });

            break;
        }

        case "unsubmit": {
            const res = await database.findOne({ discordid: message.author.id });

            if (!res) {
                return message.channel.send("❎ **| I'm sorry, you do not have any submission!**");
            }

            const { attachmentMessageID } = res;

            const attachmentMessage = await imageChannel.messages.fetch(attachmentMessageID);

            await message.channel.send("❗**| Showing your latest submission before deletion in case you need it later.**", { files: [attachmentMessage.attachments.first()] });

            attachmentMessage.delete();

            await database.deleteOne({ discordid: message.author.id });

            message.channel.send("✅ **| Successfully deleted your submission.**");

            break;
        }

        default: return message.channel.send(`❎ **| I'm sorry, your first argument (${args[0]}) is incorrect! Accepted arguments are \`submit\`, \`unsubmit\`, and \`view\`.**`);
    }
};

module.exports.config = {
	name: "drawingcontest",
	description: "Limited command for the ongoing drawing contest. **You can only use this command in DM**.\n\n__**Contest Rules**__\n1. **All entries must conform to applicable server rules, namely rule 0, 1, 3, 4, and 6**.\n2. You have **2 weeks** since this announcement to draw your entry.\n3. **All entries' resolution must be 1920x1080 and its size must be less than 8 MB. Additionally, the final entry must either be in PNG, JPG, or JPEG. These will be checked automatically**.\n4. **Only submit your own work**. Finding inspirations from other's work is cool, but don't fully take it to your drawing. Plagiarism sucks and we don't tolerate it.\n5. All leftover questions about this contest must be redirected to <#501021206217228288>.",
	usage: "drawingcontest submit\ndrawingcontest unsubmit\ndrawingcontest view",
	detail: "`submit` will submit a new entry or overwrite your existing submission for the contest. An attachment must be provided (send your entry along with the command).\n\n`unsubmit` will unsubmit your current entry (if any).\n\n`view` will view your current submission.",
	permission: "None"
};