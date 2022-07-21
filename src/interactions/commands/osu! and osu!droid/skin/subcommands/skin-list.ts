import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerSkin } from "@alice-database/utils/aliceDb/PlayerSkin";
import { SkinLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/skin/SkinLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection, EmbedBuilder, GuildMember, User } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: SkinLocalization = new SkinLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const skins: Collection<string, PlayerSkin> =
        await DatabaseManager.aliceDb.collections.playerSkins.get(
            "name",
            { discordid: user.id },
            {
                projection: {
                    _id: 0,
                    name: 1,
                    description: 1,
                },
            }
        );

    if (skins.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noSkinSetForUser")
            ),
        });
    }

    const entries: PlayerSkin[] = [...skins.values()];

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed.setTitle(
        StringHelper.formatString(
            localization.getTranslation("userSkinList"),
            user.toString()
        )
    );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        embed.addFields(
            entries.slice(10 * (page - 1), 10 + 10 * (page - 1)).map((v, i) => {
                return {
                    name: `${10 * (page - 1) + i + 1}. ${v.name}`,
                    value: v.description,
                };
            })
        );
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(skins.size / 10),
        90,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
