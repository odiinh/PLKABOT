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
        .setName('server')
        .setDescription('Provides information about the server.'),
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            var server = interaction.guild;
            var emojistring = "";
            var emojis = server.emojis.cache;
            for (let index = 0; index < emojis.size; index++) {
                const emoji = emojis.at(index);
                if (index == 0) {
                    emojistring += `<:${emoji.identifier}>`;
                }
                else {
                    emojistring += `, <:${emoji.identifier}>`;
                }
            }
            var sortedMembers = (yield server.members.fetch()).sort((A, B) => B.joinedTimestamp - A.joinedTimestamp);
            const serverInfo = new discord_js_1.EmbedBuilder()
                .setColor("#689cc5")
                .setTitle(server.name)
                .setThumbnail(server.iconURL({ size: 1024, extension: "jpeg" }))
                .addFields([
                { name: "Members", value: String(server.memberCount), inline: true },
                { name: "Date Created", value: `<t:${Math.floor(server.createdTimestamp / 1000)}:D>`, inline: true },
                { name: "Bot Joined", value: `<t:${Math.floor(server.joinedTimestamp / 1000)}:D>`, inline: true },
                { name: "Text Channels", value: String(server.channels.cache.filter(ch => ch.isTextBased() == true).size - server.channels.cache.filter(ch => ch.isVoiceBased() == true).size - server.channels.cache.filter(ch => ch.isThread() == true).size), inline: true },
                { name: "Voice Channels", value: String(server.channels.cache.filter(ch => ch.isVoiceBased() == true).size), inline: true },
                { name: "Thread Channels", value: String(server.channels.cache.filter(ch => ch.isThread() == true).size), inline: true },
                { name: "Owner", value: `<@${server.ownerId}>`, inline: true },
                { name: "Emojis", value: emojistring, inline: true },
                { name: "Number of Roles", value: String(server.roles.cache.size), inline: true },
                { name: "Preferred Language", value: server.preferredLocale, inline: true },
                { name: "Newest Member", value: `<@${(_a = sortedMembers.first()) === null || _a === void 0 ? void 0 : _a.id}>`, inline: true },
                { name: "First Member", value: `<@${(_b = sortedMembers.last()) === null || _b === void 0 ? void 0 : _b.id}>`, inline: true },
            ]);
            yield interaction.reply({ embeds: [serverInfo] });
        });
    },
};
