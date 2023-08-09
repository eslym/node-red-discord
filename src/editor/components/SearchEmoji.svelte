<script>
    import { Input, Collapsible } from 'svelte-integration-red/components';
    import { createEventDispatcher } from 'svelte';
    import { fetchWithCreds as fetch } from '../lib/fetch.js';

    export let clientNode;
    export let load = true;

    let keyword;
    let emojis = [];

    let filteredEmojis = [];

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

    function filterEmojis(emojis, keyword) {
        return emojis
            .map((g) => ({
                ...g,
                emojis: g.emojis.filter((e) => e.name.toLowerCase().includes(keyword.toLowerCase()))
            }))
            .filter((g) => g.emojis.length > 0);
    }

    $: filteredEmojis = filterEmojis(emojis, keyword);

    $: if (load) {
        fetchEmojis(clientNode);
    }
</script>

<Input label="Searh" bind:value={keyword} />
<div class="container">
    {#each filteredEmojis as guild (guild.id)}
        <Collapsible label={guild.name}>
            <svelte:fragment slot="header">
                {#if guild.thumbnail}
                    <img
                        class="guild-thumbnail"
                        src={guild.thumbnail}
                        alt={guild.name}
                        loading="lazy"
                    />
                {/if}
            </svelte:fragment>
            <div class="emoji-box">
                {#each guild.emojis as emoji (emoji.id)}
                    <button on:click={() => dispatch('select', emoji)}>
                        <img src={emoji.url} alt={emoji.name} title={emoji.name} loading="lazy" />
                    </button>
                {/each}
            </div>
        </Collapsible>
    {:else}
        <p style="text-align: center;">No Emoji</p>
    {/each}
</div>

<style>
    .container {
        overflow-y: auto;
        padding: 5px;
    }
    .guild-thumbnail {
        width: 24px;
        height: 24px;
        border-radius: 50%;
    }
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
