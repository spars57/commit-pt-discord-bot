import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { logger } from '../logger';
import { PRIMARY_COLOR } from '../constants';
import { getFooterText } from '../lib/footer';

export const data = new SlashCommandBuilder()
  .setName('sell-message')
  .setDescription('Envia o embed de anúncio da adesão Commit+')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId || !interaction.memberPermissions) {
    await interaction.reply({
      content: 'Este comando só pode ser usado num servidor.',
      ephemeral: true,
    });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    logger.warn(`[sell-message] Unauthorized attempt by ${interaction.user.tag}`);
    await interaction.reply({
      content: 'Precisas de permissões de Administrador para usar este comando.',
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🚀 Junta-te ao Commit+ e acelera a tua carreira na área da tecnologia')
    .setDescription(
      '💡 Quer estejas à procura do primeiro emprego, a preparar uma mudança de carreira ou simplesmente à procura de uma comunidade onde possas aprender, colaborar e crescer, o Commit+ foi criado para te ajudar a evoluir ao lado de pessoas com os mesmos objetivos.',
    )
    .addFields(
      {
        name: '📞 Aprendizagem & Mentoria',
        value: [
          '• Calls semanais com profissionais da indústria',
          '• Mentorias e sessões para esclarecer dúvidas técnicas e de carreira',
          '• Workshops técnicos exclusivos',
        ].join('\n'),
      },
      {
        name: '🤝 Networking & Carreira',
        value: [
          '• Networking com estudantes, developers e profissionais de IT',
          '• Revisão de CV e preparação para entrevistas técnicas',
          '• Oportunidades de emprego e referências partilhadas pela comunidade',
        ].join('\n'),
      },
      {
        name: '📚 Conteúdos Exclusivos',
        value: [
          '• Resumos exclusivos de Engenharia Informática e outros conteúdos de estudo',
          '• Feedback aos teus projetos e acompanhamento personalizado da equipa CommitPT',
        ].join('\n'),
      },
      {
        name: '🛠️ Projetos Reais',
        value: [
          '• Participação em projetos reais da CommitPT',
          '• Colaboração em plannings, code reviews, arquitetura, desenvolvimento e outras decisões técnicas',
        ].join('\n'),
      },
    )
    .setFooter({ text: getFooterText(interaction) })
    .setTimestamp();

  const button = new ButtonBuilder()
    .setLabel('Entrar agora 🛒')
    .setStyle(ButtonStyle.Link)
    .setURL('https://whop.com/commitpt-709e/commit-plus');

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  await (interaction.channel as TextChannel).send({ embeds: [embed], components: [row] });

  logger.success(`[sell-message] ${interaction.user.tag} sent the Commit+ sell message`);

  await interaction.reply({ content: '✅ Mensagem enviada.', ephemeral: true });
}
