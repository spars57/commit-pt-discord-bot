import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getInvitesLeaderboard } from '../events/inviteTracker';
import { PRIMARY_COLOR } from '../constants';

export const data = new SlashCommandBuilder()
  .setName('invites')
  .setDescription('Mostra estatísticas de convites')
  .addSubcommand((sub) =>
    sub.setName('leaderboard').setDescription('Ranking dos membros com mais convites'),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const rows = getInvitesLeaderboard(interaction.guildId!);

  if (rows.length === 0) {
    await interaction.reply({ content: 'Ainda não há registos de convites.', ephemeral: true });
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  const description = rows
    .map(
      (row, i) =>
        `${medals[i] ?? `**${i + 1}.**`} <@${row.inviterId}> — **${row.total}** convite${row.total !== 1 ? 's' : ''}`,
    )
    .join('\n');

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🏆 Leaderboard de Convites')
    .setDescription(description)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
