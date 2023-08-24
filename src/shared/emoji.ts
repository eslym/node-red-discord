import type { APIPartialEmoji } from 'discord.js';

export function formatEmoji(emoji: APIPartialEmoji) {
    return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

export function parseEmoji(str: string) {
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
