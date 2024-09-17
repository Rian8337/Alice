import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildMember,
    GuildMemberFlags,
    MessageCreateOptions,
} from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { Symbols } from "@alice-enums/utils/Symbols";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    if (member.guild.id !== Constants.mainServer || member.user.bot) {
        return;
    }

    const general = await member.guild.channels.fetch(Constants.mainServer);

    if (!general?.isTextBased()) {
        return;
    }

    const rejoined = member.flags.has(GuildMemberFlags.DidRejoin);

    const options: MessageCreateOptions = {
        content: `Welcome ${rejoined ? "back " : ""}to ${
            member.guild.name
        }, ${member}!`,
        files: [
            new AttachmentBuilder(Constants.welcomeImagePath, {
                name: "welcomeimage.png",
            }),
        ],
    };

    if (!rejoined) {
        const row = new ActionRowBuilder<ButtonBuilder>();

        row.addComponents(
            new ButtonBuilder()
                .setCustomId("initialOnboarding")
                .setEmoji(Symbols.wavingHand)
                .setStyle(ButtonStyle.Primary)
                .setLabel("Bot Introduction"),
        );

        options.components = [row];
    }

    general.send(options);
};

export const config: EventUtil["config"] = {
    description: "Responsible for greeting new users to the server.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
