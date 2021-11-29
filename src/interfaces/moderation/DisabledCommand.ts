/**
 * Represents a disabled command.
 */
export interface DisabledCommand {
    /**
     * The name of the command.
     */
    name: string;

    /**
     * The cooldown of the command for each user. If the command is disabled, this will be -1.
     */
    cooldown: number;
}