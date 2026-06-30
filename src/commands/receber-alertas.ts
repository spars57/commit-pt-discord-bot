import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { PRIMARY_COLOR } from '../constants';
import { getFooterText } from '../lib/footer';

export const data = new SlashCommandBuilder()
  .setName('receber-alertas')
  .setDescription('Painel de subscrição de alertas do Discord Bot')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🔔 Alertas do Discord Bot')
    .setDescription(
      'Queres ser notificado de erros do nosso Discord Bot?\n\nSe sim, receberás notificações sempre que ocorrer um erro no bot.',
    )
    .setFooter({ text: getFooterText(interaction) })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('alert-role:subscribe')
      .setLabel('Sim')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('alert-role:unsubscribe')
      .setLabel('Não')
      .setStyle(ButtonStyle.Danger),
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}
