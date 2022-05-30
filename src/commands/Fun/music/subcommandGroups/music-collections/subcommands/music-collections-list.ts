import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MusicLocalization } from "@alice-localization/commands/Fun/music/MusicLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { Collection, GuildMember, MessageEmbed, User } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const collections: Collection<string, MusicCollection> =
        await DatabaseManager.aliceDb.collections.musicCollection.getUserCollections(
            user
        );

    if (collections.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    user.id === interaction.user.id
                        ? "selfHasNoCollection"
                        : "userHasNoCollection"
                )
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setDescription(
        `${localization.getTranslation("totalCollections")}: ${
            collections.size
        }`
    );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 10 * (page - 1);
            i < Math.min(collections.size, 10 + 10 * (page - 1));
            ++i
        ) {
            embed.addField(
                `${i + 1}. ${collections.at(i)!.name}`,
                `${localization.getTranslation(
                    "createdAt"
                )}: ${DateTimeFormatHelper.dateToLocaleString(
                    new Date(collections.at(i)!.createdAt),
                    localization.language
                )}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(collections.size / 10),
        90,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
