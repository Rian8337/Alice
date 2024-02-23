import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildBasedChannel,
    GuildMember,
    MessageCreateOptions,
} from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Symbols } from "@alice-enums/utils/Symbols";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    if (member.guild.id !== Constants.mainServer) {
        return;
    }

    const general: GuildBasedChannel | null = await member.guild.channels.fetch(
        Constants.mainServer,
    );

    if (!general?.isTextBased()) {
        return;
    }

    const isBinded: boolean =
        await DatabaseManager.elainaDb.collections.userBind.isUserBinded(
            member.id,
        );

    const options: MessageCreateOptions = {
        content: `Welcome ${isBinded ? "back " : ""}to ${
            member.guild.name
        }, ${member}!`,
        files: [
            new AttachmentBuilder(Constants.welcomeImagePath, {
                name: "welcomeimage.png",
            }),
        ],
    };

    if (!isBinded) {
        const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

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
