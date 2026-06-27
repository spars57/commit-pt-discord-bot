import './lib/database';
import 'dotenv/config';
import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  GatewayIntentBits,
  GuildMember,
  Interaction,
  Invite,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import * as ping from './commands/ping';
import * as members from './commands/members';
import * as info from './commands/info';
import * as link from './commands/links';
import * as me from './commands/me';
import * as setxp from './commands/setxp';
import * as leaderboard from './commands/leaderboard';
import * as logCommitPlus from './commands/log-commit-plus';
import * as sellMessage from './commands/sell-message';
import * as invites from './commands/invites';
import * as invitesFrom from './commands/invites-from';
import * as invitedBy from './commands/invited-by';
import * as help from './commands/help';
import { handleGuildMemberAdd, assignProgrammerRole } from './events/guildMemberAdd';
import { handleGuildMemberUpdate } from './events/guildMemberUpdate';
import { handleMessageCreate } from './events/messageCreate';
import {
  cacheGuildInvites,
  handleInviteUsed,
  updateInviteCache,
  removeFromInviteCache,
  removeInviteRecord,
} from './events/inviteTracker';
import { logger } from './logger';

interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands: Command[] = [
  ping,
  members,
  info,
  link,
  me,
  setxp,
  leaderboard,
  logCommitPlus,
  sellMessage,
  invites,
  invitesFrom,
  invitedBy,
  help,
];

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

const commandMap = new Collection<string, Command>();
for (const command of commands) {
  commandMap.set(command.data.name, command);
}

bot.once('ready', async () => {
  logger.success(`Bot online: ${bot.user?.tag}`);
  logger.info(`Guilds: ${bot.guilds.cache.size} | Commands: ${commandMap.size}`);

  for (const guild of bot.guilds.cache.values()) {
    await cacheGuildInvites(guild);
  }
});

bot.on('guildMemberAdd', (member: GuildMember) => {
  logger.info(`[guildMemberAdd] ${member.user.tag} (${member.id}) joined "${member.guild.name}"`);
  handleInviteUsed(member).catch((err) => logger.error('[inviteTracker]', err));
  handleGuildMemberAdd(member).catch((err) => logger.error('[guildMemberAdd]', err));
  assignProgrammerRole(member).catch((err) => logger.error('[guildMemberAdd/assignRole]', err));
});

bot.on('guildMemberRemove', (member) => {
  logger.info(`[guildMemberRemove] ${member.user.tag} (${member.id}) left "${member.guild.name}"`);
  removeInviteRecord(member.guild.id, member.id);
});

bot.on('inviteCreate', (invite: Invite) => {
  if (!invite.guild) return;
  updateInviteCache(invite.guild.id, invite.code, invite.uses ?? 0);
  logger.info(`[inviteTracker] New invite created: ${invite.code} in "${invite.guild.name}"`);
});

bot.on('inviteDelete', (invite: Invite) => {
  if (!invite.guild) return;
  removeFromInviteCache(invite.guild.id, invite.code);
  logger.info(`[inviteTracker] Invite deleted: ${invite.code} in "${invite.guild.name}"`);
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
