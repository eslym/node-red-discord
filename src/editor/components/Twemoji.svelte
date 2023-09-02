<script lang="ts">
    import twemoji from 'https://unpkg.com/twemoji@latest/dist/twemoji.esm.js';
    import type { TwemojiOptions } from 'twemoji';

    export let unicode: string;
    export let options: TwemojiOptions | undefined = undefined;

    $: html = twemoji.parse(unicode, options);
</script>

{@html html}
