<script>
    import { Button, Collapsible } from 'svelte-integration-red/components';
    import EmbedBuilder from './EmbedBuilder.svelte';
    import ActionRowBuilder from './ActionRowBuilder.svelte';
    import SearchEmojiPopup from './SearchEmojiPopup.svelte';
    import { accessor } from '../lib/accessor';
    import EditList from './EditList.svelte';

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
            msg.embeds = [
                ...msg.embeds,
                {
                    fields: [],
                    author: {},
                    footer: {}
                }
            ];
        }}
    />
    <EditList
        bind:elements={msg.embeds}
        elementLabel={(index) => msg.embeds[index].title || `Embed ${index + 1}`}
        let:index
    >
        <EmbedBuilder bind:embed={msg.embeds[index]} />
    </EditList>
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
    <EditList bind:elements={msg.components} elementLabel="Row" let:index>
        <svelte:fragment slot="action" let:element={row} let:index>
            <Button
                icon="plus"
                label="Add Component"
                small
                inline
                disabled={row.length > 0 && (row.length >= 5 || row[0].type !== 2)}
                on:click={() => {
                    msg.components[index] = [
                        ...(msg.components[index] ?? []),
                        { type: 2, style: 1 }
                    ];
                }}
            />
        </svelte:fragment>
        <ActionRowBuilder row={accessor(msg.components, index)} />
    </EditList>
</Collapsible>
