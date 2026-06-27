import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PRIMARY_COLOR } from '../constants';

const COMMUNITY_LINKS = {
  instagram: 'https://www.instagram.com/commitpt_/',
  website: 'https://www.commitpt.com',
  linkedin: 'https://www.linkedin.com/company/commit-pt',
};

const CREATOR_LINKS = {
  github: 'https://github.com/spars57',
  instagram: 'https://instagram.com/@brumoisao',
  linkedin: 'https://linkedin.com/in/@brunomoisao',
  tiktok: 'https://tiktok.com/@brumoisao2',
};

export const data = new SlashCommandBuilder()
  .setName('links')
  .setDescription('Mostra todos os links da comunidade e do criador CommitPT');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🔗 Links CommitPT')
    .addFields(
      {
        name: '🌍 Comunidade',
        value: [
          `📸 Instagram — ${COMMUNITY_LINKS.instagram}`,
          `🌐 Website — ${COMMUNITY_LINKS.website}`,
          `💼 LinkedIn — ${COMMUNITY_LINKS.linkedin}`,
        ].join('\n'),
      },
      {
        name: '👤 Bruno Moisão (Criador)',
        value: [
          `🐙 GitHub — ${CREATOR_LINKS.github}`,
          `📸 Instagram — ${CREATOR_LINKS.instagram}`,
          `💼 LinkedIn — ${CREATOR_LINKS.linkedin}`,
          `🎵 TikTok — ${CREATOR_LINKS.tiktok}`,
        ].join('\n'),
      },
    )
    .setFooter({ text: 'CommitPT — Para de programar sozinho.' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
