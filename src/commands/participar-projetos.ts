import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { PRIMARY_COLOR, PROJECT_ROLES } from '../constants';
import { getFooterText } from '../lib/footer';

export const data = new SlashCommandBuilder()
  .setName('participar-projetos')
  .setDescription('Painel de seleção de roles para projetos internos')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🛠️ Projetos Internos')
    .setDescription(
      'Queres fazer parte de algum dos nossos projetos internos?\n\nEscolhe o(s) projeto(s) em que queres participar:',
    )
    .setFooter({ text: getFooterText(interaction) })
    .setTimestamp();

  const buttons = PROJECT_ROLES.map((r) =>
    new ButtonBuilder()
      .setCustomId(`project-role:${r.name}`)
      .setLabel(r.name)
      .setStyle(ButtonStyle.Primary),
  );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);

  await interaction.reply({ embeds: [embed], components: [row] });
}
