import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { CommandInteraction, GuildMember, User } from "discord.js";
import { recalcStrings } from "../recalcStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.hasAny(
            ...Config.verifyPerm
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.noPermissionReject),
        });
    }

    const user: User = interaction.options.getUser("user", true);

    if (CacheManager.recalculationQueue.has(user.id)) {
        return interaction.editReply({
            content: MessageCreator.createReject(recalcStrings.userIsInQueue),
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(user);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.userNotBindedReject),
        });
    }

    if (bindInfo.hasAskedForRecalc) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                recalcStrings.userHasRequestedRecalc
            ),
        });
    }

    if (await bindInfo.isDPPBanned()) {
        return interaction.editReply({
            content: MessageCreator.createReject(recalcStrings.userIsDPPBanned),
        });
    }

    if (CacheManager.recalculationQueue.size > 0) {
        CacheManager.recalculationQueue.set(user.id, interaction);

        return interaction.editReply({
            content: MessageCreator.createReject(recalcStrings.userQueued),
        });
    }

    CacheManager.recalculationQueue.set(user.id, interaction);

    if (!interaction.replied) {
        await interaction.editReply({
            content: MessageCreator.createAccept(
                recalcStrings.recalcInProgress
            ),
        });
    }

    const result: OperationResult = await bindInfo.recalculateAllScores();

    CacheManager.recalculationQueue.delete(user.id);

    if (result.success) {
        await interaction.channel!.send({
            content: MessageCreator.createAccept(
                recalcStrings.recalcSuccess,
                interaction.user.toString(),
                user.toString()
            ),
        });
    } else {
        await interaction.channel!.send({
            content: MessageCreator.createReject(
                recalcStrings.recalcFailed,
                interaction.user.toString(),
                result.reason!
            ),
        });
    }

    const nextInteraction: CommandInteraction | undefined =
        CacheManager.recalculationQueue.first();

    if (nextInteraction) {
        run(_, interaction);
    }
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
