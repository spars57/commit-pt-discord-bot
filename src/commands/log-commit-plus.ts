import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { logger } from '../logger';
import { CHANNELS, PRIMARY_COLOR } from '../constants';

export const data = new SlashCommandBuilder()
  .setName('log-commit-plus')
  .setDescription('Anuncia que um membro recebeu o cargo Commit+')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((option) =>
    option.setName('user').setDescription('O membro que recebeu o Commit+').setRequired(true),
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
    logger.warn(`[log-commit-plus] Unauthorized attempt by ${interaction.user.tag}`);
    await interaction.reply({
      content: 'Precisas de permissões de Administrador para usar este comando.',
      ephemeral: true,
    });
    return;
  }

  if (!CHANNELS.WELCOME) {
    logger.warn('[log-commit-plus] WELCOME_CHANNEL_ID is not set in .env');
    await interaction.reply({
      content: 'WELCOME_CHANNEL_ID não está configurado.',
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.client.channels.cache.get(CHANNELS.WELCOME);
  if (!channel?.isTextBased()) {
    logger.warn(`[log-commit-plus] Channel ${CHANNELS.WELCOME} not found or not text-based`);
    await interaction.reply({
      content: 'Canal de boas-vindas não encontrado ou não é um canal de texto.',
      ephemeral: true,
    });
    return;
  }

  const target = interaction.options.getUser('user', true);

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setDescription(`🎉 <@${target.id}> acabou de receber o cargo **Commit+**!`)
    .setThumbnail(target.displayAvatarURL())
    .setTimestamp();

  await (channel as TextChannel).send({ embeds: [embed] });

  logger.success(`[log-commit-plus] ${interaction.user.tag} announced Commit+ for ${target.tag}`);

  await interaction.reply({
    content: `✅ Anúncio enviado para ${target.username}.`,
    ephemeral: true,
  });
}
