<script>
    import { Input } from 'svelte-integration-red/components';
    import { createEventDispatcher } from 'svelte';

    export let clientNode;

    let keyword;
    let emojis = [];

    const dispatch = createEventDispatcher();

    async function fetchEmojis(node) {
        if (!node) {
            emojis = [];
            return;
        }
        let res = await fetch(`/discord/${node}/emojis`);
        if (!res.ok) {
            emojis = [];
            return;
        }
        emojis = await res.json();
    }

    $: fetchEmojis(clientNode);
</script>

<Input label="Searh" bind:value={keyword} />
<div class="emoji-box">
    {#each emojis.filter((e) => e.name.toLowerCase().includes(keyword.toLowerCase())) as emoji}
        <button on:click={() => dispatch('select', emoji)}>
            <img src={emoji.url} alt={emoji.name} title={emoji.name} />
        </button>
    {:else}
        <p style="text-align: center;">No Emoji</p>
    {/each}
</div>

<style>
    .emoji-box {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 5px;
    }
    .emoji-box::after {
        content: '';
        flex: auto;
    }
    .emoji-box button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
    }
    .emoji-box img {
        width: 48px;
        height: 48px;
    }
</style>
