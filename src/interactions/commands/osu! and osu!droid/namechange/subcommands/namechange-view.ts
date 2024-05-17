import { bold, Collection, EmbedBuilder, userMention } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NamechangeLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/namechange/NamechangeLocalization";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

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
