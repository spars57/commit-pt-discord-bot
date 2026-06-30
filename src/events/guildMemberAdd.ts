import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { logger } from '../logger';
import { CHANNELS, PRIMARY_COLOR, ROLES } from '../constants';
import { db } from '../lib/database';

export async function handleGuildMemberAdd(member: GuildMember): Promise<void> {
  db.prepare(`INSERT INTO member_joins (user_id, guild_id, joined_at) VALUES (?, ?, ?)`).run(
    member.id,
    member.guild.id,
    Date.now(),
  );

  if (!CHANNELS.WELCOME) {
    logger.warn('[guildMemberAdd] WELCOME_CHANNEL_ID is not set in .env');
    return;
  }

  const channel = member.guild.channels.cache.get(CHANNELS.WELCOME);

  if (!channel || !channel.isTextBased()) {
    logger.warn(
      `[guildMemberAdd] Welcome channel ${CHANNELS.WELCOME} not found or is not a text channel`,
    );
    return;
  }

  logger.info(
    `[guildMemberAdd] Sending welcome message for ${member.user.tag} to #${channel.name}`,
  );

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(`Bem-vindo/a à comunidade CommitPT, ${member.displayName}! 🎉`)
    .setDescription(
      `Olá ${member}! Fica à vontade e começa por te apresentar.\n\n` +
        `📝 Faz a tua apresentação em <#${CHANNELS.PRESENTATIONS}>\n` +
        `💬 Envia a tua primeira mensagem em <#${CHANNELS.GENERAL}>\n` +
        `🏷️ Escolhe as tuas áreas e linguagens em <#${CHANNELS.ROLES_SELECTION}>\n` +
        `🔒 Informações sobre a Commit+ em <#${CHANNELS.COMMIT_PLUS}>\n\n` +
        `💡 Cada mensagem que enviares dá-te XP — usa \`/me\` para veres o teu nível e \`/leaderboard\` para veres o ranking da comunidade.`,
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  await (channel as TextChannel).send({ embeds: [embed] });
}

export async function assignProgrammerRole(member: GuildMember): Promise<void> {
  if (member.roles.cache.has(ROLES.PROGRAMMER)) return;

  const role = member.guild.roles.cache.get(ROLES.PROGRAMMER);
  if (!role) {
    logger.warn(
      `[assignProgrammerRole] Role ${ROLES.PROGRAMMER} not found in "${member.guild.name}"`,
    );
    return;
  }

  await member.roles.add(role);
  logger.success(`[assignProgrammerRole] Assigned "${role.name}" to ${member.user.tag}`);
}
