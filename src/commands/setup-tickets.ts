import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { CHANNELS, PRIMARY_COLOR } from '../constants';
import { getFooterText } from '../lib/footer';

export const data = new SlashCommandBuilder()
  .setName('setup-tickets')
  .setDescription('Envia o embed de abertura de tickets para o canal de tickets')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const channel = interaction.guild?.channels.cache.get(CHANNELS.TICKETS);

  if (!channel?.isTextBased()) {
    await interaction.reply({ content: 'Canal de tickets não encontrado.', ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🎫 Suporte')
    .setDescription(
      'Precisas de ajuda ou tens alguma questão?\nClica no botão abaixo para abrir um ticket.',
    )
    .setFooter({ text: getFooterText(interaction) })
    .setTimestamp();

  const button = new ButtonBuilder()
    .setCustomId('ticket:open')
    .setLabel('Abrir Ticket')
    .setEmoji('🎫')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  await channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: 'Embed de tickets enviado com sucesso.', ephemeral: true });
}
