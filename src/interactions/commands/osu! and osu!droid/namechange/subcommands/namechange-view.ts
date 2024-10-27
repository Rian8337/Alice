import { bold, Collection, EmbedBuilder, userMention } from "discord.js";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { NameChange } from "@database/utils/aliceDb/NameChange";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { NamechangeLocalization } from "@localization/interactions/commands/osu! and osu!droid/namechange/NamechangeLocalization";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: NamechangeLocalization = new NamechangeLocalization(
        CommandHelper.getLocale(interaction),
    );

    const nameChanges: Collection<number, NameChange> =
        await DatabaseManager.aliceDb.collections.nameChange.getActiveNameChangeRequests();

    if (nameChanges.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noActiveRequest"),
            ),
        });
    }

    nameChanges.sort((a, b) => a.cooldown - b.cooldown);

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "#cb9000",
    });

    embed.setTitle(localization.getTranslation("nameChangeRequestList"));

    const entries: NameChange[] = [...nameChanges.values()];

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 10 * (page - 1);
            i < Math.min(nameChanges.size, 10 + 10 * (page - 1));
            ++i
        ) {
            const content: NameChange = entries[i];

            if (content) {
                embed.addFields({
                    name: `${bold((i + 1).toString())}. ${bold(
                        `Uid ${content.uid}`,
                    )}`,
                    value:
                        `${bold(
                            localization.getTranslation("discordAccount"),
                        )}: ${userMention(content.discordid)} (${
                            content.discordid
                        })\n` +
                        `${bold(
                            localization.getTranslation("usernameRequested"),
                        )}: ${content.new_username}\n` +
                        `${bold(
                            localization.getTranslation("creationDate"),
                        )}: ${DateTimeFormatHelper.dateToLocaleString(
                            new Date((content.cooldown - 86400 * 30) * 1000),
                            localization.language,
                        )}`,
                });
            }
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(nameChanges.size / 10),
        60,
        onPageChange,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
