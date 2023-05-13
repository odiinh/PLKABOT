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
const fs_1 = require("fs");
const path_1 = require("path");
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Create a new client instance
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMembers, discord_js_1.GatewayIntentBits.GuildVoiceStates] });
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(discord_js_1.Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag} at ${(new Date).toLocaleTimeString()}`);
});
client.commands = new discord_js_1.Collection();
client.cooldowns = new discord_js_1.Collection();
const commandsPath = (0, path_1.join)(__dirname, 'commands');
const commandFiles = (0, fs_1.readdirSync)(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = (0, path_1.join)(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
    else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}
client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    if (!interaction.isCommand())
        return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    if (!((_a = interaction.member) === null || _a === void 0 ? void 0 : _a.roles).cache.has("1095726685845991465") && ((_b = interaction.options.get("override")) === null || _b === void 0 ? void 0 : _b.value) == true) {
        const overrideEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Override Held")
            .setColor("Blue")
            .setDescription("As you are not an admin, you cannot override a command.\nUse the button below to notify an admin to authorise use of the override function.");
        const confirm = new discord_js_1.ButtonBuilder()
            .setCustomId('confirmOverideNotify')
            .setLabel('Notify')
            .setStyle(discord_js_1.ButtonStyle.Danger);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(confirm);
        var message = yield interaction.reply({ embeds: [overrideEmbed], components: [row] });
        var interactionlink = (yield message.fetch()).url;
        const collectorFilter = (i) => {
            i.deferUpdate();
            return i.user.id === interaction.user.id && i.customId === "confirmOverideNotify";
        };
        const allow = new discord_js_1.ButtonBuilder()
            .setCustomId('allowOverride')
            .setLabel('Allow Override')
            .setStyle(discord_js_1.ButtonStyle.Success);
        const adminRow = new discord_js_1.ActionRowBuilder()
            .addComponents(allow);
        message.awaitMessageComponent({ filter: collectorFilter, componentType: discord_js_1.ComponentType.Button, time: 60000 })
            .then((interaction2) => __awaiter(void 0, void 0, void 0, function* () {
            var _f;
            var notificationMessage = yield ((_f = interaction.guild) === null || _f === void 0 ? void 0 : _f.channels.cache.get("1102298257935310939")).send({ content: interactionlink, components: [adminRow] });
            const collectorFilter = (i) => {
                i.deferUpdate();
                return i.customId === "allowOverride";
            };
            notificationMessage.awaitMessageComponent({ filter: collectorFilter, componentType: discord_js_1.ComponentType.Button, time: 300000 })
                .then((interaction3) => __awaiter(void 0, void 0, void 0, function* () { command.execute(interaction); }))
                .catch(err => null);
        }))
            .catch(err => null);
    }
    else {
        const { cooldowns } = client;
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new discord_js_1.Collection());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 0;
        const cooldownAmount = ((_c = command.cooldown) !== null && _c !== void 0 ? _c : defaultCooldownDuration) * 1000;
        if (timestamps.has(interaction.user.id) && !((_d = interaction.options.get("override")) === null || _d === void 0 ? void 0 : _d.value) && !((_e = interaction.member) === null || _e === void 0 ? void 0 : _e.roles).cache.has("1095726685845991465")) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                yield interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
                return;
            }
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        try {
            yield command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                yield interaction.followUp({ content: 'There was an error while executing this command!\n' + JSON.stringify(error === null || error === void 0 ? void 0 : error.message), ephemeral: false });
            }
            else {
                yield interaction.reply({ content: 'There was an error while executing this command!\n' + JSON.stringify(error === null || error === void 0 ? void 0 : error.message), ephemeral: false });
            }
        }
    }
}));
client.login(process.env.TOKEN);
