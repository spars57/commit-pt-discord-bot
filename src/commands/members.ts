import { ChatInputCommandInteraction, Role, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('members')
  .setDescription('Shows the total number of members in the server')
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('Filter members by role (e.g. Commit+)')
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild;

  if (!guild) {
    await interaction.reply({
      content: 'This command can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  const role = interaction.options.getRole('role') as Role | null;

  if (!role) {
    await interaction.reply(`This server has a total of ${guild.memberCount} members.`);
    return;
  }

  await guild.members.fetch();
  const count = guild.members.cache.filter((m) => m.roles.cache.has(role.id)).size;

  await interaction.reply(`The role **${role.name}** has ${count} member(s).`);
}
