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
        .setName('user')
        .setDescription('Provides information about the user.')
        .addUserOption(option => option.setName("member").setDescription("Get data on a member other than yourself")),
    execute(interaction) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            var user = ((_a = interaction.options.get("member")) === null || _a === void 0 ? void 0 : _a.user) ? (_b = interaction.options.get("member")) === null || _b === void 0 ? void 0 : _b.user : interaction.user;
            var member = ((_c = interaction.options.get("member")) === null || _c === void 0 ? void 0 : _c.member) ? (_d = interaction.options.get("member")) === null || _d === void 0 ? void 0 : _d.member : interaction.member;
            var server = interaction.guild;
            var sortedMembers = (yield server.members.fetch()).sort((A, B) => A.joinedTimestamp - B.joinedTimestamp);
            var rolestring = "";
            var roles = member.roles.valueOf().sort((A, B) => (B.rawPosition - A.rawPosition));
            roles.delete(String(roles.lastKey()));
            for (let index = 0; index < roles.size; index++) {
                const role = roles.at(index);
                if (index == 0) {
                    rolestring += `<@&${role.id}>`;
                }
                else {
                    rolestring += `, <@&${role.id}>`;
                }
            }
            const userInfo = new discord_js_1.EmbedBuilder()
                .setColor(member.displayHexColor ? member.displayHexColor : "#689cc5")
                .setTitle(user.tag)
                .setThumbnail(user.avatarURL({ size: 1024, extension: "jpeg" }))
                .addFields([
                { name: "Nickname", value: member.nickname ? member.nickname : "*None*", inline: true },
                { name: "Join Date", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
                { name: "Member No.", value: `#${Array.from(sortedMembers.keys()).indexOf(user.id) + 1} / ${sortedMembers.size}`, inline: true },
                { name: "Nitro", value: String(member.premiumSince ? "Yes" : "No"), inline: true },
                { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: "Punishable", value: String(member.bannable), inline: true },
                { name: "Roles", value: rolestring === "" ? "*No Roles*" : rolestring }
            ]);
            yield interaction.reply({ embeds: [userInfo] });
        });
    },
};
