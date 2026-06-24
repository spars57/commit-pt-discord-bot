import 'dotenv/config';
import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  GatewayIntentBits,
  GuildMember,
  Interaction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import * as ping from './commands/ping';
import * as members from './commands/members';
import * as info from './commands/info';
import { handleGuildMemberAdd } from './events/guildMemberAdd';

interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands: Command[] = [ping, members, info];

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const commandMap = new Collection<string, Command>();
for (const command of commands) {
  commandMap.set(command.data.name, command);
}

bot.once('ready', () => {
  console.log('AQUI E PAVUNA!');
});

bot.on('guildMemberAdd', (member: GuildMember) => {
  handleGuildMemberAdd(member).catch(console.error);
});

bot.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'An error occurred while executing this command.',
      ephemeral: true,
    });
  }
});

bot.login(process.env.TOKEN);
