import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TournamentBeatmap } from "structures/tournament/TournamentBeatmap";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { PoolLocalization } from "@alice-localization/interactions/commands/Tournament/pool/PoolLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { EmbedBuilder, GuildMember } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: PoolLocalization = new PoolLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string = interaction.options.getString("id", true);

    const pool: TournamentMappool | null =
        await DatabaseManager.elainaDb.collections.tournamentMappool.getFromId(
            id
        );

    if (!pool) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("poolNotFound")
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(pool.maps.size, 5 + 5 * (page - 1));
            ++i
        ) {
            const map: TournamentBeatmap = pool.maps.at(i)!;

            embed.addFields({
                name: map.name,
                value: `**${localization.getTranslation(
                    "length"
                )}**: ${DateTimeFormatHelper.secondsToDHMS(
                    map.duration,
                    localization.language
                )}`,
            });
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(pool.maps.size / 5),
        60,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
