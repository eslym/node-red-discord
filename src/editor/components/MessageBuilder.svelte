<script context="module">
    export function newRecord() {
        return {
            content: '',
            embeds: [],
            components: [],
            attachments: []
        };
    }
</script>

<script>
    import { Button, Collapsible } from 'svelte-integration-red/components';
    import EmbedBuilder, { newRecord as newEmbed } from './EmbedBuilder.svelte';
    import ActionRowBuilder, { newComponent } from './ActionRowBuilder.svelte';
    import EditList from './EditList.svelte';
    import { emojiTray } from '$editor/lib/tray';
    import { formatEmoji } from '$editor/lib/utils';

    export let msg;

    let ta;

    const openTray = emojiTray();

    function insertEmoji() {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        openTray().then((emoji) => {
            if (!emoji) return;
            msg.content = msg.content.slice(0, start) + formatEmoji(emoji) + msg.content.slice(end);
        });
    }

    $: if (typeof msg === 'string') {
        msg = {
            content: msg,
            embeds: [],
            components: [],
            attachments: []
        };
    } else if (msg === undefined) {
        msg = newRecord();
    }
</script>

<Collapsible label="Content">
    <textarea bind:this={ta} bind:value={msg.content} style="width: 100%;" />
    <Button small inline icon="smile-o" label="Insert Emoji" on:click={insertEmoji} />
</Collapsible>
<Collapsible label="Embeds ({msg.embeds?.length ?? 0})" collapsed>
    <Button
        slot="header"
        small
        inline
        icon="plus"
        label="Add Embed"
        on:click={() => {
            msg.embeds = [...msg.embeds, newEmbed()];
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
                    msg.components[index] = [...(msg.components[index] ?? []), newComponent()];
                }}
            />
        </svelte:fragment>
        <ActionRowBuilder bind:row={msg.components[index]} />
    </EditList>
</Collapsible>
