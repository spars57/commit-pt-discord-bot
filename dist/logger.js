"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const levels = {
    info: '\x1b[36m[INFO]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    debug: '\x1b[90m[DEBUG]\x1b[0m',
    success: '\x1b[32m[OK]\x1b[0m',
};
function timestamp() {
    return new Date().toISOString();
}
function log(level, ...args) {
    console.log(`${timestamp()} ${levels[level]}`, ...args);
}
exports.logger = {
    info: (...args) => log('info', ...args),
    warn: (...args) => log('warn', ...args),
    error: (...args) => log('error', ...args),
    debug: (...args) => log('debug', ...args),
    success: (...args) => log('success', ...args),
};
