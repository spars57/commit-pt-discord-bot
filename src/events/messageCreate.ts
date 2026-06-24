import { Message } from 'discord.js';
import { assignProgrammerRole } from './guildMemberAdd';
import { logger } from '../logger';

export async function handleMessageCreate(message: Message): Promise<void> {
  if (message.author.bot || !message.member) return;

  logger.debug(`[messageCreate] ${message.author.tag} sent a message in #${message.channel.id}`);

  await assignProgrammerRole(message.member);
}
