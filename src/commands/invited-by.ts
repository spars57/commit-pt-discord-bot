import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getInviterOf } from '../events/inviteTracker';
import { PRIMARY_COLOR } from '../constants';

export const data = new SlashCommandBuilder()
  .setName('invited-by')
  .setDescription('Mostra quem convidou um membro')
  .addUserOption((opt) =>
    opt.setName('membro').setDescription('Membro a consultar').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser('membro', true);
  const result = getInviterOf(interaction.guildId!, target.id);

  if (!result) {
    await interaction.reply({
      content: `Não há registo de quem convidou ${target}.`,
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(`Origem do convite de ${target.displayName}`)
    .setThumbnail(target.displayAvatarURL())
    .addFields({ name: 'Convidado por', value: `<@${result.inviterId}>`, inline: true });

  await interaction.reply({ embeds: [embed] });
}
