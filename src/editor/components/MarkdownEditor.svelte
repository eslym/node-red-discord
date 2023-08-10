<script>
    import { onMount, onDestroy } from 'svelte';

    export let value;
    export let session = undefined;

    /** @type {AceAjax.Editor} */
    let editor;
    let container;

    $: if (editor && editor.getValue() !== value) {
        editor.setValue(value);
    }

    onMount(() => {
        editor = RED.editor.createEditor({
            element: container,
            mode: 'ace/mode/markdown',
            value
        });
        editor.onDocumentChange(() => {
            value = editor.getValue();
        });
        if (session) {
            editor.setSession(session);
        } else {
            session = editor.getSession();
        }
    });

    onDestroy(() => {
        editor.destroy();
    });
</script>

<div bind:this={container} class="node-text-editor" />

<style>
    div {
        height: var(--editor-height, 250px);
        min-height: var(--editor-min-height, 250px);
    }
</style>
