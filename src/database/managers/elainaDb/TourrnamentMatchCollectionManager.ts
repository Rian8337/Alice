import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { DatabaseTournamentMatch } from "structures/database/elainaDb/DatabaseTournamentMatch";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Snowflake } from "discord.js";

/**
 * A manager for the `matchinfo` command.
 */
export class TournamentMatchCollectionManager extends DatabaseCollectionManager<
    DatabaseTournamentMatch,
    TournamentMatch
> {
    protected override readonly utilityInstance: new (
        data: DatabaseTournamentMatch,
    ) => TournamentMatch = TournamentMatch;

    override get defaultDocument(): DatabaseTournamentMatch {
        return {
            matchid: "",
            channelId: "",
            name: "",
            player: [],
            result: [],
            status: "scheduled",
            team: [],
        };
    }

    /**
     * Gets a match by its ID.
     *
     * @param id The ID of the match.
     * @returns The match, `null` if not found.
     */
    getById(id: string): Promise<TournamentMatch | null> {
        return this.getOne({ matchid: id });
    }

    /**
     * Gets a match by its bound channel.
     *
     * @param channelId The ID of the channel.
     * @returns The match, `null` if not found.
     */
    getByChannel(channelId: Snowflake): Promise<TournamentMatch | null> {
        return this.getOne({ channelId: channelId });
    }
}
