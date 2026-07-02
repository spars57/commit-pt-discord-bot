import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { assignInviteRecord } from '../events/inviteTracker';
import { PRIMARY_COLOR } from '../constants';

export const data = new SlashCommandBuilder()
  .setName('assign-invitation')
  .setDescription('Atribui manualmente um convite a um membro')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((opt) =>
    opt.setName('target').setDescription('Membro que foi convidado').setRequired(true),
  )
  .addUserOption((opt) =>
    opt.setName('inviter').setDescription('Membro que convidou').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser('target', true);
  const inviter = interaction.options.getUser('inviter', true);

  if (target.id === inviter.id) {
    await interaction.reply({
      content: 'O target e o inviter não podem ser o mesmo membro.',
      ephemeral: true,
    });
    return;
  }

  assignInviteRecord(interaction.guildId!, target.id, inviter.id);

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('Convite atribuído')
    .addFields(
      { name: 'Membro convidado', value: `<@${target.id}>`, inline: true },
      { name: 'Convidado por', value: `<@${inviter.id}>`, inline: true },
    );

  await interaction.reply({ embeds: [embed] });
}
