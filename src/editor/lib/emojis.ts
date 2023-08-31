import emojiJson from '$editor/assets/emojis.json?red-res';
import {
    Decoration,
    EditorView,
    MatchDecorator,
    ViewPlugin,
    WidgetType,
    type DecorationSet,
    ViewUpdate
} from '@codemirror/view';
import { writable, type Writable } from 'svelte/store';

export interface Emoji {
    unicode: string;
    codepoint: string;
    name: string;
    slug: string;
    variants?: { unicode: string; codepoint: string }[];
}

export const emojiDatabase: Writable<{ name: string; emojis: Emoji[] }[]> = writable([]);
export const availableTwemojis = new Map<string, string>();

(async () => {
    const res = await fetch(emojiJson);
    if (!res.ok) return;
    const groups: { name: string; emojis: Emoji[] }[] = await res.json();
    groups.forEach((group) => {
        group.emojis.forEach((emoji) => {
            availableTwemojis.set(emoji.unicode, emoji.codepoint);
            if (emoji.variants) {
                emoji.variants.forEach((variant) => {
                    availableTwemojis.set(variant.unicode, variant.codepoint);
                });
            }
        });
    });
    emojiDatabase.set(groups);
})();

export function getTwemoji(codePoint: string) {
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoint}.svg`;
}

class EmojiWidget extends WidgetType {
    constructor(public emoji: string) {
        super();
    }
    toDOM(view: EditorView): HTMLElement {
        const img = document.createElement('img');
        img.src = getTwemoji(availableTwemojis.get(this.emoji)!);
        img.draggable = false;
        img.alt = this.emoji;
        const span = document.createElement('span');
        span.classList.add('cm-emoji');
        span.appendChild(img);
        return span;
    }
}

const decorator = new MatchDecorator({
    regexp: /\p{Emoji_Presentation}/gu,
    decoration: (match) => {
        if (!availableTwemojis.has(match[0])) return null;
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
