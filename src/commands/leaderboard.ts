import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { calculateProgress } from '../lib/levels';
import { queries } from '../queries/xp';
import { logger } from '../logger';
import { PRIMARY_COLOR } from '../constants';

const LEADERBOARD_SIZE = 10;
const MEDALS = ['🥇', '🥈', '🥉'];

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Mostra os 10 membros com mais XP neste servidor');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: 'Este comando só pode ser usado num servidor.',
      ephemeral: true,
    });
    return;
  }

  logger.info(`[leaderboard] Requested by ${interaction.user.tag} in guild ${interaction.guildId}`);

  const rows = queries.getTopXp.all(interaction.guildId, LEADERBOARD_SIZE);

  if (rows.length === 0) {
    await interaction.reply({
      content: 'Ainda não há dados de XP para este servidor.',
      ephemeral: true,
    });
    return;
  }

  const lines = await Promise.all(
    rows.map(async (row, index) => {
      const { level } = calculateProgress(row.xp);
      const medal = MEDALS[index] ?? `**#${index + 1}**`;
      try {
        const user = await interaction.client.users.fetch(row.user_id);
        return `${medal} ${user.username} — Nível **${level}** · ${row.xp} XP`;
      } catch {
        return `${medal} Utilizador desconhecido — Nível **${level}** · ${row.xp} XP`;
      }
    }),
  );

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🏆 Leaderboard de XP')
    .setDescription(lines.join('\n'))
    .setFooter({ text: `Top ${rows.length} membros · CommitPT` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
