import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  User,
  GuildMember,
  Guild,
  BaseGuildVoiceChannel,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  ButtonInteraction,
  CacheType,
  Collection,
  CollectorFilter,
  ComponentType,
  VoiceBasedChannel,
} from "discord.js";
import * as voiceClient from '@discordjs/voice'

module.exports = {
  cooldown: 172800,
  data: new SlashCommandBuilder()
    .setName("rr")
    .setDescription("Play a cheerful game of russian roulette.")
    .addBooleanOption((option) =>
      option
        .setName("override")
        .setDescription("Resurect yourself and play again!")
    ),
  async execute(interaction: CommandInteraction) {
    var user = interaction.user as User;
    var member = interaction.member as GuildMember;
    var server = interaction.guild as Guild;
    if (member.voice.channelId === null) {
      var noVoiceChannel = new EmbedBuilder()
        .setTitle("Error")
        .setColor("Red")
        .setDescription("You must be in a voice channel first!")
        .setThumbnail(
          "https://em-content.zobj.net/thumbs/120/twitter/322/cross-mark_274c.png"
        );
      interaction.reply({ embeds: [noVoiceChannel] });
    } else if (member.voice.channel?.name.includes("no rr")) {
      var noVoiceChannel = new EmbedBuilder()
        .setTitle("Channel Blocked")
        .setColor("#24649c")
        .setDescription(
          "Unable to begin a game in the current channel due to its critical nature."
        )
        .setThumbnail(
          "https://em-content.zobj.net/thumbs/120/twitter/322/shield_1f6e1-fe0f.png"
        );
      interaction.reply({ embeds: [noVoiceChannel] });
    } else {
      var memberstring = "";
      var memberlist = (
        server.channels.cache.get(
          member.voice.channelId
        ) as BaseGuildVoiceChannel
      ).members;
      for (let index = 0; index < memberlist.size; index++) {
        const role = memberlist.at(index) as GuildMember;
        if (index == 0) {
          memberstring += `<@${role.id}>`;
        } else {
          memberstring += `\n<@${role.id}>`;
        }
      }
      var confirmEmbed = new EmbedBuilder()
        .setTitle("Russian Roulette")
        .setColor("#689cc5")
        .setDescription(
          "**Welcome!**\n\nYou have asked to play russian roulette with:\n\n" +
            memberstring +
            "\n\n**Press below when all desired players are in the channel.**"
        );
      var confirmButton = new ButtonBuilder()
        .setCustomId("confirmRussianRouletteStart")
        .setLabel("Ready")
        .setStyle(ButtonStyle.Success);
      var row =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          confirmButton
        );
      var message = await interaction.reply({
        embeds: [confirmEmbed],
        components: [row],
      });
      const collectorFilter: CollectorFilter<
        [
          ButtonInteraction<CacheType>,
          Collection<string, ButtonInteraction<CacheType>>
        ]
      > = (i) => {
        i.deferUpdate();
        return (
          i.user.id === interaction.user.id &&
          i.customId === "confirmRussianRouletteStart"
        );
      };
      message
        .awaitMessageComponent({
          filter: collectorFilter,
          componentType: ComponentType.Button,
          time: 60000,
        })
        .then(async (interaction2) => {
          confirmEmbed.setDescription("Beginning game...");
          await interaction.editReply({
            embeds: [confirmEmbed],
            components: [],
          });
          await game(interaction);
        })
        .catch((err) => null);
    }
    async function game(interaction: CommandInteraction) {
        var channel = member.voice.channel as VoiceBasedChannel
        voiceClient.joinVoiceChannel({
            channelId: channel?.id as string, 
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,})
    }
  },
};
