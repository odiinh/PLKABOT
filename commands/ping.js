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
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const progress = new discord_js_1.EmbedBuilder()
                .setColor("#689cc5")
                .setTitle("Pinging...");
            const sent = yield interaction.reply({ embeds: [progress], fetchReply: true });
            const replyEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("Pong!")
                .setColor("DarkGreen")
                .setThumbnail("https://emojigraph.org/media/microsoft/ping-pong_1f3d3.png")
                .setFields({ name: "API Latency", value: "`" + interaction.client.ws.ping + "ms`", inline: true }, { name: "Roundtrip latency", value: "`" + (sent.createdTimestamp - interaction.createdTimestamp) + "ms`", inline: true });
            yield interaction.editReply({ embeds: [replyEmbed] });
        });
    },
};
