import {
    Decoration,
    EditorView,
    MatchDecorator,
    ViewPlugin,
    WidgetType,
    type DecorationSet,
    ViewUpdate
} from '@codemirror/view';

import twemoji from 'https://unpkg.com/twemoji@latest/dist/twemoji.esm.js';
import emojiRegex from 'https://unpkg.com/emoji-regex@latest/index.mjs';
import { name } from '$package.json';

const keywordMatchThreshold = 0.2;
const finalMatchThreshold = 0.5;

const unpkg = {
    emojiJson: 'https://www.unpkg.com/unicode-emoji-json@latest',
    emojiLib: 'https://www.unpkg.com/emojilib@latest'
};

export interface EmojiData {
    name: string;
    slug: string;
    group: string;
    emoji_version: string;
    unicode_version: string;
    skin_tone_support: boolean;
}

export interface EmojiMeta {
    name: string;
    slug: string;
    version: string;
    variants?: string[];
}

export interface EmojiSearchResult {
    unicode: string;
    meta: EmojiMeta;
    hit: number;
}

let emojiKeywords = new Map<string, string[]>();
let emojiMeta = new Map<string, EmojiMeta>();
const tones = [127995, 127996, 127997, 127998, 127999].map((i) =>
    twemoji.convert.fromCodePoint(i.toString(16))
);

function checkTwemoji(unicode: string) {
    return twemoji.replace(unicode, (_) => '-').length === 1;
}

async function updateEmojiMeta(version: string) {
    if (
        localStorage.getItem(`${name}/unicode-emoji-json/data`) === null ||
        localStorage.getItem(`${name}/unicode-emoji-json/version`) !== version
    ) {
        const data = (await fetch(`${unpkg.emojiJson}/data-by-emoji.json`).then((res) =>
            res.json()
        )) as Record<string, EmojiData>;
        for (const [unicode, meta] of Object.entries(data)) {
            if (!checkTwemoji(unicode)) continue;
            emojiMeta.set(unicode, {
                name: meta.name,
                slug: meta.slug,
                version: meta.unicode_version
            });
            if (meta.skin_tone_support) {
                const variants = tones.map((tone) => unicode + tone).filter(checkTwemoji);
                if (variants.length) emojiMeta.get(unicode)!.variants = variants;
            }
        }
        localStorage.setItem(
            `${name}/unicode-emoji-json/data`,
            JSON.stringify(Object.fromEntries(emojiMeta))
        );
        localStorage.setItem(`${name}/unicode-emoji-json/version`, version);
        console.log(`[${name}] emoji meta data updated.`);
    } else {
        const data = JSON.parse(localStorage.getItem(`${name}/unicode-emoji-json/data`)!) as Record<
            string,
            EmojiMeta
        >;
        emojiMeta = new Map(Object.entries(data));
        console.log(`[${name}] emoji meta data loaded.`);
    }
}

async function updateEmojiKeywords(version: string) {
    if (
        localStorage.getItem(`${name}/emojilib/data`) === null ||
        localStorage.getItem(`${name}/emojilib/version`) !== version
    ) {
        const data = (await fetch(`${unpkg.emojiLib}/dist/emoji-en-US.json`).then((res) =>
            res.json()
        )) as Record<string, string[]>;
        for (const [unicode, keywords] of Object.entries(data)) {
            if (!checkTwemoji(unicode)) continue;
            for (const keyword of keywords) {
                if (!emojiKeywords.has(keyword)) emojiKeywords.set(keyword, []);
                if (!emojiKeywords.get(keyword)!.includes(unicode))
                    emojiKeywords.get(keyword)!.push(unicode);
                if (keyword.indexOf('_') !== -1) {
                    const ks = keyword.split('_');
                    for (const k of ks) {
                        if (!emojiKeywords.has(k)) emojiKeywords.set(k, []);
                        if (!emojiKeywords.get(k)!.includes(unicode))
                            emojiKeywords.get(k)!.push(unicode);
                    }
                }
            }
        }
        localStorage.setItem(
            `${name}/emojilib/data`,
            JSON.stringify(Object.fromEntries(emojiKeywords))
        );
        localStorage.setItem(`${name}/emojilib/version`, version);
        console.log(`[${name}] emoji keywords updated.`);
    } else {
        const data = JSON.parse(localStorage.getItem(`${name}/emojilib/data`)!) as Record<
            string,
            string[]
        >;
        emojiKeywords = new Map(Object.entries(data));
        console.log(`[${name}] emoji keywords loaded.`);
    }
}

(async () => {
    const [pkgJson, pkgLib] = await Promise.all([
        fetch(`${unpkg.emojiJson}/package.json`).then((res) => res.json()),
        fetch(`${unpkg.emojiLib}/package.json`).then((res) => res.json())
    ]);
    await Promise.all([updateEmojiMeta(pkgJson.version), updateEmojiKeywords(pkgLib.version)]);
    for (const [unicode, meta] of emojiMeta.entries()) {
        if (!emojiKeywords.has(meta.slug)) emojiKeywords.set(meta.slug, []);
        if (!emojiKeywords.get(meta.slug)!.includes(unicode))
            emojiKeywords.get(meta.slug)!.push(unicode);
        const keywords = meta.slug.split('_');
        for (const keyword of keywords) {
            if (!emojiKeywords.has(keyword)) emojiKeywords.set(keyword, []);
            if (!emojiKeywords.get(keyword)!.includes(unicode))
                emojiKeywords.get(keyword)!.push(unicode);
        }
    }
})();

function sortResult(a: EmojiSearchResult, b: EmojiSearchResult) {
    if (a.hit !== b.hit) return b.hit - a.hit;
    if (a.meta.version < b.meta.version) return -1;
    if (a.meta.version > b.meta.version) return 1;
    if (a.unicode < b.unicode) return -1;
    if (a.unicode > b.unicode) return 1;
    return 0;
}

export function searchEmoji(keyword: string): EmojiSearchResult[] {
    const keywords = keyword.toLowerCase().split(/\s+/);
    const hitRatio = new Map<string, number[]>();
    for (let index = 0; index < keywords.length; index++) {
        const keyword = keywords[index];
        for (const [k, emojis] of emojiKeywords.entries()) {
            if (!k.startsWith(keyword)) continue;
            const ratio = keyword.length / k.length;
            if (ratio < keywordMatchThreshold) continue;
            for (const emoji of emojis) {
                if (!hitRatio.has(emoji)) hitRatio.set(emoji, Array(keywords.length).fill(0));
                if (hitRatio.get(emoji)![index] < ratio) hitRatio.get(emoji)![index] = ratio;
            }
        }
    }
    const results: EmojiSearchResult[] = [];
    const finalThreshold = finalMatchThreshold * keywords.length;
    for (const [unicode, hits] of hitRatio.entries()) {
        const hit = hits.reduce((a, b) => a + b, 0);
        if (hit < finalThreshold) continue;
        results.push({
            unicode,
            meta: emojiMeta.get(unicode)!,
            hit
        });
    }
    return results.sort(sortResult);
}

class EmojiWidget extends WidgetType {
    constructor(public emoji: string) {
        super();
    }
    toDOM(view: EditorView): HTMLElement {
        const span = document.createElement('span');
        span.innerText = this.emoji;
        span.classList.add('cm-emoji');
        span.innerText = this.emoji;
        twemoji.parse(span, {
            folder: 'svg',
            ext: '.svg'
        });
        return span;
    }
}

const decorator = new MatchDecorator({
    regexp: emojiRegex(),
    decoration: (match) => {
        if (!emojiMeta.has(match[0])) return null;
        return Decoration.replace({
            widget: new EmojiWidget(match[0])
        });
    }
});

export const emojiPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
            this.decorations = decorator.createDeco(view);
        }
        update(update: ViewUpdate) {
            this.decorations = decorator.updateDeco(update, this.decorations);
        }
    },
    {
        decorations: (inst) => inst.decorations,
        provide: (plugin) =>
            EditorView.atomicRanges.of((view) => {
                const inst = view.plugin(plugin);
                return inst ? inst.decorations : Decoration.none;
            })
    }
);
