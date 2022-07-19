import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { EventUtil } from "structures/core/EventUtil";
import { Channel, Collection } from "discord.js";

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
            const channel: Channel | null = await client.channels
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
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
