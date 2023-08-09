/**
 *
 * @param {import('discord.js').APIPartialEmoji} emoji
 * @returns
 */
export function formatEmoji(emoji) {
    return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}
