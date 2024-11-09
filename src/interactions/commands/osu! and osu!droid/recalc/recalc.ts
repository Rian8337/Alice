import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { Constants } from "@core/Constants";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { PPHelper } from "@utils/helpers/PPHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.has(
            PPHelper.ppModeratorRole,
        )
    ) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(
                    CommandHelper.getLocale(interaction),
                ).getTranslation(Constants.noPermissionReject),
            ),
        });
    }

    CommandHelper.runSlashSubcommandFromInteraction(
        interaction,
        CommandHelper.getLocale(interaction),
    );
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "recalc",
    description:
        "The main command for prototype droid performance points (dpp) recalculation system.",
    options: [
        {
            name: "calculate",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Recalculates a user as prototype droid performance points (dpp).",
            options: [
                {
                    name: "reworktype",
                    type: ApplicationCommandOptionType.String,
                    description: "The rework type of the prototype.",
                    required: true,
                    autocomplete: true,
                },
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "The user to recalculate.",
                },
                {
                    name: "uid",
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the user.",
                    minValue: Constants.uidMinLimit,
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionType.String,
                    description: "The username of the user.",
                    minLength: 2,
                    maxLength: 20,
                    autocomplete: true,
                },
            ],
        },
        {
            name: "calculateall",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Recalculates all players in the current prototype droid performance points (dpp) system.",
            options: [
                {
                    name: "reworktype",
                    type: ApplicationCommandOptionType.String,
                    description: "The rework type of the prototype.",
                    required: true,
                    autocomplete: true,
                },
                {
                    name: "reworkname",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The name of the rework. Required for new reworks.",
                },
                {
                    name: "resetprogress",
                    type: ApplicationCommandOptionType.Boolean,
                    description:
                        "Whether to reset the progress of the previous recalculation.",
                },
            ],
        },
    ],
    example: [
        {
            command: "recalc calculateall",
            arguments: [],
            description:
                "will recalculate all scores of all users in the prototype droid performance points (dpp) system.",
        },
        {
            command: "recalc calculate",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will recalculate Rian8337's scores.",
        },
    ],
    permissions: ["Special"],
    scope: "GUILD_CHANNEL",
};
