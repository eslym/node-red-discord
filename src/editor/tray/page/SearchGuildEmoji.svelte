<script lang="ts">
    import Collapsible from '$editor/components/Collapsible.svelte';
    import { clientNodeContextKey } from '$editor/lib/constants';
    import { fetch } from '$editor/lib/fetch';
    import { Input } from '@eslym/rs4r/components';
    import type { EditorNodeInstance } from 'node-red';
    import { createEventDispatcher, getContext } from 'svelte';
    import { writable, type Writable } from 'svelte/store';

    const clientNodeContext = getContext<Writable<string>>(clientNodeContextKey) ?? writable('');
    const dispatch = createEventDispatcher<{
        select: { id: string; name: string; animated?: boolean };
    }>();

    let keyword = '';
    let localClient = '';
    let emojiList: Record<
        string,
        {
            id: string;
            name: string;
            thumbnail?: string;
            expand?: boolean;
            emojis: {
                id: string;
                name: string;
                url: string;
                animated?: boolean;
            }[];
        }
    > = {};

    let availableClients: EditorNodeInstance[] = [];

    RED.nodes.eachConfig(((c: EditorNodeInstance) => {
        if (c.type === 'discord.client') {
            availableClients.push(c);
        }
    }) as any);

    if (availableClients.length > 0) {
        localClient = availableClients[0].id;
    }

    $: fetchEmojis($clientNodeContext || localClient);
    $: filteredEmojis = searchEmoji(keyword, emojiList);

    function getName(id: string) {
        return RED.utils.getNodeLabel(RED.nodes.node(id) as any);
    }

    async function fetchEmojis(selectedClient: string) {
        emojiList = {};
        keyword = '';
        if (!selectedClient) return;
        const res = await fetch(`/discord/${selectedClient}/emojis`);
        if (!res.ok) return;
        emojiList = await res.json();
        const guilds = Object.values(emojiList);
        for (const guild of guilds) {
            guild.expand = false;
        }
        guilds[0].expand = true;
    }

    function searchEmoji(keyword: string, ..._: any) {
        return Object.values(emojiList)
            .map((guild) => ({
                ...guild,
                emojis: guild.emojis.filter((emoji) => emoji.name.includes(keyword))
            }))
            .filter((guild) => guild.emojis.length > 0);
    }
</script>

<div class="dc-emoji-search">
    {#if !$clientNodeContext}
        <Input label="Search From" bind:value={localClient} type="select">
            {#each availableClients as client (client.id)}
                <option value={client.id}>{getName(client.id)}</option>
            {/each}
        </Input>
    {/if}
    <Input label="Search" bind:value={keyword} />
    <div class="dc-emoji-search-result">
        {#each filteredEmojis as guild (guild.id)}
            <Collapsible bind:expand={emojiList[guild.id].expand}>
                <svelte:fragment slot="header">
                    <span class="dc-guild-name">{guild.name}</span>
                    {#if guild.thumbnail}
                        <img
                            class="dc-guild-thumbnail"
                            src={guild.thumbnail}
                            alt={guild.name}
                            width="32px"
                            height="32px"
                        />
                    {/if}
                </svelte:fragment>
                <div class="dc-emoji-list">
                    {#each guild.emojis as emoji (emoji.id)}
                        <button
                            type="button"
                            title={emoji.name}
                            on:click={() => dispatch('select', emoji)}
                        >
                            <img src={emoji.url} alt={emoji.name} loading="lazy" />
                        </button>
                    {/each}
                </div>
            </Collapsible>
        {/each}
    </div>
</div>

<style lang="scss">
    .dc-emoji-search {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        .dc-emoji-search-result {
            height: 0;
            flex-grow: 1;
            overflow-y: auto;
        }
    }
    .dc-guild-name {
        display: block;
        line-height: 32px;
        font-size: 1.2em;
    }
    .dc-guild-thumbnail {
        margin-left: auto;
        border-radius: 50%;
        width: 32px;
        height: 32px;
    }
    .dc-emoji-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        column-gap: 5px;
        row-gap: 3px;

        button {
            border: none;
            background: none;
            padding: 0;
            margin: 0;
            outline-color: var(--red-ui-form-input-focus-color);

            img {
                width: 48px;
                height: 48px;
            }
        }
    }
</style>
