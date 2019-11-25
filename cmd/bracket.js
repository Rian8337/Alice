module.exports.run = (client, message, args) => {
	message.channel.send({file: 'bracket.png'});
}

module.exports.help = {
	name: "bracket"
}