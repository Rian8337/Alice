import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "structures/core/EventUtil";

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
    description: "Responsible for accepting name change requests.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
