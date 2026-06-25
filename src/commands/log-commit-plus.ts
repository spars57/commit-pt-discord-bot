import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { logger } from '../logger';

export const data = new SlashCommandBuilder()
  .setName('log-commit-plus')
  .setDescription('Announce that a member has received the Commit+ role')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((option) =>
    option.setName('user').setDescription('The member who received Commit+').setRequired(true),
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
    logger.warn(`[log-commit-plus] Unauthorized attempt by ${interaction.user.tag}`);
    await interaction.reply({
      content: 'You need Administrator permissions to use this command.',
      ephemeral: true,
    });
    return;
  }

  const channelId = process.env.WELCOME_CHANNEL_ID;
  if (!channelId) {
    logger.warn('[log-commit-plus] WELCOME_CHANNEL_ID is not set in .env');
    await interaction.reply({ content: 'WELCOME_CHANNEL_ID is not configured.', ephemeral: true });
    return;
  }

  const channel = interaction.client.channels.cache.get(channelId);
  if (!channel?.isTextBased()) {
    logger.warn(`[log-commit-plus] Channel ${channelId} not found or not text-based`);
    await interaction.reply({
      content: 'Welcome channel not found or not a text channel.',
      ephemeral: true,
    });
    return;
  }

  const target = interaction.options.getUser('user', true);

  const embed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setDescription(`🎉 <@${target.id}> acabou de receber o cargo **Commit+**!`)
    .setThumbnail(target.displayAvatarURL())
    .setTimestamp();

  await (channel as TextChannel).send({ embeds: [embed] });

  logger.success(`[log-commit-plus] ${interaction.user.tag} announced Commit+ for ${target.tag}`);

  await interaction.reply({
    content: `✅ Announcement sent for ${target.username}.`,
    ephemeral: true,
  });
}
