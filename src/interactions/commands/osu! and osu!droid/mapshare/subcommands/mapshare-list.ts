import { DatabaseManager } from "@database/DatabaseManager";
import { MapShare } from "@database/utils/aliceDb/MapShare";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { MapshareLocalization } from "@localization/interactions/commands/osu! and osu!droid/mapshare/MapshareLocalization";
import { MapShareSubmissionStatus } from "structures/utils/MapShareSubmissionStatus";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { Collection, GuildMember, EmbedBuilder, bold } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MapshareLocalization = new MapshareLocalization(
        CommandHelper.getLocale(interaction),
    );

    const status: MapShareSubmissionStatus =
        <MapShareSubmissionStatus>interaction.options.getString("status") ??
        "pending";

    const submissions: Collection<number, MapShare> =
        await DatabaseManager.aliceDb.collections.mapShare.getByStatus(status);

    if (submissions.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noSubmissionWithStatus"),
                status,
            ),
        });
    }

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(submissions.size / 10),
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(
        StringHelper.formatString(
            localization.getTranslation("submissionStatusList"),
            StringHelper.capitalizeString(status),
        ),
    );

    const entries: MapShare[] = [...submissions.values()];

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 10 * (page - 1);
            i < Math.min(submissions.size, 10 + 10 * (page - 1));
            ++i
        ) {
            const submission: MapShare = entries[i];

            embed.addFields({
                name: `${i + 1}. ${StringHelper.formatString(
                    localization.getTranslation("submissionFromUser"),
                    submission.submitter,
                )}`,
                value:
                    `${bold(localization.getTranslation("userId"))}: ${
                        submission.id
                    }\n` +
                    `${bold(localization.getTranslation("beatmapId"))}: ${
                        submission.beatmap_id
                    } ([${localization.getTranslation(
                        "beatmapLink",
                    )}](https://osu.ppy.sh/b/${submission.beatmap_id}))\n` +
                    `${bold(
                        localization.getTranslation("creationDate"),
                    )}: ${DateTimeFormatHelper.dateToLocaleString(
                        new Date(submission.date * 1000),
                        localization.language,
                    )}`,
            });
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        page,
        Math.ceil(submissions.size / 10),
        90,
        onPageChange,
    );
};
