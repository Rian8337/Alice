import { DatabaseManager } from "@database/DatabaseManager";
import { AccountTransferLocalization } from "@localization/interactions/commands/osu! and osu!droid/accounttransfer/AccountTransferLocalization";
import { SlashSubcommand } from "@structures/core/SlashSubcommand";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { ProfileManager } from "@utils/managers/ProfileManager";
import { GuildMember, hyperlink } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const dbManager = DatabaseManager.aliceDb.collections.accountTransfer;
    const localization = new AccountTransferLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const accountTransfer = await dbManager.getFromDiscordId(
        interaction.user.id,
    );

    if (!accountTransfer) {
        return interaction.editReply({
            content: localization.getTranslation("noAccountTransfer"),
        });
    }

    InteractionHelper.reply(interaction, {
        embeds: [
            EmbedCreator.createNormalEmbed({
                author: interaction.user,
                color: (<GuildMember | null>interaction.member)?.displayColor,
            })
                .setTitle(localization.getTranslation("transferInfoEmbedTitle"))
                .addFields(
                    {
                        name: localization.getTranslation(
                            "transferInfoEmbedTargetName",
                        ),
                        value: hyperlink(
                            accountTransfer.transferUid.toString(),
                            ProfileManager.getProfileLink(
                                accountTransfer.transferUid,
                            ),
                        ),
                    },
                    {
                        name: localization.getTranslation(
                            "transferInfoAccountListName",
                        ),
                        value: accountTransfer.transferList
                            // Do not include the transfer target in the list
                            .filter((v) => v !== accountTransfer.transferUid)
                            .map((v) =>
                                hyperlink(
                                    v.toString(),
                                    ProfileManager.getProfileLink(v),
                                ),
                            )
                            .join(", "),
                    },
                ),
        ],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
