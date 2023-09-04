<script lang="ts">
    import { EditorView } from 'codemirror';
    import {
        ViewPlugin,
        ViewUpdate,
        drawSelection,
        highlightSpecialChars,
        keymap
    } from '@codemirror/view';
    import { markdown } from '@codemirror/lang-markdown';
    import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
    import { tags } from '@lezer/highlight';
    import { onMount, onDestroy } from 'svelte';
    import type { EditorState } from '@codemirror/state';
    import { emojiPlugin } from '$editor/lib/emojis';
    import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';

    export let value: string = '';
    export let state: EditorState | undefined = undefined;
    export let editor: EditorView | undefined = undefined;

    let target: HTMLDivElement;

    let listener = ViewPlugin.fromClass(
        class {
            constructor(view: EditorView) {}

            update(update: ViewUpdate) {
                if (update.docChanged && value != editor!.state.doc.toString()) {
                    value = editor!.state.doc.toString();
                }
            }
        }
    );

    let style = HighlightStyle.define([
        { tag: tags.heading1, class: 'cm-h1' },
        { tag: tags.heading2, class: 'cm-h2' },
        { tag: tags.heading3, class: 'cm-h3' },
        { tag: tags.quote, class: 'cm-quote' },
        { tag: tags.monospace, class: 'cm-code' },
        { tag: tags.processingInstruction, class: 'cm-inst' },
        { tag: tags.link, class: 'cm-link' },
        { tag: tags.emphasis, class: 'cm-emphasis' },
        { tag: tags.strong, class: 'cm-strong' }
    ]);

    $: {
        if (editor && !editor.state.doc.eq(value as any)) {
            editor.dispatch({
                changes: { from: 0, to: editor.state.doc.length, insert: value }
            });
        }
    }

    onMount(() => {
        editor = new EditorView({
            doc: value,
            state,
            extensions: [
                history(),
                markdown({ completeHTMLTags: false }),
                drawSelection(),
                highlightSpecialChars(),
                syntaxHighlighting(style),
                EditorView.lineWrapping,
                keymap.of([...defaultKeymap, ...historyKeymap]),
                listener,
                emojiPlugin
            ],
            parent: target
        });
    });

    onDestroy(() => {
        editor!.destroy();
        editor = undefined;
    });
</script>

<div class="codemirror red-ui-typedInput-container" bind:this={target} />

<style lang="scss">
    .codemirror {
        width: 100%;
        height: 100%;
        max-height: 100%;
        min-height: 100%;
        overflow: auto;

        &:focus-within {
            border-color: var(--red-ui-form-input-focus-color);
        }
        :global(.cm-scroller) {
            overflow: auto;
            padding: 6px;
        }
        :global(.cm-editor) {
            height: 100%;
            width: 100%;
            outline: none !important;
        }
        :global(.cm-content) {
            caret-color: auto !important;
        }
        :global([contenteditable]) {
            border: none;
            outline: none;
            background-color: transparent;
            padding: 0;
            margin-bottom: 0;
        }
        :global(.cm-inst) {
            opacity: 0.6;
        }
        :global(.cm-line) {
            position: relative;
        }
        :global(.cm-h1) {
            color: var(--red-ui-header-text-color);
            font-weight: bold;
        }
        :global(.cm-h2) {
            color: var(--red-ui-header-text-color);
            font-weight: bold;
        }
        :global(.cm-h3) {
            color: var(--red-ui-header-text-color);
            font-weight: bold;
        }
        :global(.cm-line:has(.cm-quote)) {
            margin-left: 8px;
            border-left: 4px solid var(--red-ui-form-input-focus-color);
        }
        :global(.cm-selectionBackground) {
            background-color: var(--red-ui-text-editor-selection-background) !important;
        }
        :global(.cm-code) {
            font-family: var(--red-ui-monospace-font);
            color: var(--red-ui-text-color-code);
        }
        :global(.cm-link) {
            color: var(--red-ui-text-color-link);
        }
        :global(.cm-emphasis) {
            font-style: italic;
        }
        :global(.cm-strong) {
            font-weight: bold;
        }
        :global(.cm-emoji > img) {
            cursor: text;
            height: 1em;
            width: 1em;
            aspect-ratio: 1/1;
            user-select: text;
            display: inline;
            vertical-align: middle;
            margin: 0 0.1em;
            transform: translateY(-0.06em);
        }
    }
</style>
