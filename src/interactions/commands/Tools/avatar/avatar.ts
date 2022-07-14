import { GuildMember, MessageEmbed, User } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const avatarEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    avatarEmbed
        .setAuthor({
            name: user.tag,
        })
        .setDescription(
            `[Avatar Link](${user.avatarURL({ dynamic: true, size: 1024 })})`
        )
        .setImage(user.avatarURL({ dynamic: true, size: 1024 })!);

    const embeds: MessageEmbed[] = [avatarEmbed];

    if (user.banner) {
        const bannerEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({
            color: (<GuildMember | null>interaction.member)?.displayColor,
        });

        bannerEmbed
            .setAuthor({
                name: user.tag,
            })
            .setDescription(
                `[Banner Link](${user.bannerURL({
                    dynamic: true,
                    size: 1024,
                })})`
            )
            .setImage(user.bannerURL({ dynamic: true, size: 1024 })!);

        embeds.push(bannerEmbed);
    }

    InteractionHelper.reply(interaction, {
        embeds: embeds,
    });
};

export const category: SlashCommand["category"] = CommandCategory.TOOLS;

export const config: SlashCommand["config"] = {
    name: "avatar",
    description:
        "Shows a user's global avatar and if available, a user's profile banner.",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionTypes.USER,
            description:
                "The user to get the avatar and/or profile banner from. If unspecified, will default to yourself.",
        },
    ],
    example: [
        {
            command: "avatar",
            description:
                "will show your global avatar and if available, your profile banner.",
        },
        {
            command: "avatar",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description:
                "will show Rian8337's global avatar and if available, Rian8337's profile banner.",
        },
        {
            command: "avatar",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
            ],
            description:
                "will show the avatar and if available, the profile banner of the user with that Discord ID.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
