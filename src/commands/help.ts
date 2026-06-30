import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PRIMARY_COLOR } from '../constants';
import { getFooterText } from '../lib/footer';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Mostra todos os comandos disponíveis e o que fazem');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🤖 Comandos do Bot')
    .setDescription('Aqui estão todos os comandos disponíveis:')
    .addFields(
      {
        name: '📊 Informações do Servidor',
        value: [
          '`/ping` — Verifica se o bot está online',
          '`/info` — Mostra informação detalhada sobre o servidor',
          '`/members` — Mostra o total de membros no servidor',
          '`/members role:<cargo>` — Mostra o número de membros com um cargo específico',
          '`/links` — Mostra todos os links da comunidade CommitPT',
        ].join('\n'),
      },
      {
        name: '🏆 Níveis & XP',
        value: [
          '`/me` — Mostra o teu perfil completo no servidor',
          '`/me membro:<utilizador>` — Mostra o perfil completo de outro membro',
          '`/leaderboard` — Mostra os 10 membros com mais XP',
        ].join('\n'),
      },
      {
        name: '🛠️ Projetos & Alertas',
        value: [
          '`/participar-projetos` — Painel de seleção de roles para projetos internos (Commit+ only)',
          '`/receber-alertas` — Subscreve ou cancela alertas de erros do Discord Bot',
        ].join('\n'),
      },
      {
        name: '📨 Convites',
        value: [
          '`/invites leaderboard` — Ranking dos membros com mais convites',
          '`/invited-by membro:<utilizador>` — Mostra quem convidou um membro',
          '`/invites-from membro:<utilizador>` — Mostra quantos membros alguém convidou',
        ].join('\n'),
      },
    )
    .setFooter({ text: getFooterText(interaction) })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
