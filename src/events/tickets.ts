import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CategoryChannel,
  ChannelType,
  EmbedBuilder,
  GuildMember,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { CATEGORIES, PRIMARY_COLOR, ROLES } from '../constants';
import { db } from '../lib/database';
import { logger } from '../logger';

function getNextTicketNumber(): number {
  db.prepare(`UPDATE ticket_counter SET counter = counter + 1 WHERE id = 1`).run();
  const row = db.prepare(`SELECT counter FROM ticket_counter WHERE id = 1`).get() as {
    counter: number;
  };
  return row.counter;
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

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(`🎫 ${channelName}`)
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

export async function handleTicketClose(interaction: ButtonInteraction): Promise<void> {
  const channel = interaction.channel as TextChannel | null;

  if (!channel) return;

  await interaction.reply({ content: '🔒 A fechar o ticket...' });

  logger.info(`[tickets] Closing ${channel.name} by ${interaction.user.tag}`);

  setTimeout(() => {
    channel
      .delete()
      .catch((err: unknown) => logger.error('[tickets] Failed to delete channel:', err));
  }, 3000);
}
