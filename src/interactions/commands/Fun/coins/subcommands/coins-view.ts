import { User } from "discord.js";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { CoinsLocalization } from "@localization/interactions/commands/Fun/coins/CoinsLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { Language } from "@localization/base/Language";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const language: Language = CommandHelper.getLocale(interaction);

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(user, {
            projection: { _id: 0, coins: 1 },
        });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new CoinsLocalization(language).getTranslation(
                user.id === interaction.user.id
                    ? "selfCoinAmountInfo"
                    : "userCoinAmountInfo",
            ),
            (playerInfo?.coins ?? 0).toLocaleString(
                LocaleHelper.convertToBCP47(language),
            ),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
