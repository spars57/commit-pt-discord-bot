import './lib/database';
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
import * as link from './commands/links';
import * as rank from './commands/rank';
import * as setxp from './commands/setxp';
import * as leaderboard from './commands/leaderboard';
import * as logCommitPlus from './commands/log-commit-plus';
import { handleGuildMemberAdd, assignProgrammerRole } from './events/guildMemberAdd';
import { handleGuildMemberUpdate } from './events/guildMemberUpdate';
import { handleMessageCreate } from './events/messageCreate';
import { logger } from './logger';

interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands: Command[] = [ping, members, info, link, rank, setxp, leaderboard, logCommitPlus];

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
  logger.success(`Bot online: ${bot.user?.tag}`);
  logger.info(`Guilds: ${bot.guilds.cache.size} | Commands: ${commandMap.size}`);
});

bot.on('guildMemberAdd', (member: GuildMember) => {
  logger.info(`[guildMemberAdd] ${member.user.tag} (${member.id}) joined "${member.guild.name}"`);
  handleGuildMemberAdd(member).catch((err) => logger.error('[guildMemberAdd]', err));
  assignProgrammerRole(member).catch((err) => logger.error('[guildMemberAdd/assignRole]', err));
});

bot.on('messageCreate', (message) => {
  handleMessageCreate(message).catch((err) => logger.error('[messageCreate]', err));
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
  logger.debug(
    `[guildMemberUpdate] ${newMember.user.tag} (${newMember.id}) updated in "${newMember.guild.name}"`,
  );
  handleGuildMemberUpdate(oldMember as GuildMember, newMember).catch((err) =>
    logger.error('[guildMemberUpdate]', err),
  );
});

bot.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  logger.info(
    `[command] /${interaction.commandName} by ${interaction.user.tag} (${interaction.user.id})`,
  );

  const command = commandMap.get(interaction.commandName);
  if (!command) {
    logger.warn(`[command] Unknown command: /${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
    logger.success(`[command] /${interaction.commandName} completed`);
  } catch (error) {
    logger.error(`[command] /${interaction.commandName} failed:`, error);
    await interaction.reply({
      content: 'An error occurred while executing this command.',
      ephemeral: true,
    });
  }
});

bot.login(process.env.TOKEN);
