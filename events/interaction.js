const Discord = require('discord.js');
const { Db } = require('mongodb');

/**
 * @param {string[]} subCommands
 * @param {Array<Discord.Channel|Discord.User|Discord.Role|string|number|boolean>} args 
 * @param {Discord.CommandInteractionOption[]} options
 */
function getSubCommandsAndArguments(subCommands, args, options) {
    for (const option of options) {
        switch (option.type) {
            case "SUB_COMMAND_GROUP":
                subCommands.push(option.name);
                break;
            case "SUB_COMMAND":
                subCommands.push(option.name);
                getSubCommandsAndArguments(subCommands, args, option.options ?? []);
                break;
            case "BOOLEAN":
            case "STRING":
            case "INTEGER":
                args.push(option.value);
                break;
            case "ROLE":
                args.push(option.role);
                break;
            case "CHANNEL":
                args.push(option.channel);
                break;
            case "USER":
                args.push(option.user);
                break;
        }
    }
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, interaction, maindb, alicedb) => {
    if (interaction.replied || !interaction.isCommand()) {
        return;
    }

    interaction.isOwner = interaction.user.id === '132783516176875520' || interaction.user.id === '386742340968120321';
    const { options } = interaction;

    /**
     * @type {string[]}
     */
    const subCommands = [];
    /**
     * @type {Array<Discord.Channel|Discord.User|Discord.Role|string|number|boolean>}
     */
    const args = [];

    getSubCommandsAndArguments(subCommands, args, options);

    const obj = {
		client,
		interaction,
        subCommands,
		args,
		maindb,
		alicedb
	};

    client.subevents.get("interactionHandler").run(obj);
};

module.exports.config = {
    name: "interaction"
};