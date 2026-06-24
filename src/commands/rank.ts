import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { calculateProgress } from '../lib/levels';
import { queries } from '../queries/xp';
import { logger } from '../logger';

function progressBar(current: number, total: number, length = 12): string {
  const filled = Math.round((current / total) * length);
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, length - filled));
}

export const data = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('Check your level and XP in the server')
  .addUserOption((option) =>
    option
      .setName('member')
      .setDescription('The member to check (leave empty to check yourself)')
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    logger.warn(`[rank] Used outside of a guild by ${interaction.user.tag}`);
    await interaction.reply({
      content: 'This command can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  const target = interaction.options.getUser('member') ?? interaction.user;
  const isSelf = target.id === interaction.user.id;

  logger.info(
    `[rank] ${interaction.user.tag} checked ${isSelf ? 'their own rank' : `rank of ${target.tag}`} in guild ${interaction.guildId}`,
  );

  const row = queries.getUserXp.get(target.id, interaction.guildId);

  const totalXp = row?.xp ?? 0;
  const { level, currentXp, requiredXp } = calculateProgress(totalXp);

  logger.debug(`[rank] ${target.tag} — level ${level}, ${totalXp} total XP`);

  const embed = new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle(`📊 ${target.username}`)
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      { name: '🏆 Level', value: `**${level}**`, inline: true },
      { name: '⭐ Total XP', value: `**${totalXp}**`, inline: true },
      {
        name: '📈 Progress',
        value: `${progressBar(currentXp, requiredXp)} ${currentXp} / ${requiredXp} XP`,
      },
    )
    .setFooter({ text: 'CommitPT — Stop coding alone.' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
