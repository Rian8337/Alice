import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MapshareLocalization } from "@alice-localization/commands/osu! and osu!droid/MapshareLocalization";
import { MapShareSubmissionStatus } from "@alice-types/utils/MapShareSubmissionStatus";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection, GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const status: MapShareSubmissionStatus =
        <MapShareSubmissionStatus>interaction.options.getString("status") ??
        "pending";

    const submissions: Collection<number, MapShare> =
        await DatabaseManager.aliceDb.collections.mapShare.getByStatus(status);

    if (submissions.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new MapshareLocalization(await CommandHelper.getLocale(interaction)).getTranslation("noSubmissionWithStatus"),
                status
            ),
        });
    }

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(submissions.size / 10)
    );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(
        `Submissions with ${StringHelper.capitalizeString(status)} status`
    );

    const onPageChange: OnButtonPageChange = async (
        _,
        page,
        contents: MapShare[]
    ) => {
        for (
            let i = 10 * (page - 1);
            i < Math.min(contents.length, 10 + 10 * (page - 1));
            ++i
        ) {
            const submission: MapShare = contents[i];

            embed.addField(
                `${i + 1}. Submission from ${submission.submitter}`,
                `**User ID**: ${submission.id}\n` +
                `**Beatmap ID**: ${submission.beatmap_id} ([Beatmap Link](https://osu.ppy.sh/b/${submission.beatmap_id}))\n` +
                `**Creation Date**: ${new Date(
                    submission.date * 1000
                ).toUTCString()}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        [...submissions.values()],
        10,
        page,
        90,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
