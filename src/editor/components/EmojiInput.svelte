<script>
    import { getContext } from 'svelte';
    import { writable } from 'svelte/store';
    import { Row, Button } from 'svelte-integration-red/components';
    import TypedInput from './TypedInput.svelte';
    import { undefinedType, clientNodeContextKey } from '../lib/constants';
    import { fetchWithCreds as fetch } from '../lib/fetch.js';
    import { emojiTray } from '$editor/lib/tray';
    import { formatEmoji, parseEmoji } from '$shared/emoji';

    const searchEmoji = emojiTray();

    const unicodeType = {
        value: 'unicode',
        label: 'Unicode Emoji',
        hasValue: true,
        icon: 'fa-smile-o'
    };

    const emojiType = {
        value: 'guild',
        label: 'Guild Emoji',
        hasValue: true,
        icon: 'fa-list'
    };

    export let emoji;
    export let label = undefined;

    $: if (typeof emoji !== 'object') emoji = { type: 'undefined', value: undefined };

    /** @type {import('svelte/store').Readable<string>} */
    let clientNode = getContext(clientNodeContextKey) ?? writable(undefined);

    /** @param {string} emoji */
    async function getEmoji(emoji) {
        if (!emoji) return null;
        let e = parseEmoji(emoji);
        if (!e) return null;
        let res = await fetch(`/discord/${$clientNode}/emojis/${e.id}`);
        if (!res.ok) return null;
        return res.json();
    }
</script>

<Row>
    <TypedInput
        inline
        {label}
        bind:data={emoji}
        default={{ type: 'undefined', value: undefined }}
        types={[undefinedType, unicodeType, emojiType]}
    />
    {#if $clientNode && emoji.type === 'guild' && emoji.value}
        {#await getEmoji(emoji.value) then e}
            {#if e}
                <img style="width:32px;height:32px" src={e.url} alt={e.name} />
            {/if}
        {/await}
    {/if}
    {#if emoji.type === 'guild'}
        <Button
            icon="search"
            on:click={() => {
                searchEmoji().then((res) => {
                    if (res) emoji.value = formatEmoji(res);
                });
            }}
        />
    {/if}
</Row>
