<script>
    import { Button, Collapsible, EditableList } from 'svelte-integration-red/components';
    import EmbedBuilder from './EmbedBuilder.svelte';
    import ActionRowBuilder from './ActionRowBuilder.svelte';
    import SearchEmojiPopup from './SearchEmojiPopup.svelte';

    export let msg;

    let ta;
    let showEmoji = false;

    $: if (typeof msg === 'string') {
        msg = {
            content: msg,
            embeds: [],
            components: []
        };
    } else if (msg === undefined) {
        msg = {
            content: '',
            embeds: [],
            components: []
        };
    }
</script>

<Collapsible label="Content">
    <textarea bind:this={ta} bind:value={msg.content} style="width: 100%;" />
    <Button small inline icon="smile-o" label="Insert Emoji" on:click={() => (showEmoji = true)} />
    <SearchEmojiPopup
        bind:showPopup={showEmoji}
        on:select={(e) => {
            let emoji = e.detail;
            let emojiFormat = `<${emoji.animated ? 'a' : ''}:${e.detail.name}:${e.detail.id}>`;
            let newEnd = ta.selectionEnd + emojiFormat.length;
            msg.content =
                msg.content.slice(0, ta.selectionStart) +
                emojiFormat +
                msg.content.slice(ta.selectionEnd);
            ta.selectionStart = newEnd;
            ta.selectionEnd = newEnd;
        }}
    />
</Collapsible>
<Collapsible label="Embeds ({msg.embeds?.length ?? 0})" collapsed>
    <Button
        slot="header"
        small
        inline
        icon="plus"
        label="Add Embed"
        on:click={() => {
            msg.embeds = [...msg.embeds, {}];
        }}
    />
    {#if msg.embeds && msg.embeds.length > 0}
        <EditableList bind:elements={msg.embeds} minHeight="0" maxHeight="auto" sortable let:index>
            <Collapsible label={msg.embeds[index].title || `Embed ${index + 1}`} collapsed>
                <Button
                    slot="header"
                    small
                    inline
                    icon="times"
                    on:click={() => {
                        msg.embeds.splice(index, 1);
                        msg.embeds = msg.embeds;
                    }}
                />
                <EmbedBuilder bind:embed={msg.embeds[index]} />
            </Collapsible>
        </EditableList>
    {:else}
        <p style="text-align: center;">No embeds</p>
    {/if}
</Collapsible>
<Collapsible
    label="Components ({msg.components?.length ?? 0} row{msg.components?.length > 1 ? 's' : ''})"
    collapsed
>
    <Button
        slot="header"
        small
        inline
        icon="plus"
        label="Add Row"
        on:click={() => {
            msg.components = [...msg.components, []];
        }}
    />
    {#if msg.components.length > 0}
        <EditableList
            sortable
            minHeight="0"
            maxHeight="auto"
            bind:elements={msg.components}
            let:index
        >
            <ActionRowBuilder bind:row={msg.components[index]}>
                <Button
                    slot="header"
                    small
                    inline
                    icon="times"
                    on:click={() => {
                        msg.components.splice(index, 1);
                        msg.components = msg.components;
                    }}
                />
            </ActionRowBuilder>
        </EditableList>
    {:else}
        <span style="text-align: center;">No Components</span>
    {/if}
</Collapsible>
