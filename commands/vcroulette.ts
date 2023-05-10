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
  APIEmbedField,
} from "discord.js";
import {
  AudioPlayerStatus,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import {join} from "path"

module.exports = {
  cooldown: 172800,
  data: new SlashCommandBuilder()
    .setName("vc-roulette")
    .setDescription("Play a cheerful game of *VC* roulette.")
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
      var memberlist = (server.channels.cache.get(member.voice.channelId) as BaseGuildVoiceChannel).members;
      for (let index = 0; index < memberlist.size; index++) {
        let member = memberlist.at(index) as GuildMember;
        if (index == 0) {
          memberstring += `<@${member.id}>`;
        } else {
          memberstring += `\n<@${member.id}>`;
        }
      }
      var confirmEmbed = new EmbedBuilder()
        .setTitle("*VC* Roulette")
        .setColor("#689cc5")
        .setDescription(
          "**Welcome!**\n\nYou have asked to play *VC* roulette with:\n\n" +
            memberstring +
            "\n\n**Press below when all desired players are in the channel.**"
        );
      var confirmButton = new ButtonBuilder()
        .setCustomId("confirm*VC*RouletteStart")
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
          i.customId === "confirm*VC*RouletteStart"
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
        joinVoiceChannel({
            channelId: channel?.id as string, 
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,})
        const connection = getVoiceConnection(server.id) as VoiceConnection;
        const player = createAudioPlayer();
        const alive = createAudioResource(join(process.cwd(),"/sound/alive.mp3"))
        const dead = createAudioResource(join(process.cwd(),"/sound/dth.mp3"))
        connection.subscribe(player)
        connection.on(VoiceConnectionStatus.Ready, async () => {
          memberlist = (server.channels.cache.get(String(member.voice.channelId)) as BaseGuildVoiceChannel).members;
          memberlist.delete(interaction.client.user.id)
          var gameEmbed = new EmbedBuilder()
            .setTitle("*VC* Roulette")
            .setColor("#689cc5");
          memberlist.forEach(element => {
            gameEmbed.addFields({name:element.user.tag, value:"..."})
          });
          interaction.editReply({embeds:[gameEmbed]})
          

          var playedUserCount = 0
          var died = false
          var activeChamber = Math.round(Math.random()*6)
          while (playedUserCount<memberlist.size-1 && died === false) {
            var tag = (memberlist.at(playedUserCount)as GuildMember).user.tag
            gameEmbed.spliceFields(playedUserCount,1,{name: "`"+tag+"`", value:":hourglass:" })
            interaction.editReply({embeds:[gameEmbed]})
            var chanceNo = Math.round(Math.random()*6)
            if (chanceNo == activeChamber) {
              player.play(dead)
              player.once(AudioPlayerStatus.Idle, () => {
                member.kick("Shot to the head by .44 magnum")
                gameEmbed.spliceFields(playedUserCount,1,{name: tag, value:":skull:" })
              });

            } else {
              player.play(alive)
              player.once(AudioPlayerStatus.Idle, () => {
                gameEmbed.spliceFields(playedUserCount,1,{name: tag, value:":sweat_smile:"})
              });
            }
            playedUserCount++
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        })








        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
          try {
            await Promise.race([
              entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
              entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
          } catch (error) {
            connection.destroy();
          }
        });
    }
  },
};
