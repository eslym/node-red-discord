import { name } from '$package.json';
import twemoji from 'https://unpkg.com/twemoji@latest/dist/twemoji.esm.js';

export interface EmojiMeta {
    name: string;
    slug: string;
    version: number;
    variants?: string[];
}

export interface ShortCodes {
    [hexcode: string]: string | string[];
}

export interface EmojiData {
    label: string;
    emoji: string;
    hexcode: string;
    version: number;
    group?: number;
    skins?: { emoji: string }[];
    tags?: string[];
    emoticon?: string | string[];
}

export interface EmojiRecord {
    unicode: string;
    meta: EmojiMeta;
}

export interface EmojiSearchResult extends EmojiRecord {
    hit: number;
}

interface EmojiGroup {
    name: string;
    emojis: string[];
}

const debugSearch = false;
const benchmarkSearch = false;

const keyWeightShortcode = 16;
const keyWeightGroup = 8;
const keyWeightPart = 4;
const keyWeightName = 2;
const keyWeightTag = 1;

const chunkSize = 500;

const weights = {
    [keyWeightShortcode]: 3,
    [keyWeightPart]: 2,
    [keyWeightGroup]: 1.4,
    [keyWeightName]: 1.2,
    [keyWeightTag]: 0.8
};

const weightMatchContains = 0.25;
const weightMatchStart = 0.8;
const weightMatchExact = 1.5;

const weightFirstKeyword = 0.8;
const weightKeyword = 0.6;
const weightQuery = 1.2;

const hitRatioThreshold = 0.3;
const finalScoreThreshold = 1.0;

let emojiIndex = new Map<string, Record<string, number>>();
let emojiMeta = new Map<string, EmojiMeta>();
let emojiGroups: EmojiGroup[] = [];

function emojiBase(path: string) {
    return `https://www.unpkg.com/emojibase-data@latest/${path}`;
}

function sortResult(a: EmojiSearchResult, b: EmojiSearchResult) {
    if (a.hit !== b.hit) return b.hit - a.hit;
    if (a.meta.version < b.meta.version) return -1;
    if (a.meta.version > b.meta.version) return 1;
    if (a.unicode < b.unicode) return -1;
    if (a.unicode > b.unicode) return 1;
    return 0;
}

function updateWeight(
    w: Map<string, [number, [string, number][]]>,
    e: string,
    hit: number,
    weightBits: number,
    k: string
) {
    let [oh, ow] = w.get(e) ?? [0, []];
    if (debugSearch) ow.push([k, hit]);

    if (weightBits & keyWeightShortcode) oh += hit * weights[keyWeightShortcode];
    if (weightBits & keyWeightGroup) oh += hit * weights[keyWeightGroup];
    if (weightBits & keyWeightPart) oh += hit * weights[keyWeightPart];
    if (weightBits & keyWeightName) oh += hit * weights[keyWeightName];
    if (weightBits & keyWeightTag) oh += hit * weights[keyWeightTag];

    w.set(e, [oh, ow]);
}

function buildResult(matches: Map<string, [number, [string, number][]]>): EmojiSearchResult[] {
    const res = [];
    for (const [emoji, [hit, m]] of matches) {
        if (!emojiMeta.has(emoji)) continue;
        const meta = emojiMeta.get(emoji)!;
        const score = hit;
        if (score < finalScoreThreshold) continue;
        const record = {
            unicode: emoji,
            meta,
            hit: score
        };
        if (debugSearch) (record as any).matches = m;
        res.push(record);
    }
    return res.sort(sortResult);
}

export function searchEmoji(query: string): EmojiSearchResult[] {
    if (!query || query.match(/^\s+$/)) return [];
    if (benchmarkSearch) console.time('search emoji');
    query = query.trim().toLowerCase();
    const exact = query.replace(/\s+/g, '_');
    const keywords = query.split(/\s+/g);
    const results = new Map<string, [number, [string, number][]]>();
    const search: Record<string, number> = {
        [exact]: weightQuery
    };
    if (keywords.length > 1) {
        search[keywords[0]] = weightFirstKeyword;
        for (let index = 1; index < keywords.length; index++) {
            search[keywords[index]] = weightKeyword;
        }
    }
    const s = Object.entries(search);
    for (const [indexString, emojis] of emojiIndex) {
        for (const [keyword, keywordWeight] of s) {
            if (indexString === keyword) {
                for (const [emoji, weightType] of Object.entries(emojis)) {
                    updateWeight(
                        results,
                        emoji,
                        keywordWeight * weightMatchExact,
                        weightType,
                        indexString
                    );
                }
                continue;
            }
            if (indexString.startsWith(keyword)) {
                const hitRatio =
                    (keyword.length / indexString.length) * weightMatchStart * keywordWeight;
                if (hitRatio < hitRatioThreshold) continue;
                for (const [emoji, weightType] of Object.entries(emojis)) {
                    updateWeight(results, emoji, hitRatio, weightType, indexString);
                }
                continue;
            }
            if (indexString.includes(keyword)) {
                const hitRatio =
                    (keyword.length / indexString.length) * weightMatchContains * keywordWeight;
                if (hitRatio < hitRatioThreshold) continue;
                for (const [emoji, weightType] of Object.entries(emojis)) {
                    updateWeight(results, emoji, hitRatio, weightType, indexString);
                }
                continue;
            }
        }
    }
    const res = buildResult(results);
    if (debugSearch)
        console.log(
            res.map((r) => ({
                emoji: r.unicode,
                hit: r.hit,
                matches: (r as any).matches
            }))
        );
    if (benchmarkSearch) console.timeEnd('search emoji');
    return res;
}

function twemojiExists(emoji: string) {
    return twemoji.replace(emoji, () => '').length === 0;
}

function updateIndex(keyword: string, emoji: string, type: number) {
    keyword = keyword.toLowerCase();
    const index = emojiIndex.get(keyword) ?? {};
    index[emoji] = (index[emoji] ?? 0) | type;
    emojiIndex.set(keyword, index);
}

export function getEmojiGroups() {
    return emojiGroups.map((g) => ({
        name: g.name,
        emojis: g.emojis.map((e) => ({
            unicode: e,
            meta: emojiMeta.get(e)!
        }))
    }));
}

async function loadDatabase() {
    if (localStorage.getItem(`${name}/emojibase/version`) !== null) {
        const indexChunks = Number(localStorage.getItem(`${name}/emojibase/index`));
        const index = [];
        for (let i = 0; i < indexChunks; i++) {
            const chunk = JSON.parse(localStorage.getItem(`${name}/emojibase/index/${i}`)!);
            index.push(...chunk);
        }
        emojiIndex = new Map(index);
        const metaChunks = Number(localStorage.getItem(`${name}/emojibase/meta`));
        const meta = [];
        for (let i = 0; i < metaChunks; i++) {
            const chunk = JSON.parse(localStorage.getItem(`${name}/emojibase/meta/${i}`)!);
            meta.push(...chunk);
        }
        emojiMeta = new Map(meta);
        emojiGroups = JSON.parse(localStorage.getItem(`${name}/emojibase/groups`)!);
        console.log(`[${name}] Emoji database loaded from cache!`);
    }
    const pkg = await fetch(emojiBase('package.json')).then((r) => r.json());
    if (localStorage.getItem(`${name}/emojibase/version`) === pkg.version) {
        return;
    }
    const updateMessage = `[${name}] Emoji database updated to version ${pkg.version}!`;
    console.time(updateMessage);
    const [data, shortcodes, messages]: [
        EmojiData[],
        ShortCodes,
        { groups: { key: string; message: string }[] }
    ] = await Promise.all([
        fetch(emojiBase('en/data.json')).then((r) => r.json()),
        fetch(emojiBase('en/shortcodes/emojibase.json')).then((r) => r.json()),
        fetch(emojiBase('en/messages.json')).then((r) => r.json())
    ]);
    emojiGroups = messages.groups.map((g) => ({
        name: g.message,
        emojis: []
    }));
    for (const emoji of data) {
        if (!twemojiExists(emoji.emoji)) continue;
        let shortcode = shortcodes[emoji.hexcode];
        if (typeof emoji.group === 'number') {
            emojiGroups[emoji.group].emojis.push(emoji.emoji);
            for (const g of messages.groups[emoji.group].key.split('-'))
                updateIndex(g, emoji.emoji, keyWeightGroup);
        }
        if (typeof shortcode === 'string') shortcode = [shortcode];
        if (emoji.emoticon) {
            const emoticons =
                typeof emoji.emoticon === 'string' ? [emoji.emoticon] : emoji.emoticon;
            shortcode.push(...emoticons);
        }
        const meta: EmojiMeta = {
            name: emoji.label,
            slug: shortcode[0],
            version: emoji.version
        };
        if (emoji.skins) {
            const variants = emoji.skins.map((s) => s.emoji).filter(twemojiExists);
            if (variants.length) meta.variants = variants;
        }
        emojiMeta.set(emoji.emoji, meta);
        if (emoji.tags && emoji.tags.length) {
            for (const tag of emoji.tags) {
                for (const t of tag.split(/[\s_]+/)) {
                    if (!t) continue;
                    updateIndex(t, emoji.emoji, keyWeightTag);
                }
            }
        }
        for (const code of shortcode) {
            updateIndex(code, emoji.emoji, keyWeightShortcode);
            if (code.includes('_')) {
                for (const part of code.split('_')) {
                    updateIndex(part, emoji.emoji, keyWeightPart);
                }
            }
        }
        const regex = /[a-z0-9]+/gi;
        let matches: RegExpExecArray | null;
        while ((matches = regex.exec(emoji.label))) {
            updateIndex(matches[0], emoji.emoji, keyWeightName);
        }
    }
    emojiGroups = emojiGroups.filter((g) => g.emojis.length);
    const index = Array.from(emojiIndex.entries());
    const meta = Array.from(emojiMeta.entries());
    const indexChunks = Math.ceil(index.length / chunkSize);
    const metaChunks = Math.ceil(meta.length / chunkSize);
    for (let i = 0; i < indexChunks; i++) {
        const chunk = index.slice(i * chunkSize, (i + 1) * chunkSize);
        localStorage.setItem(`${name}/emojibase/index/${i}`, JSON.stringify(chunk));
    }
    for (let i = 0; i < metaChunks; i++) {
        const chunk = meta.slice(i * chunkSize, (i + 1) * chunkSize);
        localStorage.setItem(`${name}/emojibase/meta/${i}`, JSON.stringify(chunk));
    }
    localStorage.setItem(`${name}/emojibase/index`, String(indexChunks));
    localStorage.setItem(`${name}/emojibase/meta`, String(metaChunks));
    localStorage.setItem(`${name}/emojibase/groups`, JSON.stringify(emojiGroups));
    localStorage.setItem(`${name}/emojibase/version`, pkg.version);
    console.timeEnd(updateMessage);
}

loadDatabase();
