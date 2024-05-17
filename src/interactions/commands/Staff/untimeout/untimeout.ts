import { GuildMember } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { OperationResult } from "structures/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { TimeoutManager } from "@alice-utils/managers/TimeoutManager";
import { UntimeoutLocalization } from "@alice-localization/interactions/commands/Staff/untimeout/UntimeoutLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: UntimeoutLocalization = new UntimeoutLocalization(
        CommandHelper.getLocale(interaction),
    );

    const toUntimeout: GuildMember = await interaction.guild!.members.fetch(
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

    const reason: string =
        interaction.options.getString("reason") ?? "Not specified.";

    await InteractionHelper.deferReply(interaction);

    const result: OperationResult = await TimeoutManager.removeTimeout(
        toUntimeout,
        interaction,
        reason,
        localization.language,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("untimeoutFailed"),
                result.reason!,
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
    replyEphemeral: true,
    scope: "GUILD_CHANNEL",
};
