import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Shows detailed information about the server');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild;

  if (!guild) {
    await interaction.reply({
      content: 'This command can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#3498db')
    .setTitle(`ℹ️ Server Information: ${guild.name}`)
    .setDescription('Here are the main details about this Discord server.')
    .addFields(
      { name: 'Total Members', value: `${guild.memberCount}`, inline: true },
      { name: 'Server ID', value: guild.id, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'Bot created by sixteen' });

  await interaction.reply({ embeds: [embed] });
}
