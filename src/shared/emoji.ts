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

export function toCodePoint(unicodeSurrogates: string, sep?: string) {
    let r = [],
        c = 0,
        p = 0,
        i = 0;
    while (i < unicodeSurrogates.length) {
        c = unicodeSurrogates.charCodeAt(i++);
        if (p) {
            r.push((0x10000 + ((p - 0xd800) << 10) + (c - 0xdc00)).toString(16));
            p = 0;
        } else if (0xd800 <= c && c <= 0xdbff) {
            p = c;
        } else {
            r.push(c.toString(16));
        }
    }
    return r.join(sep || '-');
}
