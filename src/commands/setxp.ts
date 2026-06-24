import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { calculateProgress } from '../lib/levels';
import { queries } from '../queries/xp';
import { logger } from '../logger';

export const data = new SlashCommandBuilder()
  .setName('setxp')
  .setDescription("Set a member's total XP (Administrators only)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((option) =>
    option.setName('member').setDescription('The member to update').setRequired(true),
  )
  .addIntegerOption((option) =>
    option.setName('xp').setDescription('The new total XP value').setRequired(true).setMinValue(0),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId || !interaction.memberPermissions) {
    await interaction.reply({
      content: 'This command can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    logger.warn(`[setxp] Unauthorized attempt by ${interaction.user.tag}`);
    await interaction.reply({
      content: 'You need Administrator permissions to use this command.',
      ephemeral: true,
    });
    return;
  }

  const target = interaction.options.getUser('member', true);
  const newXp = interaction.options.getInteger('xp', true);

  const previous = queries.getUserXp.get(target.id, interaction.guildId);
  const previousXp = previous?.xp ?? 0;

  queries.upsertUserXp.run(target.id, interaction.guildId, newXp);

  const { level: previousLevel } = calculateProgress(previousXp);
  const { level: newLevel } = calculateProgress(newXp);

  logger.success(
    `[setxp] ${interaction.user.tag} set XP of ${target.tag} from ${previousXp} to ${newXp} (level ${previousLevel} → ${newLevel})`,
  );

  const embed = new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle('⭐ XP Updated')
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      { name: 'Member', value: `${target}`, inline: true },
      { name: 'New XP', value: `**${newXp}**`, inline: true },
      { name: 'Level', value: `${previousLevel} → **${newLevel}**`, inline: true },
    )
    .setFooter({ text: `Updated by ${interaction.user.username}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
