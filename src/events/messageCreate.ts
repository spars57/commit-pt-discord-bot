import { Message, TextChannel } from 'discord.js';
import { logger } from '../logger';
import { checkAndActivateCooldown } from '../lib/cooldown';
import { calculateProgress } from '../lib/levels';
import { assignProgrammerRole } from './guildMemberAdd';
import { queries } from '../queries/xp';

const MIN_WORDS = 2;
const MIN_WORD_LENGTH = 2;

function countValidWords(content: string): number {
  return content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length >= MIN_WORD_LENGTH).length;
}

export async function handleMessageCreate(message: Message): Promise<void> {
  if (message.author.bot || !message.member || !message.guildId) return;

  await assignProgrammerRole(message.member);

  const wordCount = countValidWords(message.content);

  if (wordCount < MIN_WORDS) {
    logger.debug(
      `[messageCreate] ${message.author.tag} — message too short (${wordCount} words), no XP`,
    );
    return;
  }

  if (!checkAndActivateCooldown(message.author.id)) {
    logger.debug(`[messageCreate] ${message.author.tag} — cooldown active, no XP`);
    return;
  }

  const xpGained = wordCount;

  logger.debug(
    `[messageCreate] ${message.author.tag} gained ${xpGained} XP (${wordCount} words) in guild ${message.guildId}`,
  );

  const row = queries.getUserXp.get(message.author.id, message.guildId);

  const previousXp = row?.xp ?? 0;
  const newTotalXp = previousXp + xpGained;
  const { level: previousLevel } = calculateProgress(previousXp);
  const { level: newLevel } = calculateProgress(newTotalXp);

  queries.upsertUserXp.run(message.author.id, message.guildId, newTotalXp);

  if (newLevel > previousLevel) {
    logger.success(`[messageCreate] ${message.author.tag} leveled up to level ${newLevel}`);
    await sendLevelUpNotification(message, newLevel);
  }
}

async function sendLevelUpNotification(message: Message, newLevel: number): Promise<void> {
  const channelId = process.env.WELCOME_CHANNEL_ID;
  if (!channelId) {
    logger.warn('[messageCreate] WELCOME_CHANNEL_ID not set, skipping level-up notification');
    return;
  }

  const channel = message.client.channels.cache.get(channelId);
  if (!channel?.isTextBased()) {
    logger.warn(`[messageCreate] Channel ${channelId} not found or not text-based`);
    return;
  }

  await (channel as TextChannel).send(
    `🎉 <@${message.author.id}> just reached **level ${newLevel}**! Keep it up! 🚀`,
  );
}
