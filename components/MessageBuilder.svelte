<script>
    import {
        Button,
        Textarea,
        Collapsible,
        EditableList,
        Input
    } from 'svelte-integration-red/components';
    import EmbedBuilder from './EmbedBuilder.svelte';

    export let msg;

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
    <Textarea bind:value={msg.content} />
</Collapsible>
<Collapsible label="Embeds" collapsed>
    <EditableList bind:elements={msg.embeds} sortable removable let:index>
        <EmbedBuilder bind:embed={msg.embeds[index]} {index} />
    </EditableList>
    <Button
        icon="plus"
        label="Add Embed"
        on:click={() => {
            msg.embeds = [...msg.embeds, {}];
        }}
    />
</Collapsible>
