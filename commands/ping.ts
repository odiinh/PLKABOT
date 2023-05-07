import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction:CommandInteraction) {
		const progress = new EmbedBuilder()
                .setColor("#689cc5")
                .setTitle("Pinging...");
		const sent = await interaction.reply({ embeds:[progress], fetchReply: true });
		const replyEmbed = new EmbedBuilder()
			.setTitle("Pong!")
			.setColor("DarkGreen")
			.setThumbnail("https://emojigraph.org/media/microsoft/ping-pong_1f3d3.png")
			.setFields({name:"API Latency",value: "`"+interaction.client.ws.ping+"ms`",inline:true},
						{name:"Roundtrip latency",value: "`"+(sent.createdTimestamp - interaction.createdTimestamp)+"ms`",inline:true},
						)

		await interaction.editReply({embeds:[replyEmbed]});
	},
};