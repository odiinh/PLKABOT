import { SlashCommandBuilder, CommandInteraction, GuildMemberRoleManager, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Guild, GuildTextBasedChannel, MessageActionRowComponentBuilder, ButtonInteraction, ComponentType, CollectorFilter, StringSelectMenuInteraction, CacheType, Collection, Snowflake, Message } from 'discord.js';

module.exports = {
    cooldown: 172800,
	data: new SlashCommandBuilder()
		.setName('massdelete')
		.setDescription("Deletes last 5 mentions of a term. Can only be used once every 2 days.")
        .addStringOption(option=>option.setName("name").setDescription("The name to look for.").setRequired(true))
        .addBooleanOption(option=>option.setName("override").setDescription("Overrides the delete limit and cooldown in case of a ELE (expulsion level event)").setRequired(true)),




	async execute(interaction:CommandInteraction) {
            if (!interaction.deferred && !interaction.replied) await interaction.deferReply();
            var searchTerm = interaction.options.get("name")?.value
            var override = (interaction.options.get("override")?.value as boolean)
            
            const progress = new EmbedBuilder()
                .setThumbnail("https://cdn.discordapp.com/attachments/1102298257935310939/1102544851565805640/Pulse-1s-200px_3.gif")
                .setColor("#689cc5")
                .setTitle("Searching for Messages including term `"+searchTerm+"`...")
            // var refresh = setInterval(() => interaction.editReply({embeds:[progress]}), 2000); 
            const channel = interaction.channel
            let messages:Array<Message> = [];

            // Create message pointer
            let message = await channel?.messages
                .fetch({ limit: 1 })
                .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));
            
            while (message) {
                await channel?.messages
                    .fetch({ limit: 100, before: message.id })
                    .then(messagePage => {
                        messagePage.forEach(msg => messages.push(msg));
                        // Update our message pointer to be last message in page of messages
                        message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
                        progress.setDescription("Gathered `"+messages.length+"` messages.")
                        interaction.editReply({embeds:[progress]})
                    })
            };
            // clearInterval(refresh)

            var x:string[] = []
            let count = 0
            messages?.forEach(async (element) => {
                if (count == 5 && override==false) return;
                else if (element.interaction == null && element.content.toLowerCase().includes((searchTerm as string).toLowerCase())) {
                    x.push("`"+element.content+"`" + " - " + element.author.tag + " on " + element.createdAt.toLocaleString("en-GB"))
                    count++
                    await element.delete()
                    
                }
            });
            
            const resultEmbed = new EmbedBuilder()
                .setTitle("Done!")
                .setDescription("Deleted " + count + " occurances of '" + searchTerm + "'.")
                .setColor("Green");
            x.forEach((element) => {
                resultEmbed.setDescription(resultEmbed.data.description+"\n\n"+element)
            })

            if (x.length == 0) {
                resultEmbed.setTitle("Failed!")
                resultEmbed.setColor("Red")
                resultEmbed.setDescription("Couldn't find any occurances of '" + searchTerm + "' in this channel.")
            }
            interaction.editReply({embeds:[resultEmbed]})
            
	},
};