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
        }

        .rs4r-tab-page {
            display: none;
            width: 100%;
            height: 100%;
        }

        .rs4r-tab-page.active {
            display: block;
        }
    }
</style>
