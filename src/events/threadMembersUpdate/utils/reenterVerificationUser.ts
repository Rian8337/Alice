import { Constants } from "@alice-core/Constants";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import {
    Collection,
    Role,
    Snowflake,
    ThreadChannel,
    ThreadMember,
} from "discord.js";

export const run: EventUtil["run"] = async (
    _,
    oldMembers: Collection<Snowflake, ThreadMember>,
    newMembers: Collection<Snowflake, ThreadMember>
) => {
    if (oldMembers.size < newMembers.size) {
        return;
    }

    const thread: ThreadChannel | undefined = (
        newMembers.first() ?? oldMembers.first()
    )?.thread;

    if (thread?.parentId !== Constants.verificationChannel) {
        return;
    }

    const memberLeft: ThreadMember = oldMembers.difference(newMembers).first()!;

    // Try to readd the user into the thread, otherwise assume the user left (it can only be the case)
    try {
        await thread.guild.members.fetch(memberLeft.id);

        const onVerificationRole: Role = thread.guild.roles.cache.find(
            (v) => v.name === "On Verification"
        )!;

        if (memberLeft.guildMember!.roles.cache.has(onVerificationRole.id)) {
            await thread.members.add(memberLeft);
        }
    } catch {
        await thread.setArchived(true, "Verifying user left the server");
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for reentering a user to a verification thread if they leave from it.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
