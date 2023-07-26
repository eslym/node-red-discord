<script>
    import { Button, Textarea, Collapsible, EditableList } from 'svelte-integration-red/components';
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
