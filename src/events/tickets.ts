import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CategoryChannel,
  ChannelType,
  EmbedBuilder,
  Guild,
  GuildMember,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { CATEGORIES, CHANNELS, PRIMARY_COLOR, ROLES } from '../constants';
import { db } from '../lib/database';
import { logger } from '../logger';

function incrementResolvedTickets(): void {
  db.prepare(`UPDATE resolved_tickets SET counter = counter + 1 WHERE id = 1`).run();
}

const COMMIT_PLUS_QUESTIONS_FIELDS = [
  {
    name: '👤 Conhecer-te melhor',
    value: [
      '— Fala-me um bocadinho de ti. Em que fase da carreira estás?',
      '— Estás a estudar, trabalhas ou estás à procura de emprego?',
      '— Qual é a tua principal área de interesse? (Frontend, Backend, Cloud, IA, Cibersegurança, etc.)',
    ].join('\n'),
  },
  {
    name: '🎯 Objetivos',
    value: [
      '— O que te levou a aderir ao Commit+?',
      '— O que gostavas de alcançar nos próximos 6 a 12 meses?',
      '— Qual é o maior desafio que tens neste momento?',
    ].join('\n'),
  },
  {
    name: '💻 Experiência',
    value: [
      '— Que tecnologias utilizas com mais frequência?',
      '— Tens algum projeto pessoal ou profissional em que estejas a trabalhar?',
      '— Já participaste em comunidades deste género?',
    ].join('\n'),
  },
  {
    name: '🤝 Como a Commit pode ajudar',
    value: [
      '— O que esperas encontrar aqui que não encontraste noutras comunidades?',
      '— Há algum tipo de conteúdo ou evento que gostasses de ver?',
      '— Preferes aprender através de workshops, projetos, mentorias ou networking?',
    ].join('\n'),
  },
  {
    name: '🙋 Envolvimento',
    value: [
      '— Terias interesse em participar em projetos internos da comunidade?',
      '— Gostavas de contribuir de alguma forma no futuro? (artigos, workshops, código, etc.)',
    ].join('\n'),
  },
  {
    name: '💬 Feedback',
    value: [
      '— Houve alguma coisa no processo de adesão que pudesse ser melhor?',
      '— Há alguma funcionalidade ou benefício que sintas falta?',
    ].join('\n'),
  },
];

function getNextTicketNumber(): number {
  db.prepare(`UPDATE ticket_counter SET counter = counter + 1 WHERE id = 1`).run();
  const row = db.prepare(`SELECT counter FROM ticket_counter WHERE id = 1`).get() as {
    counter: number;
  };
  return row.counter;
}

async function createTicketChannel(
  guild: Guild,
  member: GuildMember,
  subject: string,
): Promise<TextChannel> {
  const ticketNumber = getNextTicketNumber();
  const channelName = `ticket-${String(ticketNumber).padStart(4, '0')}`;

  const category = guild.channels.cache.get(CATEGORIES.TICKETS) as CategoryChannel | undefined;

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category ?? null,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
      {
        id: ROLES.STAFF,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
    ],
  });

  logger.info(`[tickets] Created ${channelName} for ${member.user.tag} — "${subject}"`);

  return channel;
}

export async function handleTicketOpen(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder().setCustomId('ticket:modal').setTitle('Abrir Ticket');

  const subjectInput = new TextInputBuilder()
    .setCustomId('ticket:subject')
    .setLabel('Qual é o assunto do teu ticket?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Problema com o meu cargo')
    .setMaxLength(100)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput));

  await interaction.showModal(modal);
}

export async function handleTicketModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const subject = interaction.fields.getTextInputValue('ticket:subject');
  const guild = interaction.guild;
  const member = interaction.member as GuildMember;

  if (!guild || !member) {
    await interaction.editReply({ content: 'Erro ao criar o ticket.' });
    return;
  }

  const channel = await createTicketChannel(guild, member, subject);

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(`🎫 ${channel.name}`)
    .setDescription(
      `**Assunto:** ${subject}\n\nA equipa irá responder em breve.\nQuando o teu problema estiver resolvido, clica em **Fechar Ticket**.`,
    )
    .setTimestamp();

  const closeButton = new ButtonBuilder()
    .setCustomId('ticket:close')
    .setLabel('Fechar Ticket')
    .setEmoji('🔒')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

  await channel.send({
    content: `${member} | <@&${ROLES.STAFF}>`,
    embeds: [embed],
    components: [row],
  });

  await interaction.editReply({
    content: `Ticket criado com sucesso! Procura o canal **${channel.name}**.`,
  });
}

export async function openCommitPlusTicket(member: GuildMember): Promise<void> {
  const channel = await createTicketChannel(member.guild, member, 'Onboarding Commit+');

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🌟 Bem-vindo/a ao Commit+!')
    .setDescription(
      `Olá ${member}! Obrigado por fazeres parte do **Commit+**.\n\n` +
        `Gostaríamos de te conhecer melhor para perceber como te podemos ajudar a tirar o máximo partido da comunidade.\n\n` +
        `Enquanto isso, aqui ficam algumas coisas que podes fazer desde já:\n` +
        `🛠️ Junta-te aos nossos projetos internos em <#${CHANNELS.ROLES_SELECTION}>\n` +
        `🔔 Subscreve alertas do bot também em <#${CHANNELS.ROLES_SELECTION}>\n\n` +
        `Responde às questões abaixo ao teu ritmo — não há respostas certas ou erradas. 🙂`,
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  const closeButton = new ButtonBuilder()
    .setCustomId('ticket:close')
    .setLabel('Fechar Ticket')
    .setEmoji('🔒')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

  await channel.send({
    content: `${member} | <@&${ROLES.STAFF}>`,
    embeds: [embed],
    components: [row],
  });

  const questionsEmbed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('📋 Algumas questões para te conhecer melhor')
    .setDescription('Não precisas de responder a tudo — apenas ao que fizer sentido para ti.')
    .addFields(COMMIT_PLUS_QUESTIONS_FIELDS)
    .setTimestamp();

  await channel.send({ embeds: [questionsEmbed] });
}

export async function handleTicketClose(interaction: ButtonInteraction): Promise<void> {
  const channel = interaction.channel as TextChannel | null;

  if (!channel) return;

  await interaction.reply({ content: '🔒 A fechar o ticket...' });

  incrementResolvedTickets();
  logger.info(`[tickets] Closing ${channel.name} by ${interaction.user.tag}`);

  setTimeout(() => {
    channel
      .delete()
      .catch((err: unknown) => logger.error('[tickets] Failed to delete channel:', err));
  }, 3000);
}
