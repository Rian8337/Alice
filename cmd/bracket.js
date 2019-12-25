module.exports.run = (client, message) => {
	message.channel.send({file: 'bracket.png'});
};

module.exports.config = {
	description: "Views a bracket of tournament (outdated).",
	usage: "bracket",
	detail: "None",
	permission: "None"
};

module.exports.help = {
	name: "bracket"
};
