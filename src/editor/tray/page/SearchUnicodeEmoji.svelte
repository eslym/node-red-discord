<script lang="ts" context="module">
    import Collapsible from '$editor/components/Collapsible.svelte';
    import { Input } from '@eslym/rs4r/components';
    import { createEventDispatcher } from 'svelte';
    import emojiJson from '$editor/assets/emojis.json?red-res';

    interface Emoji {
        unicode: string;
        codepoint: string;
        name: string;
        slug: string;
        variants?: { unicode: string; codepoint: string }[];
    }

    let emojiDatabase: { name: string; emojis: Emoji[] }[] = [];

    (async () => {
        const res = await fetch(emojiJson);
        if (!res.ok) return;
        emojiDatabase = await res.json();
    })();

    function getTwemoji(codePoint: string) {
        return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoint}.svg`;
    }
</script>

<script lang="ts">
    const dispatch = createEventDispatcher<{
        select: { unicode: string };
    }>();

    let keyword = '';
    let activeGroup = '';
    let showVariants: Emoji | undefined;
    let variantPanel: HTMLDivElement | undefined = undefined;
    let panelStyle = '';

    $: filteredEmojis = filterEmojis(keyword);

    function filterEmojis(keyword: string) {
        const emojis = emojiDatabase
            .map((group) => ({
                name: group.name,
                emojis: group.emojis.filter(
                    (emoji) => emoji.name.includes(keyword) || emoji.slug.includes(keyword)
                )
            }))
            .filter((group) => group.emojis.length > 0);
        activeGroup = emojis[0]?.name ?? '';
        return emojis;
    }

    function select(emoji: Partial<Emoji>, ev: MouseEvent) {
        if (showVariants) {
            showVariants = undefined;
        }
        if (emoji.variants) {
            const btn = ev.target as HTMLButtonElement;
            const rect = btn.getBoundingClientRect();
            panelStyle = `top: ${rect.top - 5}px; left: ${rect.left - 5}px;`;
            showVariants = emoji as Emoji;
            return;
        }
        dispatch('select', { unicode: emoji.unicode! });
    }
</script>

<svelte:window
    on:focusin={() => {
        if (!showVariants) return;
        if (!variantPanel?.matches?.(':focus-within')) {
            showVariants = undefined;
        }
    }}
/>

<div class="dc-emoji-search">
    <Input label="Search" bind:value={keyword} />
    <div class="dc-emoji-search-result">
        {#each filteredEmojis as group, index (group.name)}
            <Collapsible
                on:header-click={(ev) => {
                    ev.preventDefault();
                    if (activeGroup === group.name) activeGroup = '';
                    else activeGroup = group.name;
                }}
                expand={activeGroup === group.name}
            >
                <svelte:fragment slot="header">
                    <span class="dc-guild-name">{group.name}</span>
                </svelte:fragment>
                <div class="dc-emoji-list">
                    {#each group.emojis as emoji (emoji.slug)}
                        <button
                            type="button"
                            title={emoji.name}
                            on:click={(ev) => select(emoji, ev)}
                        >
                            <img
                                src={getTwemoji(emoji.codepoint)}
                                alt={emoji.unicode}
                                title={emoji.slug}
                                loading="lazy"
                                width="32"
                                height="32"
                            />
                        </button>
                    {/each}
                </div>
            </Collapsible>
        {/each}
    </div>
</div>

{#if showVariants && showVariants.variants}
    <div bind:this={variantPanel} class="red-ui-popover-panel dc-emoji-list" style={panelStyle}>
        <button type="button" on:click={(ev) => select({ unicode: showVariants?.unicode }, ev)}>
            <img
                src={getTwemoji(showVariants.codepoint)}
                alt={showVariants.unicode}
                loading="lazy"
                width="32"
                height="32"
            />
        </button>
        {#each showVariants.variants as emoji (emoji.unicode)}
            <button type="button" on:click={(ev) => select(emoji, ev)}>
                <img
                    src={getTwemoji(emoji.codepoint)}
                    alt={emoji.unicode}
                    loading="lazy"
                    width="32"
                    height="32"
                />
            </button>
        {/each}
    </div>
{/if}

<style lang="scss">
    .dc-emoji-search {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        .dc-emoji-search-result {
            height: 0;
            margin-top: 15px;
            flex-grow: 1;
            overflow-y: auto;
        }
    }
    .dc-guild-name {
        display: block;
    }
    .dc-emoji-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        column-gap: 5px;
        row-gap: 3px;

        button {
            position: relative;
            border: none;
            background: none;
            padding: 0;
            margin: 0;
            outline-color: var(--red-ui-form-input-focus-color);

            img {
                width: 32px;
                height: 32px;
            }
        }
    }

    .red-ui-popover-panel {
        display: flex;
        position: fixed;
        box-sizing: border-box;
        overflow: auto;
        box-shadow: 1px 1px 4px var(--red-ui-shadow);
        font-family: var(--red-ui-primary-font);
        font-size: var(--red-ui-primary-font-size);
        border: 1px solid var(--red-ui-primary-border-color);
        background: var(--red-ui-secondary-background);
        z-index: 2000;
        padding: 5px;
    }
</style>
