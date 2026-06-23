import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Checks if the bot is online');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply('🏓 Pong!');
}
