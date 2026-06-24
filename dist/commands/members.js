"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const NEXT_GOAL = 500;
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('members')
    .setDescription('Shows the total number of members in the server')
    .addRoleOption((option) => option
    .setName('role')
    .setDescription('Filter members by role (e.g. Commit+)')
    .setRequired(false));
async function execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
        await interaction.reply({
            content: 'This command can only be used in a server.',
            ephemeral: true,
        });
        return;
    }
    await guild.members.fetch();
    const role = interaction.options.getRole('role');
    const filteredCount = role
        ? guild.members.cache.filter((m) => m.roles.cache.has(role.id)).size
        : guild.memberCount;
    const owner = await guild.fetchOwner();
    const totalChannels = guild.channels.cache.size;
    const description = role
        ? `📋 | Members with the **${role.name}** role: **${filteredCount}**`
        : `📊 | Here you can see the current state of our community! We currently have **${filteredCount}** members sharing code and playing together.`;
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🖥️ | Members In The Server')
        .setDescription(description)
        .addFields({
        name: '👑 | Owner',
        value: `${owner.toString()}\n${owner.roles.cache
            .filter((r) => r.id !== guild.id)
            .map((r) => r.toString())
            .join(' ') || 'No roles'}`,
    }, {
        name: '🎯 | Next Goal',
        value: `${filteredCount} / ${NEXT_GOAL}`,
    }, {
        name: '🪪 | Server ID',
        value: guild.id,
        inline: true,
    }, {
        name: '🔊 | Total Channels',
        value: `${totalChannels} channels`,
        inline: true,
    })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
