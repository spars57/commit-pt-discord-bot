import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { calculateProgress } from '../lib/levels';
import { queries } from '../queries/xp';
import { logger } from '../logger';
import { PRIMARY_COLOR } from '../constants';

export const data = new SlashCommandBuilder()
  .setName('setxp')
  .setDescription('Define o XP total de um membro (apenas Administradores)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((option) =>
    option.setName('member').setDescription('O membro a atualizar').setRequired(true),
  )
  .addIntegerOption((option) =>
    option
      .setName('xp')
      .setDescription('O novo valor total de XP')
      .setRequired(true)
      .setMinValue(0),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId || !interaction.memberPermissions) {
    await interaction.reply({
      content: 'Este comando só pode ser usado num servidor.',
      ephemeral: true,
    });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    logger.warn(`[setxp] Unauthorized attempt by ${interaction.user.tag}`);
    await interaction.reply({
      content: 'Precisas de permissões de Administrador para usar este comando.',
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
    .setColor(PRIMARY_COLOR)
    .setTitle('⭐ XP Atualizado')
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      { name: 'Membro', value: `${target}`, inline: true },
      { name: 'Novo XP', value: `**${newXp}**`, inline: true },
      { name: 'Nível', value: `${previousLevel} → **${newLevel}**`, inline: true },
    )
    .setFooter({ text: `Atualizado por ${interaction.user.username}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
