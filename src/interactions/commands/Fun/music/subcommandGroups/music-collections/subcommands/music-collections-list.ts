import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { MusicLocalization } from "@alice-localization/interactions/commands/Fun/music/MusicLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { Collection, GuildMember, EmbedBuilder, User } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        CommandHelper.getLocale(interaction),
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const collections: Collection<string, MusicCollection> =
        await DatabaseManager.aliceDb.collections.musicCollection.getUserCollections(
            user,
        );

    if (collections.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    user.id === interaction.user.id
                        ? "selfHasNoCollection"
                        : "userHasNoCollection",
                ),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setDescription(
        `${localization.getTranslation("totalCollections")}: ${
            collections.size
        }`,
    );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 10 * (page - 1);
            i < Math.min(collections.size, 10 + 10 * (page - 1));
            ++i
        ) {
            const item: MusicCollection = collections.at(i)!;
            embed.addFields({
                name: `${i + 1}. ${item.name}`,
                value: `${localization.getTranslation(
                    "createdAt",
                )}: ${DateTimeFormatHelper.dateToLocaleString(
                    new Date(item.createdAt),
                    localization.language,
                )}`,
            });
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(collections.size / 10),
        90,
        onPageChange,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
