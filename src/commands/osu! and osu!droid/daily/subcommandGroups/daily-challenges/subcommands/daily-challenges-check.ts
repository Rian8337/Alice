import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Language } from "@alice-localization/base/Language";
import { DailyLocalization } from "@alice-localization/commands/osu! and osu!droid/daily/DailyLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(
            interaction.options.getString("id", true)
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new DailyLocalization(language).getTranslation(
                    "challengeNotFound"
                )
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    InteractionHelper.reply(
        interaction,
        await EmbedCreator.createChallengeEmbed(
            challenge,
            challenge.type === "weekly" ? "#af46db" : "#e3b32d",
            language
        )
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
