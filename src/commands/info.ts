import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PRIMARY_COLOR } from '../constants';
import { getFooterText } from '../lib/footer';

export const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Mostra informação detalhada sobre o servidor');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild;

  if (!guild) {
    await interaction.reply({
      content: 'Este comando só pode ser usado num servidor.',
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(`ℹ️ Informações do Servidor: ${guild.name}`)
    .setDescription('Aqui estão os principais detalhes deste servidor Discord.')
    .addFields(
      { name: 'Total de Membros', value: `${guild.memberCount}`, inline: true },
      { name: 'ID do Servidor', value: guild.id, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: getFooterText(interaction) });

  await interaction.reply({ embeds: [embed] });
}
