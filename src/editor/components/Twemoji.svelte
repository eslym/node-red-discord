<script lang="ts">
    import twemoji from 'https://unpkg.com/twemoji@latest/dist/twemoji.esm.js';

    export let unicode: string;

    $: html = twemoji.parse(unicode, {
        folder: 'svg',
        ext: '.svg'
    });
</script>

<div>{@html html}</div>

<style>
    div {
        display: contents;
    }
</style>
