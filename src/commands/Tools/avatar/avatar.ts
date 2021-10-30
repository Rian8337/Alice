import { GuildMember, MessageEmbed, User } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";

export const run: Command["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const avatarEmbed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { color: (<GuildMember | null> interaction.member)?.displayColor }
    );

    avatarEmbed.setAuthor(user.tag)
        .setDescription(`[Avatar Link](${user.avatarURL({ dynamic: true, size: 1024 })})`)
        .setImage(user.avatarURL({ dynamic: true, size: 1024 })!);

    const embeds: MessageEmbed[] = [ avatarEmbed ];

    await user.fetch(true);

    if (user.banner) {
        const bannerEmbed: MessageEmbed = EmbedCreator.createNormalEmbed(
            { color: (<GuildMember | null> interaction.member)?.displayColor }
        );

        bannerEmbed.setAuthor(user.tag)
            .setDescription(`[Banner Link](${user.bannerURL({ dynamic: true, size: 1024 })})`)
            .setImage(user.bannerURL({ dynamic: true, size: 1024 })!);

        embeds.push(bannerEmbed);
    }

    interaction.editReply({
        embeds: embeds
    });
};

export const category: Command["category"] = CommandCategory.TOOLS;

export const config: Command["config"] = {
    name: "avatar",
    description: "Shows a user's global avatar and if available, a user's profile banner.",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionTypes.USER,
            description: "The user to get the avatar and/or profile banner from. If unspecified, will default to yourself."
        }
    ],
    example: [
        {
            command: "avatar",
            description: "will show your global avatar and if available, your profile banner."
        },
        {
            command: "avatar",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001"
                }
            ],
            description: "will show Rian8337's global avatar and if available, Rian8337's profile banner."
        },
        {
            command: "avatar",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520"
                }
            ],
            description: "will show the avatar and if available, the profile banner of the user with that Discord ID."
        }
    ],
    permissions: [],
    scope: "ALL"
};