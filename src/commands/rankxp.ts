import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { db } from '../lib/database';

export const data = new SlashCommandBuilder()
  .setName('rankxp')
  .setDescription('ve o teu nivel e o XP no servidor')
  .addUserOption(
    (Option) =>
      Option.setName('membro')
        .setDescription('O membro que queres ver o rank( deixa vazio caso queiras ver o teu)')
        .setRequired(false), // it's not necessary to tag someone when you can see your own
  );

// main function

export async function execute(interaction: ChatInputCommandInteraction) {
  // If a user is mentioned, show their XP rank.
  // Otherwise, show the command user's XP rank.

  const targetMember = interaction.options.getUser('membro') || interaction.user;

  const userId = targetMember.id;
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply({
      content: '❌ Este comando só pode ser usado dentro de um servidor!',
      ephemeral: true, //  Only the user who used the command can see this message.
    });
  }

  //prepararing sql

  const lookpeople = db.prepare('SELECT * FROM user_xp Where user_id = ? AND guild_id = ?');

  // execute sql

  const UserInfos = lookpeople.get(userId, guildId) as
    | { user_id: string; guild_id: string; xp: number; level: number }
    | undefined; //  Undefined if the user is not found in the database.

  let xp = 0;
  let level = 1;

  if (UserInfos) {
    xp = UserInfos.xp;
    level = UserInfos.level;
  }

  // formula para o xp upar level

  const xpNecessary = 5 * Math.pow(level, 2) + 50 * level + 100;

  const xpMissing = xpNecessary - xp;

  //receive infos

  await interaction.reply({
    content:
      `📊 **Rank de ${targetMember.username}**\n` +
      `⭐ **Nível:** \`${level}\`\n` +
      `✨ **XP Atual:** \`${xp} / ${xpNecessary}\` XP\n` +
      `🎯 **Faltam:** \`${xpMissing}\` XP para o próximo nível!`,
  });
}
