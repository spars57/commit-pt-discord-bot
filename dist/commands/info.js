"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('info')
    .setDescription('Shows detailed information about the server');
async function execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
        await interaction.reply({
            content: 'This command can only be used in a server.',
            ephemeral: true,
        });
        return;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#3498db')
        .setTitle(`ℹ️ Server Information: ${guild.name}`)
        .setDescription('Here are the main details about this Discord server.')
        .addFields({ name: 'Total Members', value: `${guild.memberCount}`, inline: true }, { name: 'Server ID', value: guild.id, inline: true })
        .setTimestamp()
        .setFooter({ text: 'Bot created by sixteen' });
    await interaction.reply({ embeds: [embed] });
}
