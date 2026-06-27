import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js';
import { calculateProgress } from '../lib/levels';
import { queries } from '../queries/xp';
import { getInviterOf, getInviterStats } from '../events/inviteTracker';
import { logger } from '../logger';
import { PRIMARY_COLOR } from '../constants';

function progressBar(current: number, total: number, length = 12): string {
  const filled = Math.round((current / total) * length);
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, length - filled));
}

export const data = new SlashCommandBuilder()
  .setName('me')
  .setDescription('Mostra o teu perfil completo no servidor')
  .addUserOption((option) =>
    option
      .setName('membro')
      .setDescription('O membro a consultar (deixa vazio para veres o teu perfil)')
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId || !interaction.guild) {
    logger.warn(`[me] Used outside of a guild by ${interaction.user.tag}`);
    await interaction.reply({
      content: 'Este comando só pode ser usado num servidor.',
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  const targetUser = interaction.options.getUser('membro') ?? interaction.user;
  const isSelf = targetUser.id === interaction.user.id;

  logger.info(
    `[me] ${interaction.user.tag} checked ${isSelf ? 'their own profile' : `profile of ${targetUser.tag}`} in guild ${interaction.guildId}`,
  );

  let member: GuildMember | null = null;
  try {
    member = await interaction.guild.members.fetch(targetUser.id);
  } catch {
    // not a member of this guild
  }

  if (!member) {
    await interaction.editReply({ content: 'Esse utilizador não é membro deste servidor.' });
    return;
  }

  const row = queries.getUserXp.get(targetUser.id, interaction.guildId);
  const totalXp = row?.xp ?? 0;
  const { level, currentXp, requiredXp } = calculateProgress(totalXp);
  const lastMessageAt = row?.last_message_at
    ? `<t:${Math.floor(row.last_message_at / 1000)}:R>`
    : 'Nunca';

  const inviteStats = getInviterStats(interaction.guildId, targetUser.id);
  const invitedBy = getInviterOf(interaction.guildId, targetUser.id);

  const joinedAt = member?.joinedAt
    ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:D>`
    : 'Desconhecido';

  const roles =
    member?.roles.cache
      .filter((r) => r.id !== interaction.guildId)
      .sort((a, b) => b.position - a.position)
      .map((r) => r.toString())
      .join(' ') || 'Nenhum';

  logger.debug(
    `[me] ${targetUser.tag} — level ${level}, ${totalXp} total XP, ${inviteStats.total} invites`,
  );

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(`👤 ${member?.displayName ?? targetUser.username}`)
    .setThumbnail(targetUser.displayAvatarURL())
    .addFields(
      { name: '🏆 Nível', value: `**${level}**`, inline: true },
      { name: '⭐ XP Total', value: `**${totalXp}**`, inline: true },
      { name: '💬 Última Mensagem', value: lastMessageAt, inline: true },
      {
        name: '📈 Progresso',
        value: `${progressBar(currentXp, requiredXp)} ${currentXp} / ${requiredXp} XP`,
      },
      { name: '📅 Entrou em', value: joinedAt, inline: true },
      {
        name: '📨 Convidou',
        value: `**${inviteStats.total}** membro${inviteStats.total !== 1 ? 's' : ''}`,
        inline: true,
      },
      {
        name: '🔗 Convidado por',
        value: invitedBy ? `<@${invitedBy.inviterId}>` : 'Desconhecido',
        inline: true,
      },
      { name: '🎭 Cargos', value: roles },
    )
    .setFooter({ text: 'CommitPT — Para de programar sozinho.' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
