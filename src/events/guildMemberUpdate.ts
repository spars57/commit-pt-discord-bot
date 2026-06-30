import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { logger } from '../logger';
import { ALERT_ROLE_ID, CHANNELS, PRIMARY_COLOR, PROJECT_ROLES, ROLES } from '../constants';
import { openCommitPlusTicket } from './tickets';

export async function handleGuildMemberUpdate(
  oldMember: GuildMember,
  newMember: GuildMember,
): Promise<void> {
  const hadRole = oldMember.roles.cache.has(ROLES.COMMIT_PLUS);
  const hasRole = newMember.roles.cache.has(ROLES.COMMIT_PLUS);

  if (hadRole && !hasRole) {
    const roleIdsToRemove = [...PROJECT_ROLES.map((r) => r.roleId), ALERT_ROLE_ID].filter((id) =>
      newMember.roles.cache.has(id),
    );
    if (roleIdsToRemove.length > 0) {
      await newMember.roles.remove(roleIdsToRemove);
      logger.info(
        `[guildMemberUpdate] Removed ${roleIdsToRemove.length} project role(s) from ${newMember.user.tag} (lost Commit+)`,
      );
    }
    return;
  }

  if (hadRole || !hasRole) return;

  logger.info(
    `[guildMemberUpdate] ${newMember.user.tag} received Commit+ role in "${newMember.guild.name}"`,
  );

  if (!CHANNELS.WELCOME) {
    logger.warn('[guildMemberUpdate] WELCOME_CHANNEL_ID is not set in .env');
    return;
  }

  const channel = newMember.guild.channels.cache.get(CHANNELS.WELCOME);

  if (!channel || !channel.isTextBased()) {
    logger.warn(
      `[guildMemberUpdate] Welcome channel ${CHANNELS.WELCOME} not found or is not a text channel`,
    );
    return;
  }

  logger.info(
    `[guildMemberUpdate] Sending Commit+ announcement for ${newMember.user.tag} to #${channel.name}`,
  );

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setDescription(`🎉 ${newMember} acabou de receber o cargo **Commit+**!`)
    .setThumbnail(newMember.user.displayAvatarURL())
    .setTimestamp();

  await (channel as TextChannel).send({ embeds: [embed] });

  openCommitPlusTicket(newMember).catch((err) =>
    logger.error('[guildMemberUpdate] Failed to open Commit+ ticket:', err),
  );
}
