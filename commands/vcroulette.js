"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const path_1 = require("path");
module.exports = {
    cooldown: 172800,
    data: new discord_js_1.SlashCommandBuilder()
        .setName("vc-roulette")
        .setDescription("Play a cheerful game of *VC* roulette.")
        .addBooleanOption((option) => option
        .setName("override")
        .setDescription("Resurect yourself and play again!")),
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            var user = interaction.user;
            var member = interaction.member;
            var server = interaction.guild;
            if (member.voice.channelId === null) {
                var noVoiceChannel = new discord_js_1.EmbedBuilder()
                    .setTitle("Error")
                    .setColor("Red")
                    .setDescription("You must be in a voice channel first!")
                    .setThumbnail("https://em-content.zobj.net/thumbs/120/twitter/322/cross-mark_274c.png");
                interaction.reply({ embeds: [noVoiceChannel] });
            }
            else if ((_a = member.voice.channel) === null || _a === void 0 ? void 0 : _a.name.includes("no rr")) {
                var noVoiceChannel = new discord_js_1.EmbedBuilder()
                    .setTitle("Channel Blocked")
                    .setColor("#24649c")
                    .setDescription("Unable to begin a game in the current channel due to its critical nature.")
                    .setThumbnail("https://em-content.zobj.net/thumbs/120/twitter/322/shield_1f6e1-fe0f.png");
                interaction.reply({ embeds: [noVoiceChannel] });
            }
            else {
                var memberstring = "";
                var memberlist = server.channels.cache.get(member.voice.channelId).members;
                for (let index = 0; index < memberlist.size; index++) {
                    let member = memberlist.at(index);
                    if (index == 0) {
                        memberstring += `<@${member.id}>`;
                    }
                    else {
                        memberstring += `\n<@${member.id}>`;
                    }
                }
                var confirmEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle("*VC* Roulette")
                    .setColor("#689cc5")
                    .setDescription("**Welcome!**\n\nYou have asked to play *VC* roulette with:\n\n" +
                    memberstring +
                    "\n\n**Press below when all desired players are in the channel.**");
                var confirmButton = new discord_js_1.ButtonBuilder()
                    .setCustomId("confirm*VC*RouletteStart")
                    .setLabel("Ready")
                    .setStyle(discord_js_1.ButtonStyle.Success);
                var row = new discord_js_1.ActionRowBuilder().addComponents(confirmButton);
                var message = yield interaction.reply({
                    embeds: [confirmEmbed],
                    components: [row],
                });
                const collectorFilter = (i) => {
                    i.deferUpdate();
                    return (i.user.id === interaction.user.id &&
                        i.customId === "confirm*VC*RouletteStart");
                };
                message
                    .awaitMessageComponent({
                    filter: collectorFilter,
                    componentType: discord_js_1.ComponentType.Button,
                    time: 60000,
                })
                    .then((interaction2) => __awaiter(this, void 0, void 0, function* () {
                    confirmEmbed.setDescription("Beginning game...");
                    yield interaction.editReply({
                        embeds: [confirmEmbed],
                        components: [],
                    });
                    yield game(interaction);
                }))
                    .catch((err) => null);
            }
            function game(interaction) {
                return __awaiter(this, void 0, void 0, function* () {
                    var channel = member.voice.channel;
                    (0, voice_1.joinVoiceChannel)({
                        channelId: channel === null || channel === void 0 ? void 0 : channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                    });
                    const connection = (0, voice_1.getVoiceConnection)(server.id);
                    const player = (0, voice_1.createAudioPlayer)();
                    connection.subscribe(player);
                    connection.on(voice_1.VoiceConnectionStatus.Ready, () => __awaiter(this, void 0, void 0, function* () {
                        memberlist = server.channels.cache.get(String(member.voice.channelId)).members;
                        memberlist.delete(interaction.client.user.id);
                        var gameEmbed = new discord_js_1.EmbedBuilder()
                            .setTitle("*VC* Roulette")
                            .setColor("#689cc5");
                        memberlist.forEach(element => {
                            gameEmbed.addFields({ name: element.user.tag, value: "..." });
                        });
                        interaction.editReply({ embeds: [gameEmbed] });
                        var playedUserCount = 0;
                        var died = false;
                        var bulletChamber = Math.round(Math.random() * 5);
                        var currentChamber = Math.round(Math.random() * 5);
                        while (playedUserCount <= memberlist.size - 1 && died === false) {
                            currentChamber = currentChamber % 6;
                            console.log(currentChamber == bulletChamber ? `BANG: ${currentChamber} == ${bulletChamber}` : `SAFE ${currentChamber} != ${bulletChamber}`);
                            var dead = (0, voice_1.createAudioResource)((0, path_1.join)(process.cwd(), "/sound/dth.mp3"));
                            var alive = (0, voice_1.createAudioResource)((0, path_1.join)(process.cwd(), "/sound/alive.mp3"));
                            var activeMember = memberlist.at(playedUserCount);
                            var tag = activeMember.user.tag;
                            gameEmbed.spliceFields(playedUserCount, 1, { name: "`" + tag + "`", value: ":hourglass:" });
                            interaction.editReply({ embeds: [gameEmbed] });
                            if (currentChamber == bulletChamber) {
                                player.play(dead);
                                yield new Promise(resolve => {
                                    player.once(voice_1.AudioPlayerStatus.Idle, () => {
                                        if (activeMember.kickable === true)
                                            activeMember.kick("Shot to the head by a 44 magnum!");
                                        gameEmbed.spliceFields(playedUserCount, 1, { name: tag, value: ":skull:" });
                                        interaction.editReply({ embeds: [gameEmbed] });
                                        died = true;
                                        resolve();
                                    });
                                });
                            }
                            else {
                                player.play(alive);
                                yield new Promise(resolve => {
                                    player.once(voice_1.AudioPlayerStatus.Idle, () => {
                                        gameEmbed.spliceFields(playedUserCount, 1, { name: tag, value: ":sweat_smile:" });
                                        interaction.editReply({ embeds: [gameEmbed] });
                                        resolve();
                                    });
                                });
                            }
                            playedUserCount++;
                            currentChamber++;
                        }
                        connection.disconnect();
                    }));
                    connection.on(voice_1.VoiceConnectionStatus.Disconnected, (oldState, newState) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield Promise.race([
                                (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Signalling, 5000),
                                (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Connecting, 5000),
                            ]);
                        }
                        catch (error) {
                            connection.destroy();
                        }
                    }));
                });
            }
        });
    },
};
