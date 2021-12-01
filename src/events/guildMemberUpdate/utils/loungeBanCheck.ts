import {
    GuildChannel,
    GuildMember,
    MessageEmbed,
    Role,
    TextChannel,
} from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { LoungeLock } from "@alice-database/utils/aliceDb/LoungeLock";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    if (member.guild.id !== Constants.mainServer) {
        return;
    }

    const role: Role | undefined = member.guild.roles.cache.find(
        (r) => r.name === "Lounge Pass"
    );

    if (!role) {
        return;
    }

    if (!member.roles.cache.has(role.id)) {
        return;
    }

    const lockInfo: LoungeLock | null =
        await DatabaseManager.aliceDb.collections.loungeLock.getUserLockInfo(
            member.id
        );

    if (!lockInfo) {
        return;
    }

    if (lockInfo.isExpired) {
        await (<GuildChannel>(
            member.guild.channels.cache.get(Constants.loungeChannel)
        )).permissionOverwrites.delete(member.id);
        return;
    }

    member.roles.remove(
        role,
        `Locked from lounge channel for \`${
            lockInfo.reason ?? "not specified"
        }\``
    );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: "#b58d3c",
        timestamp: true,
    });

    embed.setDescription(
        `${member} is locked from lounge channel!\n` +
            `Reason: ${lockInfo.reason ?? "Not specified"}.\n\n` +
            `This lock will ${
                !Number.isFinite(lockInfo.expiration)
                    ? "not expire"
                    : `expire at ${new Date(lockInfo.expiration).toUTCString()}`
            }.`
    );

    (<TextChannel>member.guild.channels.resolve("783506454966566912")).send({
        embeds: [embed],
    });
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for checking if a user is locked from lounge channel upon giving lounge pass role.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
