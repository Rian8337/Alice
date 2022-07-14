import { User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { CoinsLocalization } from "@alice-localization/interactions/commands/Fun/coins/CoinsLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { Language } from "@alice-localization/base/Language";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(user, {
            projection: { _id: 0, alicecoins: 1 },
        });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new CoinsLocalization(language).getTranslation(
                user.id === interaction.user.id
                    ? "selfCoinAmountInfo"
                    : "userCoinAmountInfo"
            ),
            (playerInfo?.alicecoins ?? 0).toLocaleString(
                LocaleHelper.convertToBCP47(language)
            )
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
