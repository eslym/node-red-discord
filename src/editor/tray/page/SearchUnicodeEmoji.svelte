<script lang="ts" context="module">
    import Collapsible from '$editor/components/Collapsible.svelte';
    import { Input } from '@eslym/rs4r/components';
    import { createEventDispatcher } from 'svelte';

    interface Emoji {
        emoji: string;
        skin_tone_support: boolean;
        slug: string;
        name: string;
        error: boolean;
    }

    let emojiDatabase: Record<string, Emoji[]> = {};

    const toneModifiers = [127995, 127996, 127997, 127998, 127999].map((i) =>
        String.fromCharCode(i)
    );

    (async () => {
        const res = await fetch('https://unpkg.com/unicode-emoji-json@latest/data-by-group.json');
        if (!res.ok) return;
        emojiDatabase = await res.json();
    })();

    function getTwemoji(codePoint: string) {
        return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoint}.svg`;
    }
</script>

<script lang="ts">
    import { toCodePoint } from '$shared/emoji';

    const dispatch = createEventDispatcher<{
        select: { unicode: string };
    }>();

    let keyword = '';

    $: filteredEmojis = filterEmojis(keyword);

    function filterEmojis(keyword: string) {
        return Object.entries(emojiDatabase)
            .map(([key, emojis]) => ({
                name: key,
                emojis: emojis.filter((emoji) => emoji.name.includes(keyword) && !emoji.error)
            }))
            .filter((group) => group.emojis.length > 0);
    }

    function select(emoji: Emoji) {
        dispatch('select', { unicode: emoji.emoji });
    }

    function twemojiNotFound(ev: Event, emoji: Emoji) {
        emoji.error = true;
        (ev.target as any).parentElement.style.display = 'none';
    }
</script>

<div class="dc-emoji-search">
    <Input label="Search" bind:value={keyword} />
    <div class="dc-emoji-search-result">
        {#each filteredEmojis as group, index (group.name)}
            <Collapsible expand={index < 2}>
                <svelte:fragment slot="header">
                    <span class="dc-guild-name">{group.name}</span>
                </svelte:fragment>
                <div class="dc-emoji-list">
                    {#each group.emojis as emoji (emoji.slug)}
                        <button type="button" title={emoji.name} on:click={() => select(emoji)}>
                            <img
                                src={getTwemoji(toCodePoint(emoji.emoji))}
                                alt={emoji.emoji}
                                title={emoji.slug}
                                loading="lazy"
                                width="48px"
                                height="48px"
                                on:error={(ev) => twemojiNotFound(ev, emoji)}
                            />
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
