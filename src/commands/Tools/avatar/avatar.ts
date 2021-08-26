import { GuildMember, MessageEmbed, User } from "discord.js";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";

export const run: Command["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { color: (<GuildMember | null> interaction.member)?.displayColor }
    );

    embed.setAuthor(user.tag)
        .setDescription(`[Avatar Link](${user.avatarURL({ dynamic: true, size: 1024 })})`)
        .setImage(user.avatarURL({ dynamic: true, size: 1024 })!);

    interaction.editReply({
        embeds: [embed]
    });
};

export const category: Command["category"] = CommandCategory.TOOLS;

export const config: Command["config"] = {
    name: "avatar",
    description: "Retrieves a user's avatar.",
    options: [
        {
            name: "user",
            type: CommandArgumentType.USER,
            description: "The user to get the avatar from. If unspecified, will default to yourself."
        }
    ],
    example: [
        {
            command: "avatar",
            description: "will retrieve your avatar."
        },
        {
            command: "avatar @Rian8337#0001",
            description: "will retrieve Rian8337's avatar."
        },
        {
            command: "avatar 132783516176875520",
            description: "will retrieve the avatar of the user with that Discord ID."
        }
    ],
    permissions: [],
    scope: "ALL"
};