import { SlashCommandBuilder, CommandInteraction, Guild, EmbedBuilder, BaseGuildEmoji, GuildEmoji, Emoji, Locale } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction:CommandInteraction) {
        var server = (interaction.guild as Guild)
		var emojistring = "";
		var emojis = server.emojis.cache
		for (let index = 0; index < emojis.size; index++) {
			const emoji = (emojis.at(index) as GuildEmoji)
			if (index == 0) {
				emojistring+=`<:${emoji.identifier}>`
			}
			else {
				emojistring+=`, <:${emoji.identifier}>`
			}
			
		}
		var sortedMembers = (await server.members.fetch()).sort((A,B)=>(B.joinedTimestamp as number) - (A.joinedTimestamp as number))
		const serverInfo = new EmbedBuilder()
			.setColor("#689cc5")
			.setTitle(server.name)
			.setThumbnail(server.iconURL({size:1024,extension:"jpeg"}))
			.addFields([
				{name:"Members", value:String(server.memberCount), inline: true},
				{name:"Date Created", value:`<t:${Math.floor(server.createdTimestamp/1000)}:D>`,inline:true},
				{name:"Bot Joined", value:`<t:${Math.floor(server.joinedTimestamp/1000)}:D>`, inline: true},

				{name:"Text Channels", value:String(server.channels.cache.filter(ch => ch.isTextBased() == true).size-server.channels.cache.filter(ch => ch.isVoiceBased() == true).size-server.channels.cache.filter(ch => ch.isThread() == true).size), inline: true},
				{name:"Voice Channels", value:String(server.channels.cache.filter(ch => ch.isVoiceBased() == true).size), inline: true},
				{name:"Thread Channels", value:String(server.channels.cache.filter(ch => ch.isThread() == true).size), inline: true},

				{name:"Owner", value:`<@${server.ownerId}>`,inline:true},
				{name:"Emojis",value:emojistring, inline:true},
				{name:"Number of Roles", value:String(server.roles.cache.size), inline:true},

				{name:"Preferred Language", value:server.preferredLocale, inline:true},
				{name:"Newest Member", value:`<@${sortedMembers.first()?.id}>`, inline:true},
				{name:"First Member", value:`<@${sortedMembers.last()?.id}>`, inline:true},
			]);
			
		await interaction.reply({embeds:[serverInfo]});
	},
};