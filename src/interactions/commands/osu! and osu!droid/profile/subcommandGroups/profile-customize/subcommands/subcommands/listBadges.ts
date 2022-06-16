import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { Collection, GuildMember, MessageEmbed } from "discord.js";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { ProfileBadgeOwnerInfo } from "@alice-interfaces/commands/osu! and osu!droid/ProfileBadgeOwnerInfo";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { ProfileBadge } from "@alice-database/utils/aliceDb/ProfileBadge";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { PartialProfileBackground } from "@alice-interfaces/profile/PartialProfileBackground";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const badgeList: Collection<string, ProfileBadge> =
        await DatabaseManager.aliceDb.collections.profileBadges.getAllBadgesSorted();

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user,
            { retrieveBadges: true }
        );

    const userBadges: PartialProfileBackground[] =
        playerInfo?.picture_config.badges ?? [];

    const finalBadgeList: ProfileBadgeOwnerInfo[] = [];

    for (const badge of badgeList.values()) {
        finalBadgeList.push(
            Object.defineProperty(
                <ProfileBadgeOwnerInfo>(<unknown>badge),
                "isOwned",
                {
                    value: !!userBadges.find((v) => v.id === badge.id),
                    configurable: true,
                    enumerable: true,
                    writable: true,
                }
            )
        );
    }

    finalBadgeList.sort((a, b) => {
        return Number(b.isOwned) - Number(a.isOwned);
    });

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(finalBadgeList.length, 5 + 5 * (page - 1));
            ++i
        ) {
            const c: ProfileBadgeOwnerInfo = finalBadgeList[i];

            embed.addField(
                `${i + 1}. ${c.name} (\`${c.id}\`${
                    c.isOwned ? ", owned" : ""
                })`,
                // TODO: move description to bot-side instead of database
                `Rewarded for ${c.description}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(finalBadgeList.length / 5),
        150,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
