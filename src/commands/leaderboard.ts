import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { calculateProgress } from '../lib/levels';
import { queries } from '../queries/xp';
import { logger } from '../logger';

const LEADERBOARD_SIZE = 10;
const MEDALS = ['🥇', '🥈', '🥉'];

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Shows the top 10 members by XP in this server');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: 'This command can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  logger.info(`[leaderboard] Requested by ${interaction.user.tag} in guild ${interaction.guildId}`);

  const rows = queries.getTopXp.all(interaction.guildId, LEADERBOARD_SIZE);

  if (rows.length === 0) {
    await interaction.reply({ content: 'No XP data found for this server yet.', ephemeral: true });
    return;
  }

  const lines = await Promise.all(
    rows.map(async (row, index) => {
      const { level } = calculateProgress(row.xp);
      const medal = MEDALS[index] ?? `**#${index + 1}**`;
      try {
        const user = await interaction.client.users.fetch(row.user_id);
        return `${medal} ${user.username} — Level **${level}** · ${row.xp} XP`;
      } catch {
        return `${medal} Unknown user — Level **${level}** · ${row.xp} XP`;
      }
    }),
  );

  const embed = new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle('🏆 XP Leaderboard')
    .setDescription(lines.join('\n'))
    .setFooter({ text: `Top ${rows.length} members · CommitPT` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
