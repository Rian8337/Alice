import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ProfileBackground } from "@alice-database/utils/aliceDb/ProfileBackground";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { Collection, GuildMember, EmbedBuilder } from "discord.js";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Symbols } from "@alice-enums/utils/Symbols";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        CommandHelper.getLocale(interaction),
    );

    const backgrounds: Collection<string, ProfileBackground> =
        await DatabaseManager.aliceDb.collections.profileBackgrounds.get("id");

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    "picture_config.backgrounds": 1,
                },
            },
        );

    const ownedBackgrounds: ProfileBackground[] = (
        playerInfo?.picture_config.backgrounds ?? []
    ).map((v) =>
        Object.assign(
            DatabaseManager.aliceDb.collections.profileBackgrounds
                .defaultInstance,
            v,
        ),
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    const backgroundsArray: ProfileBackground[] = [...backgrounds.values()];

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 10 * (page - 1);
            i < Math.min(backgroundsArray.length, 10 + 10 * (page - 1));
            ++i
        ) {
            const bg: ProfileBackground = backgroundsArray[i];
            embed.addFields({
                name: `${i + 1}. ${bg.name}`,
                value: `${localization.getTranslation("owned")}: ${
                    bg.id === "default" ||
                    ownedBackgrounds.find((v) => v.id === bg.id)
                        ? Symbols.checkmark
                        : Symbols.cross
                }`,
            });
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(backgrounds.size / 10),
        60,
        onPageChange,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
