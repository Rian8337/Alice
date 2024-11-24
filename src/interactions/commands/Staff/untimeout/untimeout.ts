import { GuildMember, InteractionContextType } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { TimeoutManager } from "@utils/managers/TimeoutManager";
import { UntimeoutLocalization } from "@localization/interactions/commands/Staff/untimeout/UntimeoutLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new UntimeoutLocalization(
        CommandHelper.getLocale(interaction),
    );

    const toUntimeout = await interaction.guild.members.fetch(
        interaction.options.getUser("user", true),
    );

    if (
        !(await TimeoutManager.userCanTimeout(
            <GuildMember>interaction.member,
            Number.POSITIVE_INFINITY,
        ))
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userCannotUntimeoutError"),
            ),
        });
    }

    const reason = interaction.options.getString("reason") ?? "Not specified.";

    await InteractionHelper.deferReply(interaction);

    const result = await TimeoutManager.removeTimeout(
        toUntimeout,
        interaction,
        reason,
        localization.language,
    );

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("untimeoutFailed"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("untimeoutSuccessful"),
        ),
    });
};

export const category: SlashCommand["category"] = CommandCategory.staff;

export const config: SlashCommand["config"] = {
    name: "untimeout",
    description: `Untimeouts a user. This command's permission can be configured using the /settings command.`,
    options: [
        {
            name: "user",
            required: true,
            type: ApplicationCommandOptionType.User,
            description: "The user to untimeout.",
        },
        {
            name: "reason",
            type: ApplicationCommandOptionType.String,
            description: "The reason for untimeouting the user.",
            maxLength: 1500,
        },
    ],
    example: [
        {
            command: "untimeout",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
                {
                    name: "reason",
                    value: "boo",
                },
            ],
            description: 'will untimeout Rian8337 for "boo".',
        },
        {
            command: "untimeout",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
                {
                    name: "reason",
                    value: "bad",
                },
            ],
            description:
                'will untimeout the user with that Discord ID for "bad".',
        },
    ],
    permissions: ["Special"],
    contexts: [InteractionContextType.Guild],
    replyEphemeral: true,
};
