import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { ROLES } from '../constants';

export function getFooterText(interaction: ChatInputCommandInteraction): string {
  const member = interaction.member as GuildMember | null;
  const hasCommitPlus = member?.roles?.cache?.has(ROLES.COMMIT_PLUS) ?? false;
  return hasCommitPlus ? 'Comunidade CommitPT' : 'Adere já à CommitPT — commitpt.com';
}
