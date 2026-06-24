import { Message } from 'discord.js';
import { logger } from '../logger';
import { db } from '../lib/database';
import { verificarEAtivarDelay } from './delayxp';

export async function handleMessageCreate(message: Message): Promise<void> {
  if (message.author.bot || !message.member) return;

  if (!verificarEAtivarDelay(message.author.id)) return;

  const xpwin = Math.floor(Math.random() * 11) + 15;

  logger.debug(`[messageCreate] ${message.author.tag} sent a message in #${message.channel.id}`);

  db.prepare(
    `
      INSERT INTO user_xp (user_id, guild_id, xp, level)
      VALUES ( ?,?,?,1)
      ON CONFLICT(user_id,guild_id) DO UPDATE SET xp= xp + ?
  
  `,
  ).run(message.author.id, message.guild?.id, xpwin, xpwin);
}
