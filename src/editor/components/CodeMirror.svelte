<script lang="ts">
    import { EditorView, minimalSetup } from 'codemirror';
    import { ViewPlugin, ViewUpdate } from '@codemirror/view';
    import { markdown } from '@codemirror/lang-markdown';
    import { onMount, onDestroy } from 'svelte';
    import type { EditorState } from '@codemirror/state';
    import { emojiPlugin } from '$editor/lib/emojis';

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
                minimalSetup,
                markdown({}),
                EditorView.lineWrapping,
                listener,
                emojiPlugin
            ],
            parent: target
        });
        state = editor.state;
    });

    onDestroy(() => {
        editor!.destroy();
        editor = undefined;
    });
</script>

<div class="codemirror" bind:this={target} />

<style lang="scss">
    .codemirror {
        width: 100%;
        height: 100%;
        max-height: 100%;
        min-height: 100%;
        overflow: auto;

        :global(.cm-editor) {
            height: 100%;
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
    }
</style>
