import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMapLengthInfo } from "@alice-database/utils/aliceDb/TournamentMapLengthInfo";
import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { GuildMember, MessageEmbed } from "discord.js";
import { poolStrings } from "./poolStrings";

export const run: Command["run"] = async (_, interaction) => {
    const id: string = interaction.options.getString("id", true);

    const mappoolMainData: TournamentMappool | null =
        await DatabaseManager.elainaDb.collections.tournamentMappool.getFromId(
            id
        );

    if (!mappoolMainData) {
        return interaction.editReply({
            content: MessageCreator.createReject(poolStrings.poolNotFound),
        });
    }

    const mappoolDurationData: TournamentMapLengthInfo | null =
        await DatabaseManager.aliceDb.collections.tournamentMapLengthInfo.getFromId(
            id
        );

    if (!mappoolDurationData) {
        return interaction.editReply({
            content: MessageCreator.createReject(poolStrings.poolNotFound),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(mappoolMainData.map.length, 5 + 5 * (page - 1));
            ++i
        ) {
            embed.addField(
                mappoolMainData.map[i][1],
                `**Length**: ${DateTimeFormatHelper.secondsToDHMS(
                    parseInt(<string>mappoolDurationData.map[i][1])
                )}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        mappoolMainData.map,
        5,
        1,
        60,
        onPageChange
    );
};

export const category: Command["category"] = CommandCategory.TOURNAMENT;

export const config: Command["config"] = {
    name: "pool",
    description:
        "Retrieves a list of beatmaps from a registered tournament mappool.",
    options: [
        {
            name: "id",
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            description: "The ID of the mappool.",
        },
    ],
    example: [
        {
            command: "pool",
            arguments: [
                {
                    name: "id",
                    value: "t11sf",
                },
            ],
            description:
                'will retrieve a list of beatmaps from tournament mappool "t11sf".',
        },
        {
            command: "pool t8gf",
            arguments: [
                {
                    name: "id",
                    value: "t8gf",
                },
            ],
            description:
                'will retrieve a list of beatmaps from tournament mappool "t8gf".',
        },
    ],
    permissions: [],
    scope: "ALL",
};
