"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGuildMemberUpdate = handleGuildMemberUpdate;
const discord_js_1 = require("discord.js");
const logger_1 = require("../logger");
const COMMIT_PLUS_ROLE_ID = '1514004224889983026';
async function handleGuildMemberUpdate(oldMember, newMember) {
    const hadRole = oldMember.roles.cache.has(COMMIT_PLUS_ROLE_ID);
    const hasRole = newMember.roles.cache.has(COMMIT_PLUS_ROLE_ID);
    if (hadRole || !hasRole)
        return;
    logger_1.logger.info(`[guildMemberUpdate] ${newMember.user.tag} received Commit+ role in "${newMember.guild.name}"`);
    const channelId = process.env.WELCOME_CHANNEL_ID;
    if (!channelId) {
        logger_1.logger.warn('[guildMemberUpdate] WELCOME_CHANNEL_ID is not set in .env');
        return;
    }
    const channel = newMember.guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) {
        logger_1.logger.warn(`[guildMemberUpdate] Welcome channel ${channelId} not found or is not a text channel`);
        return;
    }
    logger_1.logger.info(`[guildMemberUpdate] Sending Commit+ announcement for ${newMember.user.tag} to #${channel.name}`);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#f1c40f')
        .setDescription(`🎉 ${newMember} acabou de receber o cargo **Commit+**!`)
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp();
    await channel.send({ embeds: [embed] });
}
