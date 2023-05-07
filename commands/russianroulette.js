"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const voiceClient = __importStar(require("@discordjs/voice"));
module.exports = {
    cooldown: 172800,
    data: new discord_js_1.SlashCommandBuilder()
        .setName("rr")
        .setDescription("Play a cheerful game of russian roulette.")
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
                    const role = memberlist.at(index);
                    if (index == 0) {
                        memberstring += `<@${role.id}>`;
                    }
                    else {
                        memberstring += `\n<@${role.id}>`;
                    }
                }
                var confirmEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle("Russian Roulette")
                    .setColor("#689cc5")
                    .setDescription("**Welcome!**\n\nYou have asked to play russian roulette with:\n\n" +
                    memberstring +
                    "\n\n**Press below when all desired players are in the channel.**");
                var confirmButton = new discord_js_1.ButtonBuilder()
                    .setCustomId("confirmRussianRouletteStart")
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
                        i.customId === "confirmRussianRouletteStart");
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
                    voiceClient.joinVoiceChannel({
                        channelId: channel === null || channel === void 0 ? void 0 : channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                    });
                });
            }
        });
    },
};
