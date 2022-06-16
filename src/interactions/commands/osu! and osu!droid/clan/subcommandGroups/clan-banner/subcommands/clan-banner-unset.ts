import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { Snowflake, Collection, GuildMember } from "discord.js";

export const run: SlashSubcommand["run"] = async (client, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    let clanName: string;

    const allowedConfirmations: Snowflake[] = [];

    if (interaction.options.getString("name")) {
        const staffMembers: Collection<Snowflake, GuildMember> =
            await PermissionHelper.getMainGuildStaffMembers(client);

        if (!staffMembers.has(interaction.user.id)) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation(
                        "selfHasNoAdministrativePermission"
                    )
                ),
            });
        }

        allowedConfirmations.push(...staffMembers.keys());

        clanName = interaction.options.getString("name", true);
    } else {
        const bindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                interaction.user
            );

        if (!bindInfo) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    new ConstantsLocalization(
                        localization.language
                    ).getTranslation(Constants.selfNotBindedReject)
                ),
            });
        }

        if (!bindInfo.clan) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("selfIsNotInClan")
                ),
            });
        }

        clanName = bindInfo.clan;
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(clanName);

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanDoesntExist")
            ),
        });
    }

    // Only clan co-leaders, leaders, and staff members can remove clan icons
    if (
        !clan.hasAdministrativePower(interaction.user) &&
        allowedConfirmations.length === 1
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("removeBannerConfirmation")
            ),
        },
        allowedConfirmations,
        20,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    const setResult: OperationResult = await clan.setBanner(
        undefined,
        localization.language
    );

    if (!setResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("removeBannerFailed"),
                setResult.reason!
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("removeBannerFailed"),
                setResult.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("removeBannerSuccessful")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
