import { DatabaseManager } from "@alice-database/DatabaseManager";
import { consola } from "consola";
import { EventUtil } from "structures/core/EventUtil";

export const run: EventUtil["run"] = async () => {
    setInterval(async () => {
        consola.info("Checking name changes");

        const nameChanges =
            await DatabaseManager.aliceDb.collections.nameChange.getActiveNameChangeRequests();

        for (const nameChange of nameChanges.values()) {
            await nameChange.accept();

            consola.info(`Processed uid ${nameChange.uid}`);
        }

        consola.success("Done");
    }, 60 * 30 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for accepting name change requests.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
