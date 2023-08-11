/**
 * Format emoji to string
 * @param {import('discord.js').APIPartialEmoji} emoji
 * @returns
 */
export function formatEmoji(emoji) {
    return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

/**
 * Parse string formatted emoji into emoji object
 * @param {string} str
 * @returns {import('discord.js').APIPartialEmoji}
 */
export function parseEmoji(str) {
    const match = str.match(/^<a?:([a-zA-Z0-9_]+):([0-9]+)>$/);
    if (!match) {
        return null;
    }
    return {
        name: match[1],
        id: match[2],
        animated: str.startsWith('<a:')
    };
}
