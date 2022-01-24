import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";

export const run: EventUtil["run"] = async () => {
    const dbManager = DatabaseManager.aliceDb.collections.nameChange;

    await dbManager.update(
        {},
        {
            $set: {
                cooldown: 0,
            },
        }
    );
};

export const config: EventUtil["config"] = {
    description: "idk",
    togglePermissions: [],
    toggleScope: [],
    debugEnabled: true,
};
