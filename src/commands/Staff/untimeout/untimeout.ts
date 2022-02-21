import { GuildMember } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { TimeoutManager } from "@alice-utils/managers/TimeoutManager";
import { UntimeoutLocalization } from "@alice-localization/commands/Staff/UntimeoutLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    const localization: UntimeoutLocalization = new UntimeoutLocalization(await CommandHelper.getLocale(interaction));

    const toUntimeout: GuildMember = await interaction.guild!.members.fetch(
        interaction.options.getUser("user", true)
    );

    if (
        !(await TimeoutManager.userCanTimeout(
            <GuildMember>interaction.member,
            Number.POSITIVE_INFINITY
        ))
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userCannotUntimeoutError")
            ),
        });
    }

    const reason: string =
        interaction.options.getString("reason") ?? "Not specified.";

    const result: OperationResult = await TimeoutManager.removeTimeout(
        toUntimeout,
        interaction,
        reason,
        localization.language
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("untimeoutFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("untimeoutSuccessful")
        ),
    });
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "untimeout",
    description: `Untimeouts a user. This command's permission can be configured using the /settings command.`,
    options: [
        {
            name: "user",
            required: true,
            type: ApplicationCommandOptionTypes.USER,
            description: "The user to untimeout.",
        },
        {
            name: "reason",
            type: ApplicationCommandOptionTypes.STRING,
            description:
                "The reason for untimeouting the user. Maximum length is 1500 characters.",
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
    permissions: ["SPECIAL"],
    replyEphemeral: true,
    scope: "GUILD_CHANNEL",
};
