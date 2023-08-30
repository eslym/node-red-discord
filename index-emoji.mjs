import { writeFile } from 'fs/promises';

const queue = new Set();
const running = new Set();

const int = setInterval(() => {
    while (running.size < 8 && queue.size > 0) {
        const task = [...queue][0];
        queue.delete(task);
        running.add(task);
        task().finally(() => {
            running.delete(task);
        });
    }
}, 50);

function enqueue(task) {
    return new Promise((res, rej) => {
        const run = async () => {
            await task().then(res).catch(rej);
        };
        queue.add(run);
    });
}

function fromCodePoint(codepoint) {
    var code = typeof codepoint === 'string' ? parseInt(codepoint, 16) : codepoint;
    if (code < 0x10000) {
        return String.fromCharCode(code);
    }
    code -= 0x10000;
    return String.fromCharCode(0xd800 + (code >> 10), 0xdc00 + (code & 0x3ff));
}

function toCodePoint(unicodeSurrogates, sep) {
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

async function checkEmoji(emoji) {
    const code = toCodePoint(emoji);
    const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${code}.svg`;
    const res = await fetch(url, {
        method: 'HEAD'
    });
    console.log(`${emoji} ${code} ${res.ok ? 'found' : 'not found'}`);
    return res.ok;
}

function strcmp(a, b) {
    if (a === b) return 0;
    if (a > b) return 1;
    return -1;
}

function sortEmoji(a, b) {
    if (a.version < b.version) return -1;
    if (a.version > b.version) return 1;
    return strcmp(a.emoji, b.emoji);
}

(async () => {
    const res = await fetch('https://unpkg.com/unicode-emoji-json@latest/data-by-group.json');
    const tones = [127995, 127996, 127997, 127998, 127999].map((i) => fromCodePoint(i));
    const emojis = await res.json();

    const result = [];

    for (const [key, group] of Object.entries(emojis)) {
        const g = {
            name: key
        };
        const emojis = await Promise.all(
            group.map(async (emoji) => {
                const available = await enqueue(() => checkEmoji(emoji.emoji));
                if (!available) return undefined;
                const hasTone = emoji.skin_tone_support;
                emoji = {
                    unicode: emoji.emoji,
                    codepoint: toCodePoint(emoji.emoji),
                    name: emoji.name,
                    slug: emoji.slug,
                    version: emoji.unicode_version
                };
                if (!hasTone) return emoji;
                const variants = (
                    await Promise.all(
                        tones.map(async (tone) => {
                            const unicode = emoji.unicode + tone;
                            const available = await enqueue(() => checkEmoji(unicode));
                            if (!available) return undefined;
                            return {
                                unicode: unicode,
                                codepoint: toCodePoint(unicode)
                            };
                        })
                    )
                )
                    .filter(Boolean)
                    .sort(sortEmoji);
                if (variants.length > 0) emoji.variants = variants;
                return emoji;
            })
        );
        g.emojis = emojis.filter(Boolean).sort(sortEmoji);
        result.push(g);
    }

    const json = JSON.stringify(result, null, 2);
    await writeFile('emojis.json', json);

    clearInterval(int);
})();
