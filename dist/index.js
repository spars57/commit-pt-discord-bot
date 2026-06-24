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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const ping = __importStar(require("./commands/ping"));
const members = __importStar(require("./commands/members"));
const info = __importStar(require("./commands/info"));
const guildMemberAdd_1 = require("./events/guildMemberAdd");
const guildMemberUpdate_1 = require("./events/guildMemberUpdate");
const commands = [ping, members, info];
const bot = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ],
});
const commandMap = new discord_js_1.Collection();
for (const command of commands) {
    commandMap.set(command.data.name, command);
}
bot.once('ready', () => {
    console.log('AQUI E PAVUNA!');
});
bot.on('guildMemberAdd', (member) => {
    (0, guildMemberAdd_1.handleGuildMemberAdd)(member).catch(console.error);
});
bot.on('guildMemberUpdate', (oldMember, newMember) => {
    (0, guildMemberUpdate_1.handleGuildMemberUpdate)(oldMember, newMember).catch(console.error);
});
bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const command = commandMap.get(interaction.commandName);
    if (!command)
        return;
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'An error occurred while executing this command.',
            ephemeral: true,
        });
    }
});
bot.login(process.env.TOKEN);
