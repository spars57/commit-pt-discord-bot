"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGuildMemberUpdate = handleGuildMemberUpdate;
const discord_js_1 = require("discord.js");
const COMMIT_PLUS_ROLE_ID = '1514004224889983026';
async function handleGuildMemberUpdate(oldMember, newMember) {
    const hadRole = oldMember.roles.cache.has(COMMIT_PLUS_ROLE_ID);
    const hasRole = newMember.roles.cache.has(COMMIT_PLUS_ROLE_ID);
    if (hadRole || !hasRole)
        return;
    const channelId = process.env.WELCOME_CHANNEL_ID;
    if (!channelId) {
        console.warn('WELCOME_CHANNEL_ID is not set in .env');
        return;
    }
    const channel = newMember.guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) {
        console.warn(`Welcome channel ${channelId} not found or is not a text channel`);
        return;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#f1c40f')
        .setDescription(`🎉 ${newMember} acabou de receber o cargo **Commit+**!`)
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp();
    await channel.send({ embeds: [embed] });
}
