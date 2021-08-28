import { GuildChannel, GuildMember, MessageEmbed } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { Symbols } from "@alice-enums/utils/Symbols";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    const welcomeChannel: GuildChannel | null = await member.guild.channels.fetch("360716684174032896");

    if (!welcomeChannel?.isText()) {
        return;
    }

    let joinMessage: string =
        `Welcome to ${member.guild.name}'s ${welcomeChannel}.\n\n` +
        `To verify yourself as someone who plays osu!droid or interested in the game and open the rest of the server, you can follow *any* of the following methods:\n\n` +
        `- post your osu!droid screenshot (main menu if you are an online player or recent result (score) if you are an offline player). If you've just created an osu!droid account, please submit a score to the account before verifying\n` +
        `- post your osu! profile (screenshot or link to profile) and reason why you join this server\n` +
        `after that, you can ping <@&369108742077284353> and/or <@&595667274707370024> and wait for one to come to verify you.\n\n` +
        `**Do note that you have 1 week to verify, otherwise you will be automatically kicked.**`;

    const timeDiff: number = Math.floor((Date.now() - member.user.createdTimestamp) / 1000);

    if (timeDiff < 604800) {
        joinMessage += `\n\n**[${Symbols.exclamationMark}]** Account age: ${DateTimeFormatHelper.secondsToDHMS(timeDiff)}`;
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { color: "#ffdd00" }
    );

    embed.setDescription(joinMessage);

    welcomeChannel.send({ content: member.toString(), embeds: [embed] });
};

export const config: EventUtil["config"] = {
    description: "Responsible for greeting newly joined users (and prompt them to verify).",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};