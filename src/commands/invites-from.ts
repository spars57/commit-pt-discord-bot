import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getInviterStats } from '../events/inviteTracker';

const COMMIT_PLUS_ROLE_ID = '1514004224889983026';

export const data = new SlashCommandBuilder()
  .setName('invites-from')
  .setDescription('Mostra quantas pessoas um membro convidou')
  .addUserOption((opt) =>
    opt.setName('membro').setDescription('Membro a consultar').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const target = interaction.options.getUser('membro', true);
  const stats = getInviterStats(interaction.guildId!, target.id);

  let commitPlusCount = 0;
  const inviteeLines: string[] = [];

  for (const id of stats.invitees) {
    let hasCommitPlus = false;
    try {
      const member = await interaction.guild!.members.fetch(id);
      hasCommitPlus = member.roles.cache.has(COMMIT_PLUS_ROLE_ID);
    } catch {
      // member left the server
    }
    if (hasCommitPlus) commitPlusCount++;
    inviteeLines.push(`<@${id}>${hasCommitPlus ? ' ⭐' : ''}`);
  }

  const embed = new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle(`Convites de ${target.displayName}`)
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      { name: 'Total de convites', value: String(stats.total), inline: true },
      { name: 'Commit+', value: String(commitPlusCount), inline: true },
    );

  if (inviteeLines.length > 0) {
    const list = inviteeLines.slice(0, 15).join('\n');
    const extra = inviteeLines.length > 15 ? `\n…e mais ${inviteeLines.length - 15}` : '';
    embed.addFields({ name: 'Membros convidados (⭐ = Commit+)', value: list + extra });
  }

  await interaction.editReply({ embeds: [embed] });
}
