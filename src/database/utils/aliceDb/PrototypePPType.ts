import { DatabaseManager } from "@database/DatabaseManager";
import { DatabasePrototypePPType } from "@structures/database/aliceDb/DatabasePrototypePPType";
import { Manager } from "@utils/base/Manager";

/**
 * Represents a prototype pp type in the database, which classifies the rework a prototype profile is in.
 */
export class PrototypePPType
    extends Manager
    implements DatabasePrototypePPType
{
    readonly type: string;
    readonly name: string;
    readonly description: string;

    constructor(
        data: DatabasePrototypePPType = DatabaseManager.aliceDb?.collections
            .prototypePPType.defaultDocument ?? {},
    ) {
        super();

        this.type = data.type;
        this.name = data.name;
        this.description = data.description;
    }
}
