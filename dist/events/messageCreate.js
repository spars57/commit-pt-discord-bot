"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessageCreate = handleMessageCreate;
const guildMemberAdd_1 = require("./guildMemberAdd");
const logger_1 = require("../logger");
async function handleMessageCreate(message) {
    if (message.author.bot || !message.member)
        return;
    logger_1.logger.debug(`[messageCreate] ${message.author.tag} sent a message in #${message.channel.id}`);
    await (0, guildMemberAdd_1.assignProgrammerRole)(message.member);
}
