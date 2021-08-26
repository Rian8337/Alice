import { Subcommand } from "@alice-interfaces/core/Subcommand";

export const run: Subcommand["run"] = async (_, interaction) => {
    const name: string = interaction.options.getString("name", true);

    const amount: number = interaction.options.getInteger("amount", true);
};

export const config: Subcommand["config"] = {
    permissions: []
};