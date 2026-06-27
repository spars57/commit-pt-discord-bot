import { ChatInputCommandInteraction, EmbedBuilder, Role, SlashCommandBuilder } from 'discord.js';
import { PRIMARY_COLOR } from '../constants';

const NEXT_GOAL = 500;

export const data = new SlashCommandBuilder()
  .setName('members')
  .setDescription('Mostra o número total de membros no servidor')
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('Filtrar membros por cargo (ex: Commit+)')
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild;

  if (!guild) {
    await interaction.reply({
      content: 'Este comando só pode ser usado num servidor.',
      ephemeral: true,
    });
    return;
  }

  await guild.members.fetch();

  const role = interaction.options.getRole('role') as Role | null;
  const filteredCount = role
    ? guild.members.cache.filter((m) => m.roles.cache.has(role.id)).size
    : guild.memberCount;

  const owner = await guild.fetchOwner();
  const totalChannels = guild.channels.cache.size;

  const description = role
    ? `📋 | Membros com o cargo **${role.name}**: **${filteredCount}**`
    : `📊 | Aqui podes ver o estado atual da nossa comunidade! Temos atualmente **${filteredCount}** membros a partilhar código e a evoluir juntos.`;

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🖥️ | Membros no Servidor')
    .setDescription(description)
    .addFields(
      {
        name: '👑 | Dono',
        value: `${owner.toString()}\n${
          owner.roles.cache
            .filter((r) => r.id !== guild.id)
            .map((r) => r.toString())
            .join(' ') || 'Sem cargos'
        }`,
      },
      {
        name: '🎯 | Próximo Objetivo',
        value: `${filteredCount} / ${NEXT_GOAL}`,
      },
      {
        name: '🪪 | ID do Servidor',
        value: guild.id,
        inline: true,
      },
      {
        name: '🔊 | Total de Canais',
        value: `${totalChannels} canais`,
        inline: true,
      },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
