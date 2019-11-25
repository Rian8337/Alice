module.exports.run = (client, message, args) => {
	switch (args[0]) {
			case 'teatime': message.channel.send('('+message.author.username+') sent', {file: './image/teatime.png'});break;
			case 'test': message.channel.send('('+message.author.username+') sent', {file: './image/test.png'});break;
			default: message.channel.send('('+message.author.username+') sent', {file: './image/'+args[0]+'/'+args[1]+'.png'});break;
		}
	message.author.lastMessage.delete();
}

module.exports.help = {
	name: "emote"
}
