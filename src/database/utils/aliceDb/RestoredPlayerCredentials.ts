import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseRestoredPlayerCredentials } from "@alice-interfaces/database/aliceDb/DatabaseRestoredPlayerCredentials";
import { Manager } from "@alice-utils/base/Manager";

/**
 * Represents a player whose account was deleted due to the *incident*.
 *
 * Keep in mind that this information is temporary, but immutable, and should not be changed.
 */
export class RestoredPlayerCredentials
    extends Manager
    implements DatabaseRestoredPlayerCredentials
{
    readonly Id: number;
    readonly Username: string;
    readonly Password: string;
    readonly Email: string;
    readonly DeviceId: string;
    readonly Score: number;
    readonly Playcount: number;
    readonly Accuracy: number;
    readonly RegistTime: string;
    readonly LastLoginTime: string;
    readonly RegistIp: string;
    readonly Region: string;
    readonly Active: boolean;
    readonly Supporter: boolean;
    readonly Banned: boolean;
    readonly RestrictMode: boolean;

    constructor(
        data: DatabaseRestoredPlayerCredentials = DatabaseManager.aliceDb
            ?.collections.restoredPlayerCredentials.defaultDocument
    ) {
        super();

        this.Id = data.Id;
        this.Username = data.Username;
        this.Password = data.Password;
        this.Email = data.Email;
        this.DeviceId = data.DeviceId;
        this.Score = data.Score;
        this.Playcount = data.Playcount;
        this.Accuracy = data.Accuracy;
        this.RegistTime = data.RegistTime;
        this.LastLoginTime = data.LastLoginTime;
        this.RegistIp = data.RegistIp;
        this.Region = data.Region;
        this.Active = data.Active;
        this.Supporter = data.Supporter;
        this.Banned = data.Banned;
        this.RestrictMode = data.RestrictMode;
    }
}
