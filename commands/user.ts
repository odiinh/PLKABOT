import {SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder, Guild, GuildEmoji, User, Role} from "discord.js"
module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.')
		.addUserOption(option => option.setName("member").setDescription("Get data on a member other than yourself")),
	async execute(interaction:CommandInteraction) {
		
        var user = interaction.options.get("member")?.user ? (interaction.options.get("member")?.user as User) : (interaction.user as User)
		var member = interaction.options.get("member")?.member ? (interaction.options.get("member")?.member as GuildMember) : (interaction.member as GuildMember)
        var server = (interaction.guild as Guild)
		
		var sortedMembers = (await server.members.fetch()).sort((A,B)=>(A.joinedTimestamp as number) - (B.joinedTimestamp as number))
		var rolestring= ""
		var roles = member.roles.valueOf().sort((A,B)=>(B.rawPosition - A.rawPosition))
		roles.delete(String(roles.lastKey()))
		for (let index = 0; index < roles.size; index++) {
			const role = (roles.at(index) as Role)
			if (index == 0) {
				rolestring+=`<@&${role.id}>`
			}
			else {
				rolestring+=`, <@&${role.id}>`
			}
			
		}

		const userInfo = new EmbedBuilder()
			.setColor(member.displayHexColor ? member.displayHexColor : "#689cc5")
			.setTitle(user.tag)
			.setThumbnail(user.avatarURL({size:1024,extension:"jpeg"}))
			.addFields([
				{name:"Nickname", value:member.nickname? member.nickname : "*None*", inline:true},
				{name:"Join Date", value:`<t:${Math.floor((member.joinedTimestamp as number)/1000)}:D>`, inline:true},
				{name:"Member No.", value:`#${Array.from(sortedMembers.keys()).indexOf(user.id)+1} / ${sortedMembers.size}`, inline:true},
				{name:"Nitro",value:String(member.premiumSince ? "Yes" : "No"),inline:true},
				{name:"Account Created", value:`<t:${Math.floor((user.createdTimestamp as number)/1000)}:R>`, inline:true},
				{name:"Punishable", value:String(member.bannable), inline:true},
				{name:"Roles", value:rolestring === "" ? "*No Roles*" : rolestring}
				

			]);
			
		await interaction.reply({embeds:[userInfo]});
	},
};