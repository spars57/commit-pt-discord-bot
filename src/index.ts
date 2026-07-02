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
import 'dotenv/config';
import * as criarNoticia from './commands/criar-noticia';
import * as stats from './commands/stats';
import * as enviarNoticias from './commands/enviar-noticias';
import * as help from './commands/help';
import * as info from './commands/info';
import * as invitedBy from './commands/invited-by';
import * as invites from './commands/invites';
import * as invitesFrom from './commands/invites-from';
import * as leaderboard from './commands/leaderboard';
import * as link from './commands/links';
import * as logCommitPlus from './commands/log-commit-plus';
import * as me from './commands/me';
import * as members from './commands/members';
import * as ping from './commands/ping';
import * as selectLanguages from './commands/select-languages';
import * as selectRoles from './commands/select-roles';
import * as sellMessage from './commands/sell-message';
import * as setxp from './commands/setxp';
import * as setupTickets from './commands/setup-tickets';
import * as participarProjetos from './commands/participar-projetos';
import * as receberAlertas from './commands/receber-alertas';
import * as costs from './commands/costs';
import {
  AUTO_ROLES_AREAS,
  AUTO_ROLES_LANGUAGES,
  CHANNELS,
  formatEmoji,
  PROJECT_ROLES,
  ROLES,
} from './constants';
import { assignProgrammerRole, handleGuildMemberAdd } from './events/guildMemberAdd';
import { handleGuildMemberUpdate } from './events/guildMemberUpdate';
import {
  cacheGuildInvites,
  handleInviteUsed,
  removeFromInviteCache,
  removeInviteRecord,
  updateInviteCache,
} from './events/inviteTracker';
import { handleMessageCreate } from './events/messageCreate';
import { handleTicketClose, handleTicketModalSubmit, handleTicketOpen } from './events/tickets';
import { fetchAndPublishNews } from './lib/news';
import { enqueue } from './lib/queue';
import './lib/database';
import { logger, setLoggerClient } from './logger';

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
  selectRoles,
  selectLanguages,
  setupTickets,
  enviarNoticias,
  criarNoticia,
  stats,
  participarProjetos,
  receberAlertas,
  costs,
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

let commitPlusCount = 0;

function updateCommitPlusStatus(): void {
  bot.user?.setActivity(`${commitPlusCount} Commit+ Members`);
}

bot.once('ready', async () => {
  setLoggerClient(bot);

  const guild = bot.guilds.cache.get(process.env.GUILD_ID!);
  if (guild) {
    await guild.members.fetch();
    commitPlusCount = guild.roles.cache.get(ROLES.COMMIT_PLUS)?.members.size ?? 0;
  }

  updateCommitPlusStatus();
  logger.success(`Bot online: ${bot.user?.tag}`);
  logger.info(`Guilds: ${bot.guilds.cache.size} | Commands: ${commandMap.size}`);

  for (const guild of bot.guilds.cache.values()) {
    await cacheGuildInvites(guild);
  }

  const MS_8H = 8 * 60 * 60 * 1000;
  setInterval(() => {
    fetchAndPublishNews(bot).catch((err) => logger.error('[news] Scheduled run failed:', err));
  }, MS_8H);
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
  const hadCommitPlus = (oldMember as GuildMember).roles.cache.has(ROLES.COMMIT_PLUS);
  const hasCommitPlus = newMember.roles.cache.has(ROLES.COMMIT_PLUS);
  if (!hadCommitPlus && hasCommitPlus) commitPlusCount++;
  if (hadCommitPlus && !hasCommitPlus) commitPlusCount--;

  handleGuildMemberUpdate(oldMember as GuildMember, newMember).catch((err) =>
    logger.error('[guildMemberUpdate]', err),
  );
  updateCommitPlusStatus();
});

bot.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isModalSubmit() && interaction.customId === 'ticket:modal') {
    handleTicketModalSubmit(interaction).catch((err) => logger.error('[tickets]', err));
    return;
  }

  if (interaction.isButton() && interaction.customId === 'ticket:open') {
    handleTicketOpen(interaction).catch((err) => logger.error('[tickets]', err));
    return;
  }

  if (interaction.isButton() && interaction.customId === 'ticket:close') {
    handleTicketClose(interaction).catch((err) => logger.error('[tickets]', err));
    return;
  }

  if (interaction.isButton() && interaction.customId.startsWith('project-role:')) {
    if (!(interaction.member instanceof GuildMember) || !interaction.guild) {
      await interaction.reply({ content: 'Erro ao processar a interação.', ephemeral: true });
      return;
    }

    const member = interaction.member;

    if (!member.roles.cache.has(ROLES.COMMIT_PLUS)) {
      await interaction.reply({
        content: `Queres participar nos nossos projetos internos? Para isso é necessário uma subscrição Commit+. Podes obter mais informações através do canal <#${CHANNELS.COMMIT_PLUS}>!`,
        ephemeral: true,
      });
      return;
    }

    const roleName = interaction.customId.split(':')[1];
    const roleConfig = PROJECT_ROLES.find((r) => r.name === roleName);

    if (!roleConfig) {
      await interaction.reply({ content: 'Cargo inválido.', ephemeral: true });
      return;
    }

    const role = interaction.guild.roles.cache.get(roleConfig.roleId);

    if (!role) {
      await interaction.reply({
        content: `O cargo **${roleName}** não existe no servidor.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    enqueue(async () => {
      const hasRole = member.roles.cache.has(role.id);
      if (hasRole) {
        await member.roles.remove(role);
        logger.info(`[project-roles] Removed role "${roleName}" from ${interaction.user.tag}`);
        await interaction.editReply({ content: `Cargo **${roleName}** removido.` });
      } else {
        await member.roles.add(role);
        logger.info(`[project-roles] Added role "${roleName}" to ${interaction.user.tag}`);
        await interaction.editReply({ content: `Cargo **${roleName}** adicionado!` });
      }
    });
    return;
  }

  if (interaction.isButton() && interaction.customId.startsWith('alert-role:')) {
    if (!(interaction.member instanceof GuildMember) || !interaction.guild) {
      await interaction.reply({ content: 'Erro ao processar a interação.', ephemeral: true });
      return;
    }

    if (!interaction.member.roles.cache.has(ROLES.COMMIT_PLUS)) {
      await interaction.reply({
        content: `Esta funcionalidade é exclusiva para membros Commit+. Podes obter mais informações através do canal <#${CHANNELS.COMMIT_PLUS}>!`,
        ephemeral: true,
      });
      return;
    }

    const role = interaction.guild.roles.cache.get(ROLES.ALERTS);

    if (!role) {
      await interaction.reply({
        content: 'O cargo de alertas não existe no servidor.',
        ephemeral: true,
      });
      return;
    }

    const member = interaction.member;
    const subscribe = interaction.customId === 'alert-role:subscribe';

    await interaction.deferReply({ ephemeral: true });

    enqueue(async () => {
      const hasRole = member.roles.cache.has(role.id);
      if (subscribe && !hasRole) {
        await member.roles.add(role);
        logger.info(`[alert-role] Subscribed ${interaction.user.tag} to alerts`);
        await interaction.editReply({ content: 'Vais passar a receber alertas do bot!' });
      } else if (!subscribe && hasRole) {
        await member.roles.remove(role);
        logger.info(`[alert-role] Unsubscribed ${interaction.user.tag} from alerts`);
        await interaction.editReply({ content: 'Deixaste de receber alertas do bot.' });
      } else if (subscribe && hasRole) {
        await interaction.editReply({ content: 'Já estás a receber alertas do bot.' });
      } else {
        await interaction.editReply({ content: 'Já não estás a receber alertas do bot.' });
      }
    });
    return;
  }

  if (interaction.isButton() && interaction.customId.startsWith('select-role:')) {
    const roleName = interaction.customId.split(':')[1];
    const allRoles = [...AUTO_ROLES_AREAS, ...AUTO_ROLES_LANGUAGES];
    const roleConfig = allRoles.find((r) => r.name === roleName);

    if (!roleConfig || !interaction.guild || !(interaction.member instanceof GuildMember)) {
      await interaction.reply({ content: 'Cargo inválido.', ephemeral: true });
      return;
    }

    const role = interaction.guild.roles.cache.get(roleConfig.roleId);

    if (!role) {
      await interaction.reply({
        content: `O cargo **${roleName}** não existe no servidor.`,
        ephemeral: true,
      });
      return;
    }

    const member = interaction.member;
    const hasRole = member.roles.cache.has(role.id);

    await interaction.deferReply({ ephemeral: true });

    enqueue(async () => {
      if (hasRole) {
        await member.roles.remove(role);
        logger.info(`[select-roles] Removed role "${roleName}" from ${interaction.user.tag}`);
        await interaction.editReply({
          content: `${formatEmoji(roleConfig.emoji)} Cargo **${roleName}** removido.`,
        });
      } else {
        await member.roles.add(role);
        logger.info(`[select-roles] Added role "${roleName}" to ${interaction.user.tag}`);
        await interaction.editReply({
          content: `${formatEmoji(roleConfig.emoji)} Cargo **${roleName}** adicionado!`,
        });
      }
    });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  logger.info(
    `[command] /${interaction.commandName} by ${interaction.user.tag} (${interaction.user.id})`,
  );

  const command = commandMap.get(interaction.commandName);
  if (!command) {
    logger.info(`[command] Unknown command: /${interaction.commandName}`);
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

bot.on('error', (err) => {
  logger.error('[discord] Client error:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('[process] Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('[process] Unhandled rejection:', reason);
});

bot.login(process.env.TOKEN);
