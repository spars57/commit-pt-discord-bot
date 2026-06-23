import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import * as ping from './commands/ping';
import * as members from './commands/members';
import * as info from './commands/info';

const commands: (SlashCommandBuilder | SlashCommandOptionsOnlyBuilder)[] = [
  ping.data,
  members.data,
  info.data,
];

const token = process.env.TOKEN!;
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!;

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map((c) => c.toJSON()),
    });
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error(error);
  }
})();
