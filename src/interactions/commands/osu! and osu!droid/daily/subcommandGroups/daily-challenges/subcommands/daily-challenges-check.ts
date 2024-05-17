import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { BaseMessageOptions } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        CommandHelper.getLocale(interaction),
    );

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(
            interaction.options.getString("id", true),
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotFound"),
            ),
        });
    }

    if (!challenge.link[0]) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noDownloadLink"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const options: BaseMessageOptions | null =
        await EmbedCreator.createChallengeEmbed(
            challenge,
            challenge.isWeekly ? "#af46db" : "#e3b32d",
            localization.language,
        );

    InteractionHelper.reply(
        interaction,
        options ?? {
            // TODO: put in localization
            content: MessageCreator.createReject("Embed creation failed."),
        },
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
