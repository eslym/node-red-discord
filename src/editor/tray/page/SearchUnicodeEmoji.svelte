<script lang="ts">
    import Twemoji from '$editor/components/Twemoji.svelte';
    import { searchEmoji, type EmojiSearchResult, type EmojiMeta } from '$editor/lib/emojis';
    import { Input } from '@eslym/rs4r/components';
    import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
    import { createEventDispatcher } from 'svelte';
    import Fa from 'svelte-fa/src/fa';

    const dispatch = createEventDispatcher<{
        select: { unicode: string };
    }>();

    let keyword = '';
    let showVariants: {
        unicode: string;
        meta: Omit<EmojiMeta, 'variants'> & { variants: string[] };
    };
    let variantPanel: HTMLDivElement | undefined = undefined;
    let panelStyle = '';

    $: filteredEmojis = searchEmoji(keyword);

    function select(emoji: EmojiSearchResult | { unicode: string }, ev: MouseEvent) {
        if (showVariants) {
            showVariants = undefined as any;
        }
        if ('meta' in emoji && emoji.meta.variants) {
            const btn = ev.target as HTMLButtonElement;
            const rect = btn.getBoundingClientRect();
            panelStyle = `top: ${rect.top - 6}px; left: ${rect.left - 6}px;`;
            showVariants = emoji as any;
            return;
        }
        dispatch('select', { unicode: emoji.unicode! });
    }

    function updateFocus() {
        if (!showVariants) return;
        if (!variantPanel?.matches?.(':focus-within')) {
            showVariants = undefined as any;
        }
    }
</script>

<svelte:head>
    <link rel="preconnect" href="https://cdn.jsdelivr.net" />
</svelte:head>

<svelte:window on:focusin={updateFocus} />

<div class="dc-emoji-search">
    <Input label="Search" bind:value={keyword} />
    <div class="dc-emoji-search-result">
        <div class="dc-emoji-list">
            {#each filteredEmojis as emoji (emoji.unicode)}
                <button type="button" title={emoji.meta.name} on:click={(ev) => select(emoji, ev)}>
                    <Twemoji unicode={emoji.unicode} />
                    {#if emoji.meta.variants}
                        <span class="dc-emoji-expand"><Fa icon={faCaretDown} /></span>
                    {/if}
                </button>
            {/each}
        </div>
    </div>
</div>

{#if showVariants}
    <div bind:this={variantPanel} class="red-ui-popover-panel dc-emoji-list" style={panelStyle}>
        <button type="button" on:click={(ev) => select(showVariants, ev)}>
            <Twemoji unicode={showVariants.unicode} />
        </button>
        {#each showVariants.meta.variants as unicode (unicode)}
            <button type="button" on:click={(ev) => select({ unicode }, ev)}>
                <Twemoji {unicode} />
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

            :global(img) {
                width: 32px;
                height: 32px;
            }

            .dc-emoji-expand {
                pointer-events: none;
                position: absolute;
                bottom: -8px;
                right: -2px;
                filter: drop-shadow(-3px -3px 6px var(--red-ui-primary-background));
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
