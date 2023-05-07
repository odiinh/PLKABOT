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
    cooldown: 172800,
    data: new discord_js_1.SlashCommandBuilder()
        .setName('massdelete')
        .setDescription("Deletes last 5 mentions of a term. Can only be used once every 2 days.")
        .addStringOption(option => option.setName("name").setDescription("The name to look for.").setRequired(true))
        .addBooleanOption(option => option.setName("override").setDescription("Overrides the delete limit and cooldown in case of a ELE (expulsion level event)").setRequired(true)),
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.deferred && !interaction.replied)
                yield interaction.deferReply();
            var searchTerm = (_a = interaction.options.get("name")) === null || _a === void 0 ? void 0 : _a.value;
            var override = (_b = interaction.options.get("override")) === null || _b === void 0 ? void 0 : _b.value;
            const progress = new discord_js_1.EmbedBuilder()
                .setThumbnail("https://cdn.discordapp.com/attachments/1102298257935310939/1102544851565805640/Pulse-1s-200px_3.gif")
                .setColor("#689cc5")
                .setTitle("Searching for Messages including term `" + searchTerm + "`...");
            // var refresh = setInterval(() => interaction.editReply({embeds:[progress]}), 2000); 
            const channel = interaction.channel;
            let messages = [];
            // Create message pointer
            let message = yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch({ limit: 1 }).then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null)));
            while (message) {
                yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch({ limit: 100, before: message.id }).then(messagePage => {
                    messagePage.forEach(msg => messages.push(msg));
                    // Update our message pointer to be last message in page of messages
                    message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
                    progress.setDescription("Gathered `" + messages.length + "` messages.");
                    interaction.editReply({ embeds: [progress] });
                }));
            }
            ;
            // clearInterval(refresh)
            var x = [];
            let count = 0;
            messages === null || messages === void 0 ? void 0 : messages.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                if (count == 5 && override == false)
                    return;
                else if (element.interaction == null && element.content.toLowerCase().includes(searchTerm.toLowerCase())) {
                    x.push("`" + element.content + "`" + " - " + element.author.tag + " on " + element.createdAt.toLocaleString("en-GB"));
                    count++;
                    yield element.delete();
                }
            }));
            const resultEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("Done!")
                .setDescription("Deleted " + count + " occurances of '" + searchTerm + "'.")
                .setColor("Green");
            x.forEach((element) => {
                resultEmbed.setDescription(resultEmbed.data.description + "\n\n" + element);
            });
            if (x.length == 0) {
                resultEmbed.setTitle("Failed!");
                resultEmbed.setColor("Red");
                resultEmbed.setDescription("Couldn't find any occurances of '" + searchTerm + "' in this channel.");
            }
            interaction.editReply({ embeds: [resultEmbed] });
        });
    },
};
