import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { AUTO_ROLES_AREAS, CHANNELS, PRIMARY_COLOR } from '../constants';
import { getFooterText } from '../lib/footer';

export const data = new SlashCommandBuilder()
  .setName('select-roles')
  .setDescription('Escolhe as tuas áreas de interesse no servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const description = AUTO_ROLES_AREAS.map((r) => `${r.emoji} — **${r.name}**`).join('\n');

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🏷️ Escolhe os cargos que te interessam')
    .setDescription(description)
    .addFields({
      name: '​',
      value: `> Não encontras o que procuras? Deixa a tua sugestão em <#${CHANNELS.SUGGESTIONS}>`,
    })
    .setFooter({ text: getFooterText(interaction) })
    .setTimestamp();

  const buttons = AUTO_ROLES_AREAS.map((r) =>
    new ButtonBuilder()
      .setCustomId(`select-role:${r.name}`)
      .setLabel(r.name)
      .setEmoji(r.emoji)
      .setStyle(ButtonStyle.Secondary),
  );

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < buttons.length; i += 5) {
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons.slice(i, i + 5)));
  }

  await interaction.reply({ embeds: [embed], components: rows });
}
