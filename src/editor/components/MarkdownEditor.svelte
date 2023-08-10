<script>
    import { onMount, onDestroy } from 'svelte';

    export let value;
    export let session = undefined;

    /** @type {AceAjax.Editor} */
    export let editor;

    /** @type {HTMLDivElement} */
    let container;

    let _height = 0;
    let _width = 0;

    $: if (editor && (_height || _width)) {
        container.style.width = `${_width}px`;
        container.style.height = `${_height - 10}px`;
        editor.resize();
    }

    $: if (editor && editor.getValue() !== value) {
        editor.setValue(value);
    }

    onMount(() => {
        editor = RED.editor.createEditor({
            element: container,
            mode: 'ace/mode/markdown',
            expandable: false,
            useWrapMode: true,
            wordWrap: 'on',
            value: value
        });
        session = editor.getSession();
        editor.on('change', () => {
            if (value !== editor.getValue()) {
                value = editor.getValue();
            }
        });
        editor.resize();
    });

    onDestroy(() => {
        editor.destroy();
    });
</script>

<div class="wrapper" bind:clientHeight={_height} bind:clientWidth={_width}>
    <div bind:this={container} class="node-text-editor" />
</div>

<style>
    div.node-text-editor {
        width: 100%;
    }
    div.wrapper {
        height: var(--editor-height, 250px);
        width: 100%;
        min-height: var(--editor-min-height, 250px);
        resize: var(--editor-resize, vertical);
        overflow: hidden;
        padding-bottom: 10px;
    }
</style>
