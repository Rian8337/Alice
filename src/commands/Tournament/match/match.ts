import { Constants } from "@alice-core/Constants";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Snowflake } from "discord.js";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";

export const run: Command["run"] = async (_, interaction) => {
    const constantsLocalization: ConstantsLocalization =
        new ConstantsLocalization(await CommandHelper.getLocale(interaction));

    const whitelistedGuilds: Snowflake[] = [
        Constants.mainServer,
        Constants.testingServer,
        "526214018269184001",
    ];

    if (
        !interaction.inCachedGuild() ||
        !whitelistedGuilds.includes(interaction.guildId)
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                constantsLocalization.getTranslation(
                    Constants.notAvailableInServerReject
                )
            ),
        });
    }

    if (!interaction.member.roles.cache.find((r) => r.name === "Referee")) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                constantsLocalization.getTranslation(
                    Constants.noPermissionReject
                )
            ),
        });
    }

    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.TOURNAMENT;

export const config: Command["config"] = {
    name: "match",
    description:
        "Main command for tournament matches.\n\nThis command has a special permission that cannot be modified.",
    options: [
        {
            name: "add",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Adds a match.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The ID of the match, in {<pool ID>.<match ID>} format.",
                },
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The name of the match.",
                },
                {
                    name: "team1name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The name of team 1.",
                },
                {
                    name: "team2name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The name of team 2.",
                },
                {
                    name: "team1players",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The players in team 1, in the format {<player name> <uid>} for each player, separated by space.",
                },
                {
                    name: "team2players",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The players in team 2, in the format {<player name> <uid>} for each player, separated by space.",
                },
            ],
        },
        {
            name: "bind",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Binds a match to the current channel and creates a thread for the match.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The ID of the match.",
                },
            ],
        },
        {
            name: "check",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Checks the status of a match.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The ID of the match. Defaults to the match in current binded thread.",
                },
            ],
        },
        {
            name: "end",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Ends a match.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The ID of the match. Defaults to the match in current binded thread.",
                },
            ],
        },
        {
            name: "manualsubmit",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Manually submits a round of score for a match.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The ID of the match.",
                },
                {
                    name: "pick",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The current pick (NM1, NM2, etc).",
                },
                {
                    name: "team1scores",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "Scores from team 1, in format {<score>[h] <acc> <miss>} for every player by order in the team.",
                },
                {
                    name: "team2scores",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "Scores from team 2, in format {<score>[h] <acc> <miss>} for every player by order in the team.",
                },
            ],
        },
        {
            name: "remove",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Removes a match.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The ID of the match.",
                },
            ],
        },
        {
            name: "start",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Starts a round in a match. This can only be done in a binded thread (see /match bind).",
            options: [
                {
                    name: "pick",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The current pick (NM1, NM2, etc).",
                },
            ],
        },
        {
            name: "submit",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Submits the most recent play of each player in a match.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The ID of the match. Defaults to the match in current binded thread.",
                },
                {
                    name: "pick",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The pick to be submitted. If omitted, uses the most recent play from all participants in the match.",
                },
            ],
        },
        {
            name: "unbind",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Unbinds an ended match and closes (archives) its thread.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The ID of the match. Defaults to the match in current binded thread.",
                },
            ],
        },
        {
            name: "undo",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Undo the recent result of a match.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The match to undo. Defaults to the match in current binded channel.",
                },
            ],
        },
    ],
    example: [
        {
            command: "match add",
            arguments: [
                {
                    name: "id",
                    value: "t11f1.m1",
                },
                {
                    name: "name",
                    value: "osu!droid 11th Tournament",
                },
                {
                    name: "team1name",
                    value: "Red Team",
                },
                {
                    name: "team2name",
                    value: "Blue Team",
                },
                {
                    name: "team1players",
                    value: "NeroYuki 5455 Rian8337 51076",
                },
                {
                    name: "team2players",
                    value: "RisingSTORM 117819 NabilaSari 156828",
                },
            ],
            description:
                'will add a match with ID `t11f1.m1` and name "osu!droid 11th Tournament", and the following teams and players:\n- Red Team: NeroYuki (uid 5455) and Rian8337 (uid 51076)\n- Blue Team: RisingSTORM (uid 117819) and NabilaSari (uid 156828)',
        },
        {
            command: "match bind",
            arguments: [
                {
                    name: "id",
                    value: "t11f1.m1",
                },
            ],
            description:
                "will bind the match with ID `t11f1.m1` to the channel the command is executed.",
        },
    ],
    permissions: ["SPECIAL"],
    scope: "GUILD_CHANNEL",
};
