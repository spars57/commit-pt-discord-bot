import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { logger } from '../logger';

export async function handleGuildMemberAdd(member: GuildMember): Promise<void> {
  const channelId = process.env.WELCOME_CHANNEL_ID;

  if (!channelId) {
    logger.warn('[guildMemberAdd] WELCOME_CHANNEL_ID is not set in .env');
    return;
  }

  const channel = member.guild.channels.cache.get(channelId);

  if (!channel || !channel.isTextBased()) {
    logger.warn(`[guildMemberAdd] Welcome channel ${channelId} not found or is not a text channel`);
    return;
  }

  logger.info(
    `[guildMemberAdd] Sending welcome message for ${member.user.tag} to #${channel.name}`,
  );

  const embed = new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle(`Bem-vindo/a à comunidade CommitPT, ${member.displayName}! 🎉`)
    .setDescription(
      `Olá ${member}! Fica à vontade e começa por te apresentar.\n\n` +
        `📝 Faz a tua apresentação em <#${process.env.PRESENTATIONS_CHANNEL_ID ?? 'apresentações'}>\n` +
        `💬 Envia a tua primeira mensagem em <#${process.env.GENERAL_CHANNEL_ID ?? 'chat-geral'}>\n` +
        `🔒 Informações sobre a Commit+ em <#${process.env.COMMIT_PLUS_CHANNEL_ID ?? 'acesso-commit-plus'}>`,
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  await (channel as TextChannel).send({ embeds: [embed] });
}

const PROGRAMMER_ROLE_ID = '1519017947589382154';

export async function assignProgrammerRole(member: GuildMember): Promise<void> {
  if (member.roles.cache.has(PROGRAMMER_ROLE_ID)) return;

  const role = member.guild.roles.cache.get(PROGRAMMER_ROLE_ID);
  if (!role) {
    logger.warn(
      `[assignProgrammerRole] Role ${PROGRAMMER_ROLE_ID} not found in "${member.guild.name}"`,
    );
    return;
  }

  await member.roles.add(role);
  logger.success(`[assignProgrammerRole] Assigned "${role.name}" to ${member.user.tag}`);
}
