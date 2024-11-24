import { DatabaseManager } from "@database/DatabaseManager";
import { ClanCollectionManager } from "@database/managers/elainaDb/ClanCollectionManager";
import { Clan } from "@database/utils/elainaDb/Clan";
import { ClanMember } from "structures/clan/ClanMember";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { ClanLocalization } from "@localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { GuildMember, EmbedBuilder, bold, userMention } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        CommandHelper.getLocale(interaction),
    );

    const dbManager: ClanCollectionManager =
        DatabaseManager.elainaDb.collections.clan;

    const clan: Clan | null = interaction.options.getString("name")
        ? await dbManager.getFromName(
              interaction.options.getString("name", true),
          )
        : await dbManager.getFromUser(interaction.user);

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    interaction.options.getString("name")
                        ? "clanDoesntExist"
                        : "selfIsNotInClan",
                ),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color:
            (await clan.getClanRole())?.color ??
            (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(`${clan.name} Members`);

    if (clan.iconURL) {
        embed.setThumbnail(clan.iconURL);
    }

    const onPageChange: OnButtonPageChange = async (_, page) => {
        const clanMemberDescriptions: string[] = [];

        for (
            let i = 5 * (page - 1);
            i < Math.min(clan.member_list.size, 5 + 5 * (page - 1));
            ++i
        ) {
            const member: ClanMember = clan.member_list.at(i)!;

            clanMemberDescriptions.push(
                `${bold(
                    `${5 * (page - 1) + i + 1}. ${userMention(member.id)} (#${
                        member.rank
                    })`,
                )}\n` +
                    `${bold(localization.getTranslation("discordId"))}: ${
                        member.id
                    }\n` +
                    `${bold("Uid")}: ${member.uid}\n` +
                    `${bold(localization.getTranslation("clanMemberRole"))}: ${
                        member.hasPermission
                            ? `${localization.getTranslation(
                                  member.id === clan.leader
                                      ? "clanMemberRoleLeader"
                                      : "clanMemberRoleCoLeader",
                              )}`
                            : localization.getTranslation(
                                  "clanMemberRoleMember",
                              )
                    }\n` +
                    `${bold(
                        localization.getTranslation("clanMemberUpkeepValue"),
                    )}: ${clan.calculateUpkeep(member.id)} Mahiru coins`,
            );
        }

        embed.setDescription(clanMemberDescriptions.join("\n\n"));
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(clan.member_list.size / 5),
        90,
        onPageChange,
    );
};
