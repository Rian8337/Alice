import { GuildMember } from "discord.js";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MuteOperationResult } from "@alice-interfaces/moderation/MuteOperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MuteManager } from "@alice-utils/managers/MuteManager";
import { unmuteStrings } from "./unmuteStrings";

export const run: Command["run"] = async(_, interaction) => {
    const toUnmute: GuildMember = await interaction.guild!.members.fetch(interaction.options.getUser("user", true));

    if (await MuteManager.userCanMute(<GuildMember> interaction.member, 1)) {
        return interaction.editReply({
            content: MessageCreator.createReject(unmuteStrings.userCannotUnmuteError)
        });
    }

    const reason: string = interaction.options.getString("reason") ?? "Not specified.";

    const result: MuteOperationResult = await MuteManager.removeMute(toUnmute, interaction, reason);
    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                unmuteStrings.unmuteFailed, <string> result.reason
            )
        });
    }

    interaction.deleteReply();
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "unmute",
    description: `Unmutes a user.\n\nThis command has a special permission that can be configured using the /settings command.`,
    options: [
        {
            name: "user",
            required: true,
            type: CommandArgumentType.USER,
            description: "The user to unmute."
        },
        {
            name: "reason",
            type: CommandArgumentType.STRING,
            description: "The reason for unmuting the user. Maximum length is 1500 characters."
        }
    ],
    example: [
        {
            command: "mute @Rian8337#0001 boo",
            description: "will unmute Rian8337 for \"boo\"."
        },
        {
            command: "mute 132783516176875520 bad",
            description: "will unmute the user with that Discord ID for \"bad\"."
        }
    ],
    permissions: ["SPECIAL"],
    replyEphemeral: true,
    scope: "GUILD_CHANNEL"
};