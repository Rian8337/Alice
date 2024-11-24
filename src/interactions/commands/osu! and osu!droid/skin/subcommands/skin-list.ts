import { DatabaseManager } from "@database/DatabaseManager";
import { PlayerSkin } from "@database/utils/aliceDb/PlayerSkin";
import { SkinLocalization } from "@localization/interactions/commands/osu! and osu!droid/skin/SkinLocalization";
import { SlashSubcommand } from "@structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { Collection, EmbedBuilder, GuildMember, User } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: SkinLocalization = new SkinLocalization(
        CommandHelper.getLocale(interaction),
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
            },
        );

    if (skins.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noSkinSetForUser"),
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
            user.toString(),
        ),
    );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        embed.addFields(
            entries.slice(5 * (page - 1), 5 + 5 * (page - 1)).map((v, i) => {
                return {
                    name: `${5 * (page - 1) + i + 1}. ${v.name}`,
                    value: v.description,
                };
            }),
        );
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(skins.size / 5),
        90,
        onPageChange,
    );
};
