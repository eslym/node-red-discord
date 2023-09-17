<script lang="ts">
    import Tabs from '$editor/components/Tabs.svelte';
    import SearchUnicodeEmoji from './page/SearchUnicodeEmoji.svelte';
    import SearchGuildEmoji from './page/SearchGuildEmoji.svelte';

    type EmojiData = { id: string; name: string; animated?: boolean } | { unicode: string };

    export let onSelect: (emoji: EmojiData) => void;

    let activeTab: string;

    function selected(ev: CustomEvent<EmojiData>) {
        RED.tray.close();
        onSelect(ev.detail);
    }
</script>

<div class="rs4r-container">
    <Tabs tabs={['Guild Emoji', 'Unicode Emoji']} bind:activeTab />
    <div class="rs4r-tab-pages">
        <div class="rs4r-tab-page" class:active={activeTab === 'Guild Emoji'}>
            <SearchGuildEmoji on:select={selected} />
        </div>
        <div class="rs4r-tab-page" class:active={activeTab === 'Unicode Emoji'}>
            <SearchUnicodeEmoji on:select={selected} />
        </div>
    </div>
</div>

<style lang="scss">
    .rs4r-container {
        display: flex;
        flex-direction: column;
        height: 100%;

        .rs4r-tab-pages {
            flex-grow: 1;
            height: 0;
            width: 100%;
        }

        .rs4r-tab-page {
            display: none;
            box-sizing: border-box;
            height: 100%;
            padding: 8px;
            background-color: var(--red-ui-tab-background);
            border-left: 1px solid var(--red-ui-primary-border-color);
            border-right: 1px solid var(--red-ui-primary-border-color);
            border-bottom: 1px solid var(--red-ui-primary-border-color);
        }

        .rs4r-tab-page.active {
            display: block;
        }
    }
</style>
