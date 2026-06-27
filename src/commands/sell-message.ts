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
    .setTitle('🚀 Junta-te ao Commit+ e acelera a tua carreira na área da tecnologia.')
    .setDescription(
      'Ao entrares na comunidade, terás acesso a:\n\n' +
        '• Calls semanais com profissionais da indústria\n' +
        '• Mentorias e sessões de esclarecimento de dúvidas\n' +
        '• Networking com developers, estudantes e profissionais de IT\n' +
        '• Revisão de CV e preparação para entrevistas técnicas\n' +
        '• Workshops sobre Frontend, Backend, Cloud, IA, Cibersegurança e muito mais\n' +
        '• Resumos exclusivos de disciplinas de Engenharia Informática e outros tópicos técnicos\n' +
        '• Oportunidades de emprego e referências partilhadas pela comunidade\n' +
        '• Canal para apresentar os teus projetos e receber feedback\n' +
        '• Acesso direto à equipa da Commit PT para apoio no teu crescimento profissional\n' +
        '• Participação em projetos internos reais, incluindo plannings, code reviews, product planning e decisões de UI/UX\n\n' +
        '💡 Independentemente de estares à procura do primeiro emprego, a preparar uma mudança de carreira ou a criar pessoas com os mesmos objetivos e profissionais dispostos a ajudar-te ao longo do caminho.\n\n',
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
