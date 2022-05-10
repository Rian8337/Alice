import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DailyLocalization } from "@alice-localization/commands/osu! and osu!droid/daily/DailyLocalization";
import { ChallengeType } from "@alice-types/challenge/ChallengeType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const type: ChallengeType =
        <ChallengeType>interaction.options.getString("type") ?? "daily";

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getOngoingChallenge(
            type
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingChallenge")
            ),
        });
    }

    if (!challenge.link[0]) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noDownloadLink")
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    InteractionHelper.reply(
        interaction,
        await EmbedCreator.createChallengeEmbed(
            challenge,
            challenge.isWeekly ? "#af46db" : "#e3b32d",
            localization.language
        )
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
