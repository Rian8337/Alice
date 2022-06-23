import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { AnyChannel, Collection } from "discord.js";

export const run: EventUtil["run"] = async (client) => {
    setInterval(async () => {
        const inactiveRooms: Collection<string, MultiplayerRoom> =
            await DatabaseManager.aliceDb.collections.multiplayerRoom.get(
                "roomId",
                {
                    "status.isPlaying": false,
                    "status.playingSince": {
                        $lte: Date.now() - 3600 * 1000,
                    },
                }
            );

        for (const inactiveRoom of inactiveRooms.values()) {
            const channel: AnyChannel | null = await client.channels
                .fetch(inactiveRoom.channelId)
                .catch(() => null);

            if (!channel?.isThread() || channel.archived) {
                await inactiveRoom.deleteRoom();
            }
        }
    }, 5 * 60 * 1000);
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for periodically checking inactive multiplayer rooms.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
