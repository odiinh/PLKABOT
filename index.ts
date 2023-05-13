import {readdirSync, writeFileSync} from 'fs';
import {join} from 'path';
import { Client, Events, GatewayIntentBits, Collection, Interaction, GuildMemberRoleManager, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, CollectorFilter, ComponentType, EmbedBuilder, GuildTextBasedChannel, MessageActionRowComponentBuilder, ActivityType, Presence } from 'discord.js';
import * as dotenv from 'dotenv'
dotenv.config()

//extend the client type to allow assigning a commands collection
interface ClientWithCommands extends Client<boolean> {
	commands: Collection<string, any>
	cooldowns: Collection<string, any>
}
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences] }) as ClientWithCommands;
var statuses:String[] 
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag} at ${(new Date).toLocaleTimeString()}`);
	setInterval(collectNsetStatuses, 600000)
});

async function collectNsetStatuses() {
	statuses = require("./status.json")
	var presence = (await client.guilds.fetch("974616319620161546").then(g => g.members.fetch("701977001895919717").then(m => m.presence))) as Presence
	presence.activities.forEach((a=>{
		if (a.type === ActivityType.Custom) {
			var currentStatus = String(a.state)
			if (statuses.indexOf(currentStatus) == -1 && currentStatus != "null") {
				statuses.push(currentStatus)
				writeFileSync("./status.json", JSON.stringify(statuses))
			}
		}
	}))
	client.user?.setActivity({name:String('"'+ statuses[Math.floor(Math.random() * statuses.length)])+'"', type:ActivityType.Listening})
}

client.commands = new Collection()
client.cooldowns = new Collection()

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


client.on(Events.InteractionCreate, async (interaction:Interaction) => {
	if (!interaction.isCommand()) return;
  
	const command = (client as ClientWithCommands).commands.get(interaction.commandName);
	if (!command) {
	  console.error(`No command matching ${interaction.commandName} was found.`);
	  return;
	}
	if(!(interaction.member?.roles as GuildMemberRoleManager).cache.has("1095726685845991465") && (interaction.options.get("override")?.value as boolean) == true) {
		const overrideEmbed = new EmbedBuilder()
			.setTitle("Override Held")
			.setColor("Blue")
			.setDescription("As you are not an admin, you cannot override a command.\nUse the button below to notify an admin to authorise use of the override function.");

		const confirm = new ButtonBuilder()
			.setCustomId('confirmOverideNotify')
			.setLabel('Notify')
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
			.addComponents(confirm);

		var message = await interaction.reply({embeds:[overrideEmbed],components:[row]})
		var interactionlink = (await message.fetch()).url

		const collectorFilter:CollectorFilter<[ButtonInteraction<CacheType>, Collection<string, ButtonInteraction<CacheType>>]> = (i) => {
			i.deferUpdate();
			return i.user.id === interaction.user.id && i.customId === "confirmOverideNotify";
		};
		
		const allow = new ButtonBuilder()
		.setCustomId('allowOverride')
		.setLabel('Allow Override')
		.setStyle(ButtonStyle.Success);

		const adminRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
			.addComponents(allow);

		message.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 60000 })
			.then(async (interaction2) =>{
				var notificationMessage = await (interaction.guild?.channels.cache.get("1102298257935310939") as GuildTextBasedChannel).send({content:interactionlink,components:[adminRow]})
				const collectorFilter:CollectorFilter<[ButtonInteraction<CacheType>, Collection<string, ButtonInteraction<CacheType>>]> = (i) => {
					i.deferUpdate();
					return i.customId === "allowOverride";
				};                    
				notificationMessage.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 300000 })
					.then(async (interaction3) => {command.execute(interaction)})
					.catch(err => null);
			})
			.catch(err => null);

		

	}
	else {
		const { cooldowns } = client;
  
		if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
		}
	
		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = 0;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;
	
		if (timestamps.has(interaction.user.id) && !interaction.options.get("override")?.value as boolean && !(interaction.member?.roles as GuildMemberRoleManager).cache.has("1095726685845991465")) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			await interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
			return;
		}
		}
	
		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
	
		try {
		await command.execute(interaction);
		} catch (error:any) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!\n' + JSON.stringify(error?.message), ephemeral: false });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!\n' + JSON.stringify(error?.message) , ephemeral: false });
		}
		}
	}
  });
  












client.login(process.env.TOKEN);