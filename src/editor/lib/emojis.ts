import {
    Decoration,
    EditorView,
    MatchDecorator,
    ViewPlugin,
    WidgetType,
    type DecorationSet,
    ViewUpdate
} from '@codemirror/view';
export * from './emoji/database';

import twemoji from 'https://unpkg.com/twemoji@latest/dist/twemoji.esm.js';
import emojiRegex from 'https://unpkg.com/emoji-regex@latest/index.mjs';

class EmojiWidget extends WidgetType {
    constructor(public emoji: string) {
        super();
    }
    toDOM(_: EditorView): HTMLElement {
        const span = document.createElement('span');
        span.innerText = this.emoji;
        span.classList.add('cm-emoji');
        span.innerText = this.emoji;
        twemoji.parse(span);
        return span;
    }
}

const decorator = new MatchDecorator({
    regexp: emojiRegex(),
    decoration: (match) => {
        if (twemoji.replace(match[0], () => '').length !== 0) return null;
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
