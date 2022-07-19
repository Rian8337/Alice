import { GuildMember, EmbedBuilder, Role, TextChannel } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "structures/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { LoungeLock } from "@alice-database/utils/aliceDb/LoungeLock";

export const run: EventUtil["run"] = async (_, __, newMember: GuildMember) => {
    if (newMember.guild.id !== Constants.mainServer) {
        return;
    }

    const role: Role | undefined = newMember.guild.roles.cache.find(
        (r) => r.name === "Lounge Pass"
    );

    if (!role) {
        return;
    }

    if (!newMember.roles.cache.has(role.id)) {
        return;
    }

    const lockInfo: LoungeLock | null =
        await DatabaseManager.aliceDb.collections.loungeLock.getUserLockInfo(
            newMember.id
        );

    if (!lockInfo) {
        return;
    }

    if (lockInfo.isExpired) {
        return;
    }

    await newMember.roles.remove(
        role,
        `Locked from lounge channel for \`${
            lockInfo.reason ?? "not specified"
        }\``
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        color: "#b58d3c",
        timestamp: true,
    });

    embed.setDescription(
        `${newMember} is locked from lounge channel!\n` +
            `Reason: ${lockInfo.reason ?? "Not specified"}.\n\n` +
            `This lock will ${
                !Number.isFinite(lockInfo.expiration)
                    ? "not expire"
                    : `expire at ${new Date(lockInfo.expiration).toUTCString()}`
            }.`
    );

    (<TextChannel>newMember.guild.channels.resolve("783506454966566912")).send({
        embeds: [embed],
    });
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for checking if a user is locked from lounge channel upon giving lounge pass role.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
