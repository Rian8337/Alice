import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";

export const run: EventUtil["run"] = async () => {
    const nameChanges =
        await DatabaseManager.aliceDb.collections.nameChange.getActiveNameChangeRequests();

    for (const nameChange of nameChanges.values()) {
        await nameChange.accept();

        console.log(`Processed uid ${nameChange.uid}`);
    }

    console.log("Done");
};

export const config: EventUtil["config"] = {
    description: "idek",
    togglePermissions: [],
    toggleScope: [],
};
