<script>
    import { onMount, onDestroy } from 'svelte';

    export let value;

    /** @type {AceAjax.Editor} */
    export let editor;

    export let resizable = true;

    /** @type {HTMLDivElement} */
    let container;

    let _height = 0;
    let _width = 0;

    $: if (editor && (_height || _width)) {
        container.style.width = `${_width}px`;
        container.style.height = resizable ? `${_height - 10}px` : `${_height}px`;
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

<div
    class="wrapper"
    style={resizable ? 'padding-bottom:10px;resize:vertical;' : ''}
    bind:clientHeight={_height}
    bind:clientWidth={_width}
>
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
        overflow: hidden;
    }
</style>
